import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderStatusStepper from '@/presentation/shared/atoms/OrderStatusStepper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOrderStatus } from './hooks/useOrderStatus';
import type { OrderStatus } from '@/domain/models/types';

function statusVariant(status: OrderStatus) {
  switch (status) {
    case 'Order Received': return 'outline' as const;
    case 'Preparing':       return 'warning' as const;
    case 'Out for Delivery':return 'info' as const;
    case 'Delivered':       return 'success' as const;
  }
}

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, loading, error } = useOrderStatus(id ?? '');

  if (loading && !order) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  if (error) return <div className="mx-auto max-w-2xl px-4 py-8"><div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-destructive">{error}</div></div>;
  if (!order) return null;

  const isDelivered = order.status === 'Delivered';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 page-enter">
      <Button variant="ghost" size="sm" className="gap-1 -ml-2" onClick={() => navigate('/orders')}>
        <ArrowLeft size={15} /> All Orders
      </Button>
      <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-extrabold">Order Status</h1>
        <Badge variant={statusVariant(order.status)} className="mt-1 shrink-0 text-xs px-3 py-1">{order.status}</Badge>
      </div>
      <AnimatePresence>
        {isDelivered && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <PartyPopper size={24} className="text-emerald-500 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800">Your order has been delivered!</p>
              <p className="text-sm text-emerald-600">Enjoy your meal. Thanks for ordering with FoodDash.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <OrderStatusStepper status={order.status} />
      </div>
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-4 font-semibold">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.menuItemId} className="flex justify-between text-sm">
              <span className="text-foreground">{item.name} <span className="text-muted-foreground">× {item.quantity}</span></span>
              <span className="font-semibold tabular-nums">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between font-bold">
          <span>Total</span><span className="text-primary">${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-3 font-semibold">Delivery Details</h2>
        <p className="font-medium">{order.deliveryDetails.name}</p>
        <p className="text-sm text-muted-foreground">{order.deliveryDetails.address}</p>
        <p className="text-sm text-muted-foreground">{order.deliveryDetails.phone}</p>
      </div>
      <p className="text-xs text-muted-foreground text-center">Placed {new Date(order.createdAt).toLocaleString()}</p>
    </div>
  );
}
