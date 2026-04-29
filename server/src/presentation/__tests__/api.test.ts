import request from "supertest";
import app from "../../app";
import { _resetStore } from "../../infrastructure/store/store";
import { stopSimulation } from "../../application/simulator/statusSimulator";

// Prevent the simulator from running real timers during API tests
jest.mock("../../application/simulator/statusSimulator", () => ({
  startSimulation: jest.fn(),
  stopSimulation: jest.fn(),
}));

beforeEach(() => _resetStore());
afterAll(() => {
  // Ensure any leaked timers are cleared
  (stopSimulation as jest.Mock).mockReset();
});

const validBody = {
  items: [{ menuItemId: "1", quantity: 2 }],
  delivery: { name: "Jane Doe", address: "123 Main St", phone: "+1234567890" },
};

// ─── Menu ────────────────────────────────────────────────────────────────────

describe("GET /api/menu", () => {
  it("returns 200 with an array of menu items", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("each item has id, name, price, imageUrl", async () => {
    const res = await request(app).get("/api/menu");
    for (const item of res.body) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("price");
      expect(item).toHaveProperty("imageUrl");
    }
  });
});

// ─── Orders ──────────────────────────────────────────────────────────────────

describe("POST /api/orders", () => {
  it("returns 201 with the created order", async () => {
    const res = await request(app).post("/api/orders").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: "Order Received",
      totalPrice: 25.98,
      deliveryDetails: validBody.delivery,
    });
    expect(res.body.id).toBeTruthy();
  });

  it("returns 400 when items array is empty", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, items: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("returns 400 when items is missing", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ delivery: validBody.delivery });
    expect(res.status).toBe(400);
  });

  it("returns 400 when delivery is missing", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: validBody.items });
    expect(res.status).toBe(400);
  });

  it("returns 400 when delivery name is empty", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, delivery: { ...validBody.delivery, name: "" } });
    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(expect.arrayContaining([expect.stringContaining("name")]));
  });

  it("returns 400 when phone format is invalid", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, delivery: { ...validBody.delivery, phone: "abc" } });
    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(expect.arrayContaining([expect.stringContaining("phone")]));
  });

  it("returns 400 when menuItemId does not exist", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, items: [{ menuItemId: "nonexistent", quantity: 1 }] });
    expect(res.status).toBe(400);
  });

  it("returns 400 when quantity is zero", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, items: [{ menuItemId: "1", quantity: 0 }] });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/orders", () => {
  it("returns 200 with empty array when no orders", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all placed orders", async () => {
    await request(app).post("/api/orders").send(validBody);
    await request(app).post("/api/orders").send(validBody);
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /api/orders/:id", () => {
  it("returns the order by id", async () => {
    const created = await request(app).post("/api/orders").send(validBody);
    const res = await request(app).get(`/api/orders/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/orders/nonexistent-id");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Order not found");
  });
});

describe("PATCH /api/orders/:id", () => {
  it("advances order status", async () => {
    const created = await request(app).post("/api/orders").send(validBody);
    const res = await request(app)
      .patch(`/api/orders/${created.body.id}`)
      .send({ status: "Preparing" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Preparing");
  });

  it("returns 400 for invalid status value", async () => {
    const created = await request(app).post("/api/orders").send(validBody);
    const res = await request(app)
      .patch(`/api/orders/${created.body.id}`)
      .send({ status: "Flying" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("returns 400 for backward status transition", async () => {
    const created = await request(app).post("/api/orders").send(validBody);
    await request(app)
      .patch(`/api/orders/${created.body.id}`)
      .send({ status: "Preparing" });
    const res = await request(app)
      .patch(`/api/orders/${created.body.id}`)
      .send({ status: "Order Received" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid status transition");
  });

  it("returns 404 for unknown order id", async () => {
    const res = await request(app)
      .patch("/api/orders/nonexistent-id")
      .send({ status: "Preparing" });
    expect(res.status).toBe(404);
  });

  it("allows full status progression via API", async () => {
    const { body: order } = await request(app).post("/api/orders").send(validBody);
    await request(app).patch(`/api/orders/${order.id}`).send({ status: "Preparing" });
    await request(app).patch(`/api/orders/${order.id}`).send({ status: "Out for Delivery" });
    const res = await request(app)
      .patch(`/api/orders/${order.id}`)
      .send({ status: "Delivered" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Delivered");
  });
});
