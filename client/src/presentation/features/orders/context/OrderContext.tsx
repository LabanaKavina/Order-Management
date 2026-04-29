import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { OrderService } from '@/application/features/orders/OrderService';
import type { IOrderService } from '@/domain/interfaces/order/IOrderService';
import type { Order } from '@/domain/models/types';
import { OrderRepository } from '@/infrastructure/api/order/OrderRepository';
import { createHttpClient } from '@/infrastructure/utils/http/httpClientFactory';

const NOTIFIED_KEY = 'fd-delivered-notified';

function loadNotifiedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifiedIds(ids: Set<string>) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...ids]));
}

interface OrderContextType {
  orderService: IOrderService;
  orders: Order[];
  loading: boolean;
  error: string | null;
  setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markDeliveredNotified: (orderId: string) => void;
  isDeliveredNotified: (orderId: string) => boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export { OrderContext };

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const orderService = useMemo(() => {
    const httpClient = createHttpClient();
    const orderRepository = new OrderRepository(httpClient);
    return new OrderService(orderRepository);
  }, []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notifiedIds = useMemo(() => loadNotifiedIds(), []);

  const markDeliveredNotified = useCallback((orderId: string) => {
    notifiedIds.add(orderId);
    saveNotifiedIds(notifiedIds);
  }, [notifiedIds]);

  const isDeliveredNotified = useCallback((orderId: string) => {
    return notifiedIds.has(orderId);
  }, [notifiedIds]);

  return (
    <OrderContext.Provider
      value={{
        orderService,
        orders,
        loading,
        error,
        setOrders,
        setLoading,
        setError,
        markDeliveredNotified,
        isDeliveredNotified,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export function useOrderContext(): OrderContextType {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrderContext must be used within OrderProvider');
  return context;
}
