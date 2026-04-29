import { useCallback } from 'react';
import { useOrderContext } from '../context/OrderContext';
import type { DeliveryDetails, Order } from '@/domain/models/types';

export function useOrderActions() {
  const { orderService, loading, error, setOrders, setLoading, setError } = useOrderContext();

  const placeOrder = useCallback(
    async (items: { menuItemId: string; quantity: number }[], delivery: DeliveryDetails): Promise<Order> => {
      setLoading(true);
      try {
        const order = await orderService.submitOrder(items, delivery);
        setOrders((prev) => [...prev, order]);
        setError(null);
        return order;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [orderService, setOrders, setLoading, setError]
  );

  return { placeOrder, loading, error };
}
