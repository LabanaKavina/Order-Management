import { useEffect, useRef } from 'react';
import { useOrderContext } from './context/OrderContext';
import { useToast } from '@/components/ui/toast';

/**
 * Mounted once at the app level. Polls all non-delivered orders and fires
 * the "delivered" toast exactly once per order, regardless of which route
 * the user is currently on.
 */
export default function OrderToastWatcher() {
  const { orders, orderService, markDeliveredNotified, isDeliveredNotified } = useOrderContext();
  const { toast } = useToast();
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {
    // Watch any order that isn't delivered yet and hasn't been notified
    const activeOrders = orders.filter(
      (o) => o.status !== 'Delivered' && !isDeliveredNotified(o.id)
    );

    for (const order of activeOrders) {
      if (intervalsRef.current.has(order.id)) continue; // already watching

      const interval = setInterval(async () => {
        try {
          const updated = await orderService.getOrder(order.id);
          if (updated.status === 'Delivered') {
            clearInterval(intervalsRef.current.get(order.id));
            intervalsRef.current.delete(order.id);
            if (!isDeliveredNotified(updated.id)) {
              markDeliveredNotified(updated.id);
              toast({
                variant: 'success',
                title: '🎉 Your order has been delivered!',
                description: 'Enjoy your meal. Thanks for ordering with FoodDash.',
                duration: 7000,
              });
            }
          }
        } catch {
          // silently ignore polling errors
        }
      }, 5000);

      intervalsRef.current.set(order.id, interval);
    }

    // Clean up intervals for orders that are now delivered/notified
    for (const [id, interval] of intervalsRef.current) {
      const order = orders.find((o) => o.id === id);
      if (!order || order.status === 'Delivered' || isDeliveredNotified(id)) {
        clearInterval(interval);
        intervalsRef.current.delete(id);
      }
    }
  }, [orders, orderService, markDeliveredNotified, isDeliveredNotified, toast]);

  // Cleanup all on unmount
  useEffect(() => {
    return () => {
      for (const interval of intervalsRef.current.values()) clearInterval(interval);
      intervalsRef.current.clear();
    };
  }, []);

  return null;
}
