import { STATUS_SEQUENCE } from "../../domain/models";
import { getOrderById, updateOrder } from "../../infrastructure/store/store";

const DEFAULT_INTERVAL_MS = 10_000;
const timers = new Map<string, ReturnType<typeof setInterval>>();

export function startSimulation(orderId: string, intervalMs: number = DEFAULT_INTERVAL_MS): void {
  if (timers.has(orderId)) return;

  const timer = setInterval(() => {
    const order = getOrderById(orderId);
    if (!order) {
      stopSimulation(orderId);
      return;
    }

    const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= STATUS_SEQUENCE.length) {
      stopSimulation(orderId);
      return;
    }

    updateOrder({ ...order, status: STATUS_SEQUENCE[nextIndex] });

    if (STATUS_SEQUENCE[nextIndex] === "Delivered") {
      stopSimulation(orderId);
    }
  }, intervalMs);

  timers.set(orderId, timer);
}

export function stopSimulation(orderId: string): void {
  const timer = timers.get(orderId);
  if (timer !== undefined) {
    clearInterval(timer);
    timers.delete(orderId);
  }
}
