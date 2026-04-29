import type { DeliveryDetails, Order } from '@/domain/models/types';

export interface IOrderService {
  getAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order>;
  submitOrder(items: { menuItemId: string; quantity: number }[], delivery: DeliveryDetails): Promise<Order>;
}
