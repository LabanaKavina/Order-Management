import type { IOrderRepository } from '@/domain/interfaces/order/IOrderRepository';
import type { DeliveryDetails, Order } from '@/domain/models/types';
import type { IHttpClient } from '@/infrastructure/utils/http/types';
import { BaseRepository } from '../BaseRepository';

export class OrderRepository extends BaseRepository implements IOrderRepository {
  private readonly baseUrl = '/api/orders';

  constructor(httpClient: IHttpClient) {
    super(httpClient);
  }

  async getOrders(): Promise<Order[]> {
    try {
      return await this.httpClient.get<Order[]>(this.baseUrl);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      return await this.httpClient.get<Order>(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async placeOrder(
    items: { menuItemId: string; quantity: number }[],
    delivery: DeliveryDetails
  ): Promise<Order> {
    try {
      return await this.httpClient.post<Order>(this.baseUrl, { items, delivery });
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
