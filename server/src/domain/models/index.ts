export type OrderStatus = "Order Received" | "Preparing" | "Out for Delivery" | "Delivered";

export const STATUS_SEQUENCE: OrderStatus[] = [
  "Order Received",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // positive number, in dollars
  imageUrl: string;
}

export interface DeliveryDetails {
  name: string;    // non-empty
  address: string; // non-empty
  phone: string;   // matches /^\+?[\d\s\-()]{7,15}$/
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
  createdAt: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PlaceOrderRequest {
  items: { menuItemId: string; quantity: number }[];
  delivery: { name: string; address: string; phone: string };
}

export interface ErrorResponse {
  error: string;
  details?: string[];
}
