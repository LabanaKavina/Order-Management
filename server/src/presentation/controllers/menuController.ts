import { Request, Response } from "express";
import * as menuService from "../../application/services/menuService";

export function getAll(req: Request, res: Response): void {
  try {
    const items = menuService.getAllItems();
    res.json(items);
  } catch (err) {
    console.error("menuController.getAll error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
