import { startSimulation, stopSimulation } from "../statusSimulator";
import * as store from "../../../infrastructure/store/store";
import type { Order } from "../../../domain/models";

jest.useFakeTimers();

beforeEach(() => store._resetStore());
afterEach(() => jest.clearAllTimers());

function makeOrder(id: string): Order {
  return {
    id,
    items: [{ menuItemId: "1", name: "Pizza", price: 12.99, quantity: 1 }],
    deliveryDetails: { name: "Jane", address: "123 St", phone: "+1234567890" },
    totalPrice: 12.99,
    status: "Order Received",
    createdAt: new Date(),
  };
}

describe("statusSimulator", () => {
  it("advances status after one interval", () => {
    const order = makeOrder("order-1");
    store.saveOrder(order);

    startSimulation("order-1", 1000);
    jest.advanceTimersByTime(1000);

    expect(store.getOrderById("order-1")?.status).toBe("Preparing");
  });

  it("advances through all statuses and stops at Delivered", () => {
    const order = makeOrder("order-2");
    store.saveOrder(order);

    startSimulation("order-2", 1000);
    jest.advanceTimersByTime(1000); // → Preparing
    jest.advanceTimersByTime(1000); // → Out for Delivery
    jest.advanceTimersByTime(1000); // → Delivered

    expect(store.getOrderById("order-2")?.status).toBe("Delivered");

    // No further changes after Delivered
    jest.advanceTimersByTime(5000);
    expect(store.getOrderById("order-2")?.status).toBe("Delivered");
  });

  it("does not start a second timer for the same order", () => {
    const order = makeOrder("order-3");
    store.saveOrder(order);

    startSimulation("order-3", 1000);
    startSimulation("order-3", 1000); // second call should be ignored

    jest.advanceTimersByTime(1000);
    // Should only advance once, not twice
    expect(store.getOrderById("order-3")?.status).toBe("Preparing");
  });

  it("stopSimulation cancels the timer", () => {
    const order = makeOrder("order-4");
    store.saveOrder(order);

    startSimulation("order-4", 1000);
    stopSimulation("order-4");
    jest.advanceTimersByTime(5000);

    // Status should remain unchanged
    expect(store.getOrderById("order-4")?.status).toBe("Order Received");
  });

  it("handles stopSimulation for unknown id gracefully", () => {
    expect(() => stopSimulation("nonexistent")).not.toThrow();
  });

  it("stops gracefully when order is deleted from store mid-simulation", () => {
    const order = makeOrder("order-5");
    store.saveOrder(order);

    startSimulation("order-5", 1000);
    // Remove order from store before timer fires
    store._resetStore();

    expect(() => jest.advanceTimersByTime(1000)).not.toThrow();
  });
});
