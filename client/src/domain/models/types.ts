export type OrderStatus = 'Order Received' | 'Preparing' | 'Out for Delivery' | 'Delivered';

export const STATUS_SEQUENCE: OrderStatus[] = [
  'Order Received',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface DeliveryDetails {
  name: string;
  address: string;
  phone: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  deliveryDetails: DeliveryDetails;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}
