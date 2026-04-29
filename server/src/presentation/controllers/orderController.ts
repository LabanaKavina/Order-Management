import { Request, Response } from "express";
import * as orderService from "../../application/services/orderService";

export function create(req: Request, res: Response): void {
  try {
    const { items, delivery } = req.body;
    const order = orderService.placeOrder(items, delivery);
    res.status(201).json(order);
  } catch (err: any) {
    const msg: string = err?.message ?? "";
    if (msg.includes("Menu item not found")) {
      res.status(400).json({ error: "Validation failed", details: [msg] });
    } else {
      console.error("orderController.create error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export function getAll(req: Request, res: Response): void {
  try {
    const orders = orderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    console.error("orderController.getAll error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export function getById(req: Request, res: Response): void {
  try {
    const order = orderService.getOrder(req.params.id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch (err) {
    console.error("orderController.getById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export function updateStatus(req: Request, res: Response): void {
  try {
    const { status } = req.body;
    const order = orderService.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (err: any) {
    const msg: string = err?.message ?? "";
    if (msg === "Order not found") {
      res.status(404).json({ error: "Order not found" });
    } else if (msg === "Invalid status transition") {
      res.status(400).json({ error: "Invalid status transition" });
    } else {
      console.error("orderController.updateStatus error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
