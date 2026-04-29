import { useState, useEffect, useRef, useCallback } from 'react';
import type { Order } from '@/domain/models/types';
import { useOrderContext } from '../context/OrderContext';

export function useOrderStatus(orderId: string, intervalMs = 5000) {
  const { orderService } = useOrderContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs that survive StrictMode unmount/remount
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const orderIdRef = useRef(orderId);

  const poll = useCallback(async () => {
    const id = orderIdRef.current;
    if (!id) return;
    try {
      const data = await orderService.getOrder(id);
      setOrder(data);
      setError(null);
      if (data.status === 'Delivered') {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [orderService]);

  useEffect(() => {
    orderIdRef.current = orderId;

    // StrictMode mounts twice — only start once
    if (startedRef.current) return;
    if (!orderId) return;

    startedRef.current = true;
    poll();
    timerRef.current = setInterval(poll, intervalMs);

    // Intentionally no cleanup here — the interval is owned by the ref
    // and will be cleared when the order is delivered or the orderId changes
  }, [orderId, intervalMs, poll]);

  // Reset and restart when orderId actually changes (real navigation)
  const prevOrderIdRef = useRef(orderId);
  useEffect(() => {
    if (prevOrderIdRef.current === orderId) return;
    prevOrderIdRef.current = orderId;
    startedRef.current = false;

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setOrder(null);
    setLoading(true);
    setError(null);
  }, [orderId]);

  // Cleanup on true unmount (component removed from tree entirely)
  useEffect(() => {
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, []);

  return { order, loading, error };
}
