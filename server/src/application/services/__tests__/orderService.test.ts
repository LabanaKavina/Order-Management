import * as fc from "fast-check";
import * as store from "../../../infrastructure/store/store";
import { placeOrder, getOrder, getAllOrders, updateOrderStatus } from "../orderService";
import type { DeliveryDetails } from "../../../domain/models";

// Prevent real setInterval timers from leaking into the test runner
jest.mock("../../../application/simulator/statusSimulator", () => ({
  startSimulation: jest.fn(),
  stopSimulation: jest.fn(),
}));

// Reset in-memory store before each test so tests are isolated
beforeEach(() => store._resetStore());

const validDelivery: DeliveryDetails = {
  name: "Jane Doe",
  address: "123 Main St",
  phone: "+1234567890",
};

const validItems = [{ menuItemId: "1", quantity: 2 }]; // id "1" exists in seed data

describe("placeOrder", () => {
  it("creates an order with correct totalPrice", () => {
    const order = placeOrder(validItems, validDelivery);
    // seed item "1" = Margherita Pizza $12.99 × 2 = $25.98
    expect(order.totalPrice).toBe(25.98);
    expect(order.status).toBe("Order Received");
    expect(order.items).toHaveLength(1);
    expect(order.items[0].name).toBe("Margherita Pizza");
  });

  it("persists the order so getOrder can retrieve it", () => {
    const order = placeOrder(validItems, validDelivery);
    expect(getOrder(order.id)).toEqual(order);
  });

  it("throws when menu item does not exist", () => {
    expect(() =>
      placeOrder([{ menuItemId: "nonexistent", quantity: 1 }], validDelivery)
    ).toThrow("Menu item not found: nonexistent");
  });

  it("calculates totalPrice correctly for multiple items", () => {
    // item "1" = $12.99, item "2" = $9.99
    const order = placeOrder(
      [{ menuItemId: "1", quantity: 1 }, { menuItemId: "2", quantity: 3 }],
      validDelivery
    );
    // 12.99 + 9.99 * 3 = 12.99 + 29.97 = 42.96
    expect(order.totalPrice).toBe(42.96);
  });
});

describe("getAllOrders", () => {
  it("returns empty array when no orders placed", () => {
    expect(getAllOrders()).toHaveLength(0);
  });

  it("returns all placed orders", () => {
    placeOrder(validItems, validDelivery);
    placeOrder(validItems, validDelivery);
    expect(getAllOrders()).toHaveLength(2);
  });
});

describe("getOrder", () => {
  it("returns undefined for unknown id", () => {
    expect(getOrder("unknown-id")).toBeUndefined();
  });
});

describe("updateOrderStatus", () => {
  it("advances status forward", () => {
    const order = placeOrder(validItems, validDelivery);
    const updated = updateOrderStatus(order.id, "Preparing");
    expect(updated.status).toBe("Preparing");
  });

  it("throws for unknown order id", () => {
    expect(() => updateOrderStatus("bad-id", "Preparing")).toThrow("Order not found");
  });

  it("throws when transitioning to same status", () => {
    const order = placeOrder(validItems, validDelivery);
    expect(() => updateOrderStatus(order.id, "Order Received")).toThrow("Invalid status transition");
  });

  it("throws when transitioning backwards", () => {
    const order = placeOrder(validItems, validDelivery);
    updateOrderStatus(order.id, "Preparing");
    expect(() => updateOrderStatus(order.id, "Order Received")).toThrow("Invalid status transition");
  });

  it("allows full status progression", () => {
    const order = placeOrder(validItems, validDelivery);
    updateOrderStatus(order.id, "Preparing");
    updateOrderStatus(order.id, "Out for Delivery");
    const final = updateOrderStatus(order.id, "Delivered");
    expect(final.status).toBe("Delivered");
  });
});

describe("Property: any valid seed item + valid delivery always creates an order", () => {
  const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;
  const seedIds = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"];

  it("never throws for valid inputs", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...seedIds),
        fc.integer({ min: 1, max: 10 }),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.stringMatching(PHONE_REGEX),
        (menuItemId, quantity, name, address, phone) => {
          store._resetStore();
          const order = placeOrder([{ menuItemId, quantity }], { name, address, phone });
          expect(order.id).toBeTruthy();
          expect(order.totalPrice).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});
