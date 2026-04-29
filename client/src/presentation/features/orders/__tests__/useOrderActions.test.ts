/**
 * Tests for useOrderActions hook covering:
 * - Successful order placement
 * - Error handling and state updates
 * - Loading state transitions
 */
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useOrderActions } from '../hooks/useOrderActions';
import { OrderContext } from '../context/OrderContext';
import type { IOrderService } from '@/domain/interfaces/order/IOrderService';
import type { Order } from '@/domain/models/types';

// httpClientFactory uses import.meta which Jest doesn't support — mock it out
jest.mock('@/infrastructure/utils/http/httpClientFactory', () => ({
  createHttpClient: jest.fn(),
}));

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    items: [{ menuItemId: 'item-1', name: 'Burger', price: 9.99, quantity: 1 }],
    deliveryDetails: { name: 'Jane', address: '123 St', phone: '9876543210' },
    totalPrice: 9.99,
    status: 'Order Received',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeService(overrides: Partial<IOrderService> = {}): IOrderService {
  return {
    getAllOrders: jest.fn().mockResolvedValue([]),
    getOrder:    jest.fn().mockResolvedValue(makeOrder()),
    submitOrder: jest.fn().mockResolvedValue(makeOrder()),
    ...overrides,
  };
}

function makeWrapper(service: IOrderService) {
  const setOrders  = jest.fn();
  const setLoading = jest.fn();
  const setError   = jest.fn();

  const contextValue = {
    orderService: service,
    orders: [],
    loading: false,
    error: null,
    setOrders,
    setLoading,
    setError,
    markDeliveredNotified: jest.fn(),
    isDeliveredNotified:   jest.fn().mockReturnValue(false),
  };

  return {
    setOrders,
    setLoading,
    setError,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(OrderContext.Provider, { value: contextValue }, children),
  };
}

const validItems    = [{ menuItemId: 'item-1', quantity: 2 }];
const validDelivery = { name: 'Jane', address: '123 St', phone: '9876543210' };

describe('useOrderActions', () => {
  describe('placeOrder — success', () => {
    it('calls orderService.submitOrder with correct args', async () => {
      const service = makeService();
      const { wrapper } = makeWrapper(service);
      const { result } = renderHook(() => useOrderActions(), { wrapper });

      await act(async () => {
        await result.current.placeOrder(validItems, validDelivery);
      });

      expect(service.submitOrder).toHaveBeenCalledWith(validItems, validDelivery);
    });

    it('returns the order from the service', async () => {
      const order   = makeOrder({ id: 'order-42' });
      const service = makeService({ submitOrder: jest.fn().mockResolvedValue(order) });
      const { wrapper } = makeWrapper(service);
      const { result } = renderHook(() => useOrderActions(), { wrapper });

      let returned: Order | undefined;
      await act(async () => {
        returned = await result.current.placeOrder(validItems, validDelivery);
      });

      expect(returned?.id).toBe('order-42');
    });

    it('calls setLoading(true) then setLoading(false)', async () => {
      const service = makeService();
      const { wrapper, setLoading } = makeWrapper(service);
      const { result } = renderHook(() => useOrderActions(), { wrapper });

      await act(async () => {
        await result.current.placeOrder(validItems, validDelivery);
      });

      expect(setLoading).toHaveBeenNthCalledWith(1, true);
      expect(setLoading).toHaveBeenNthCalledWith(2, false);
    });

    it('calls setOrders to append the new order', async () => {
      const order   = makeOrder();
      const service = makeService({ submitOrder: jest.fn().mockResolvedValue(order) });
      const { wrapper, setOrders } = makeWrapper(service);
      const { result } = renderHook(() => useOrderActions(), { wrapper });

      await act(async () => {
        await result.current.placeOrder(validItems, validDelivery);
      });

      expect(setOrders).toHaveBeenCalledTimes(1);
      // setOrders receives a function — verify it appends correctly
      const updater = (setOrders as jest.Mock).mock.calls[0][0];
      expect(updater([])).toEqual([order]);
    });

    it('clears error on success', async () => {
      const service = makeService();
      const { wrapper, setError } = makeWrapper(service);
      const { result } = renderHook(() => useOrderActions(), { wrapper });

      await act(async () => {
        await result.current.placeOrder(validItems, validDelivery);
      });

      expect(setError).toHaveBeenCalledWith(null);
    });
  });

  describe('placeOrder — failure', () => {
    it('calls setError with the error message on failure', async () => {
      const service = makeService({
        submitOrder: jest.fn().mockRejectedValue(new Error('Server down')),
      });
      const { wrapper, setError } = makeWrapper(service);
      const { result } = renderHook(() => useOrderActions(), { wrapper });

      await act(async () => {
        await expect(result.current.placeOrder(validItems, validDelivery)).rejects.toThrow('Server down');
      });

      expect(setError).toHaveBeenCalledWith('Server down');
    });

    it('still calls setLoading(false) after failure', async () => {
      const service = makeService({
        submitOrder: jest.fn().mockRejectedValue(new Error('fail')),
      });
      const { wrapper, setLoading } = makeWrapper(service);
      const { result } = renderHook(() => useOrderActions(), { wrapper });

      await act(async () => {
        await result.current.placeOrder(validItems, validDelivery).catch(() => {});
      });

      expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it('re-throws the error so callers can handle it', async () => {
      const service = makeService({
        submitOrder: jest.fn().mockRejectedValue(new Error('boom')),
      });
      const { wrapper } = makeWrapper(service);
      const { result } = renderHook(() => useOrderActions(), { wrapper });

      await act(async () => {
        await expect(result.current.placeOrder(validItems, validDelivery)).rejects.toThrow('boom');
      });
    });
  });

  describe('useOrderContext guard', () => {
    it('throws when used outside OrderProvider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderHook(() => useOrderActions())).toThrow(
        'useOrderContext must be used within OrderProvider'
      );
      spy.mockRestore();
    });
  });
});
