import type { DeliveryDetails, Order } from '@/domain/models/types';

export interface IOrderRepository {
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order>;
  placeOrder(items: { menuItemId: string; quantity: number }[], delivery: DeliveryDetails): Promise<Order>;
}
