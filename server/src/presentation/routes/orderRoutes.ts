import { Router } from "express";
import * as orderController from "../controllers/orderController";
import { validatePlaceOrder, validateUpdateStatus } from "../middleware/validators";

const router = Router();

router.post("/", validatePlaceOrder, orderController.create);
router.get("/", orderController.getAll);
router.get("/:id", orderController.getById);
router.patch("/:id", validateUpdateStatus, orderController.updateStatus);

export default router;
