import type { IOrderRepository } from '@/domain/interfaces/order/IOrderRepository';
import type { IOrderService } from '@/domain/interfaces/order/IOrderService';
import type { DeliveryDetails, Order } from '@/domain/models/types';

const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;

interface ValidationError {
  field: string;
  message: string;
}

function validateDelivery(delivery: DeliveryDetails): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!delivery.name?.trim()) errors.push({ field: 'name', message: 'Full name is required' });
  if (!delivery.address?.trim()) errors.push({ field: 'address', message: 'Delivery address is required' });
  if (!delivery.phone?.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!PHONE_REGEX.test(delivery.phone)) {
    errors.push({ field: 'phone', message: 'Phone format is invalid' });
  }
  return errors;
}

function validateItems(items: { menuItemId: string; quantity: number }[]): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!items || items.length === 0) {
    errors.push({ field: 'items', message: 'Cart must contain at least one item' });
    return errors;
  }
  items.forEach((item, i) => {
    if (!item.menuItemId?.trim())
      errors.push({ field: `items[${i}].menuItemId`, message: 'Each item must have a valid menu item ID' });
    if (!Number.isInteger(item.quantity) || item.quantity <= 0)
      errors.push({ field: `items[${i}].quantity`, message: 'Quantity must be a positive integer' });
  });
  return errors;
}

export class OrderService implements IOrderService {
  private readonly repository: IOrderRepository;

  constructor(repository: IOrderRepository) {
    this.repository = repository;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.repository.getOrders();
  }

  async getOrder(id: string): Promise<Order> {
    if (!id?.trim()) throw new Error('Order ID is required');
    return this.repository.getOrderById(id);
  }

  async submitOrder(
    items: { menuItemId: string; quantity: number }[],
    delivery: DeliveryDetails
  ): Promise<Order> {
    const errors = [...validateDelivery(delivery), ...validateItems(items)];
    if (errors.length > 0) throw new Error(errors.map((e) => e.message).join(', '));
    return this.repository.placeOrder(items, delivery);
  }
}
