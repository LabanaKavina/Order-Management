import * as fc from 'fast-check';
import { OrderService } from '../OrderService';
import type { IOrderRepository } from '@/domain/interfaces/order/IOrderRepository';
import type { Order, DeliveryDetails } from '@/domain/models/types';

const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    items: [{ menuItemId: 'item-1', name: 'Burger', price: 9.99, quantity: 2 }],
    deliveryDetails: { name: 'John Doe', address: '123 Main St', phone: '+1234567890' },
    totalPrice: 19.98,
    status: 'Order Received',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
  return {
    getOrders: jest.fn().mockResolvedValue([]),
    getOrderById: jest.fn().mockResolvedValue(makeOrder()),
    placeOrder: jest.fn().mockResolvedValue(makeOrder()),
    ...overrides,
  };
}

describe('OrderService', () => {
  describe('getOrder', () => {
    it('throws when id is empty', async () => {
      const svc = new OrderService(makeRepo());
      await expect(svc.getOrder('')).rejects.toThrow('Order ID is required');
      await expect(svc.getOrder('   ')).rejects.toThrow('Order ID is required');
    });

    it('delegates to repository with valid id', async () => {
      const order = makeOrder({ id: 'abc-123' });
      const repo = makeRepo({ getOrderById: jest.fn().mockResolvedValue(order) });
      const svc = new OrderService(repo);
      const result = await svc.getOrder('abc-123');
      expect(result).toEqual(order);
      expect(repo.getOrderById).toHaveBeenCalledWith('abc-123');
    });
  });

  describe('getAllOrders', () => {
    it('returns all orders from repository', async () => {
      const orders = [makeOrder({ id: '1' }), makeOrder({ id: '2' })];
      const repo = makeRepo({ getOrders: jest.fn().mockResolvedValue(orders) });
      const result = await new OrderService(repo).getAllOrders();
      expect(result).toHaveLength(2);
    });
  });

  describe('submitOrder — delivery validation', () => {
    const validItems = [{ menuItemId: 'item-1', quantity: 1 }];

    it('throws when name is missing', async () => {
      const svc = new OrderService(makeRepo());
      await expect(
        svc.submitOrder(validItems, { name: '', address: '123 St', phone: '+1234567890' })
      ).rejects.toThrow('Full name is required');
    });

    it('throws when address is missing', async () => {
      const svc = new OrderService(makeRepo());
      await expect(
        svc.submitOrder(validItems, { name: 'Jane', address: '', phone: '+1234567890' })
      ).rejects.toThrow('Delivery address is required');
    });

    it('throws when phone is missing', async () => {
      const svc = new OrderService(makeRepo());
      await expect(
        svc.submitOrder(validItems, { name: 'Jane', address: '123 St', phone: '' })
      ).rejects.toThrow('Phone number is required');
    });

    it('throws when phone format is invalid', async () => {
      const svc = new OrderService(makeRepo());
      await expect(
        svc.submitOrder(validItems, { name: 'Jane', address: '123 St', phone: 'not-a-phone' })
      ).rejects.toThrow('Phone format is invalid');
    });
  });

  describe('submitOrder — items validation', () => {
    const validDelivery: DeliveryDetails = { name: 'Jane', address: '123 St', phone: '+1234567890' };

    it('throws when cart is empty', async () => {
      const svc = new OrderService(makeRepo());
      await expect(svc.submitOrder([], validDelivery)).rejects.toThrow('Cart must contain at least one item');
    });

    it('throws when quantity is zero', async () => {
      const svc = new OrderService(makeRepo());
      await expect(
        svc.submitOrder([{ menuItemId: 'item-1', quantity: 0 }], validDelivery)
      ).rejects.toThrow('Quantity must be a positive integer');
    });

    it('throws when menuItemId is blank', async () => {
      const svc = new OrderService(makeRepo());
      await expect(
        svc.submitOrder([{ menuItemId: '  ', quantity: 1 }], validDelivery)
      ).rejects.toThrow('Each item must have a valid menu item ID');
    });

    it('places order when all inputs are valid', async () => {
      const order = makeOrder();
      const repo = makeRepo({ placeOrder: jest.fn().mockResolvedValue(order) });
      const svc = new OrderService(repo);
      const result = await svc.submitOrder([{ menuItemId: 'item-1', quantity: 2 }], validDelivery);
      expect(result).toEqual(order);
      expect(repo.placeOrder).toHaveBeenCalledTimes(1);
    });
  });

  describe('Property: valid delivery + items always calls repository', () => {
    it('never throws for well-formed inputs', async () => {
      const validPhone = fc.stringMatching(PHONE_REGEX);
      const nonBlank = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
      const positiveInt = fc.integer({ min: 1, max: 99 });

      await fc.assert(
        fc.asyncProperty(nonBlank, nonBlank, validPhone, positiveInt, async (name, address, phone, qty) => {
          const repo = makeRepo({ placeOrder: jest.fn().mockResolvedValue(makeOrder()) });
          const svc = new OrderService(repo);
          await expect(
            svc.submitOrder([{ menuItemId: 'item-1', quantity: qty }], { name, address, phone })
          ).resolves.toBeDefined();
        }),
        { numRuns: 50 }
      );
    });
  });
});
