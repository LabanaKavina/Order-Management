import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;

// Schemas
export const DeliveryDetailsSchema = z.object({
  name: z.string().min(1, "name is required"),
  address: z.string().min(1, "address is required"),
  phone: z.string().regex(PHONE_REGEX, "phone format is invalid"),
});

export const PlaceOrderInputSchema = z.object({
  menuItemId: z.string().min(1, "menuItemId is required"),
  quantity: z.int().positive("quantity must be a positive integer"),
});

export const PlaceOrderBodySchema = z.object({
  items: z.array(PlaceOrderInputSchema).min(1, "order must contain at least one item"),
  delivery: DeliveryDetailsSchema,
});

export const UpdateStatusBodySchema = z.object({
  status: z.enum(["Order Received", "Preparing", "Out for Delivery", "Delivered"]),
});

// Middleware
export function validatePlaceOrder(req: Request, res: Response, next: NextFunction): void {
  const result = PlaceOrderBodySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((i) => i.message),
    });
    return;
  }
  next();
}

export function validateUpdateStatus(req: Request, res: Response, next: NextFunction): void {
  const result = UpdateStatusBodySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((i) => i.message),
    });
    return;
  }
  next();
}
