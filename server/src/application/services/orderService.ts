import { v4 as uuidv4 } from "uuid";
import { Order, OrderItem, OrderStatus, DeliveryDetails, STATUS_SEQUENCE } from "../../domain/models";
import { getOrderById, getOrders, saveOrder, updateOrder, getMenuItemById } from "../../infrastructure/store/store";
import { startSimulation } from "../simulator/statusSimulator";

export interface PlaceOrderInput {
  menuItemId: string;
  quantity: number;
}

export function placeOrder(items: PlaceOrderInput[], delivery: DeliveryDetails): Order {
  const orderItems: OrderItem[] = items.map((input) => {
    const menuItem = getMenuItemById(input.menuItemId);
    if (!menuItem) {
      throw new Error(`Menu item not found: ${input.menuItemId}`);
    }
    return {
      menuItemId: input.menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: input.quantity,
    };
  });

  const totalPrice = Math.round(
    orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
  ) / 100;

  const order: Order = {
    id: uuidv4(),
    items: orderItems,
    deliveryDetails: delivery,
    totalPrice,
    status: "Order Received",
    createdAt: new Date(),
  };

  saveOrder(order);
  startSimulation(order.id);

  return order;
}

export function getOrder(id: string): Order | undefined {
  return getOrderById(id);
}

export function getAllOrders(): Order[] {
  return getOrders();
}

export function updateOrderStatus(id: string, status: OrderStatus): Order {
  const order = getOrderById(id);
  if (!order) {
    throw new Error("Order not found");
  }

  const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
  const nextIndex = STATUS_SEQUENCE.indexOf(status);

  if (nextIndex <= currentIndex) {
    throw new Error("Invalid status transition");
  }

  const updated: Order = { ...order, status };
  return updateOrder(updated);
}
