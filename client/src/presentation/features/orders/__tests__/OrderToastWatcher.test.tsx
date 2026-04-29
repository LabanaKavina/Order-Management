import { render } from '@testing-library/react';
import OrderToastWatcher from '../OrderToastWatcher';
import { OrderContext } from '../context/OrderContext';
import { ToastContext } from '@/components/ui/toast';
import type { Order } from '@/domain/models/types';

// httpClientFactory uses import.meta.env (Vite-only) — stub it out for Jest
jest.mock('@/infrastructure/utils/http/httpClientFactory', () => ({
  createHttpClient: jest.fn(),
}));

jest.useFakeTimers();

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    items: [{ menuItemId: 'item-1', name: 'Burger', price: 9.99, quantity: 1 }],
    deliveryDetails: { name: 'Jane', address: '123 St', phone: '+1234567890' },
    totalPrice: 9.99,
    status: 'Preparing',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderWatcher({
  orders,
  getOrder,
  isDeliveredNotified = jest.fn().mockReturnValue(false),
  markDeliveredNotified = jest.fn(),
  toast = jest.fn(),
}: {
  orders: Order[];
  getOrder: jest.Mock;
  isDeliveredNotified?: jest.Mock;
  markDeliveredNotified?: jest.Mock;
  toast?: jest.Mock;
}) {
  const orderService = { getOrder, getAllOrders: jest.fn(), submitOrder: jest.fn() };

  return render(
    <ToastContext.Provider value={{ toast }}>
      <OrderContext.Provider
        value={{
          orders,
          orderService: orderService as never,
          loading: false,
          error: null,
          setOrders: jest.fn(),
          setLoading: jest.fn(),
          setError: jest.fn(),
          markDeliveredNotified,
          isDeliveredNotified,
        }}
      >
        <OrderToastWatcher />
      </OrderContext.Provider>
    </ToastContext.Provider>
  );
}

describe('OrderToastWatcher', () => {
  afterEach(() => jest.clearAllTimers());

  it('fires toast when order transitions to Delivered', async () => {
    const toast = jest.fn();
    const markDeliveredNotified = jest.fn();
    const getOrder = jest.fn().mockResolvedValue(makeOrder({ status: 'Delivered' }));

    renderWatcher({ orders: [makeOrder()], getOrder, toast, markDeliveredNotified });

    await jest.runOnlyPendingTimersAsync();

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success', title: expect.stringContaining('delivered') })
    );
    expect(markDeliveredNotified).toHaveBeenCalledWith('order-1');
  });

  it('does not fire toast if already notified', async () => {
    const toast = jest.fn();
    const getOrder = jest.fn().mockResolvedValue(makeOrder({ status: 'Delivered' }));

    renderWatcher({
      orders: [makeOrder()],
      getOrder,
      toast,
      isDeliveredNotified: jest.fn().mockReturnValue(true),
    });

    await jest.runOnlyPendingTimersAsync();
    expect(toast).not.toHaveBeenCalled();
  });

  it('does not fire toast for already-delivered orders in initial list', async () => {
    const toast = jest.fn();
    const getOrder = jest.fn();

    renderWatcher({
      orders: [makeOrder({ status: 'Delivered' })],
      getOrder,
      toast,
    });

    await jest.runOnlyPendingTimersAsync();
    // No interval started for already-delivered orders
    expect(getOrder).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });

  it('does not fire toast twice for the same order', async () => {
    const toast = jest.fn();
    const markDeliveredNotified = jest.fn();
    // First call returns Delivered, second call also returns Delivered
    const getOrder = jest.fn().mockResolvedValue(makeOrder({ status: 'Delivered' }));
    const notifiedSet = new Set<string>();
    const isDeliveredNotified = jest.fn((id: string) => notifiedSet.has(id));
    const mark = jest.fn((id: string) => { notifiedSet.add(id); markDeliveredNotified(id); });

    renderWatcher({ orders: [makeOrder()], getOrder, toast, isDeliveredNotified, markDeliveredNotified: mark });

    await jest.runOnlyPendingTimersAsync();
    await jest.runOnlyPendingTimersAsync();

    expect(toast).toHaveBeenCalledTimes(1);
  });
});
