import { useCallback } from 'react';
import { useOrderContext } from '../context/OrderContext';

export function useOrdersData() {
  const { orderService, orders, loading, error, setOrders, setLoading, setError } = useOrderContext();

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [orderService, setOrders, setLoading, setError]);

  return { orders, loading, error, refreshOrders };
}
