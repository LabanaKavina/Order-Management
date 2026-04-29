import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight } from 'lucide-react';
import EmptyState from '@/presentation/shared/atoms/EmptyState';
import { Badge } from '@/components/ui/badge';
import { useOrdersData } from './hooks/useOrdersData';
import type { OrderStatus } from '@/domain/models/types';

function statusVariant(status: OrderStatus) {
  switch (status) {
    case 'Order Received': return 'outline' as const;
    case 'Preparing':      return 'warning' as const;
    case 'Out for Delivery': return 'info' as const;
    case 'Delivered':      return 'success' as const;
  }
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, loading, refreshOrders } = useOrdersData();

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    refreshOrders();
  }, []); 

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">My Orders</h1>
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      )}
      {!loading && orders.length === 0 && (
        <EmptyState icon={ClipboardList} message="No orders yet" subMessage="Place your first order from the menu." />
      )}
      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
            <button key={order.id} onClick={() => navigate(`/orders/${order.id}`)} className="w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 group">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{order.items.map((i) => i.name).join(', ')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-primary">${order.totalPrice.toFixed(2)}</span>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
