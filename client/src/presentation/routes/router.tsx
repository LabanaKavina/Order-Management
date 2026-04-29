import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import NavBar from '@/presentation/shared/organisms/NavBar';
import { useCartContext } from '@/presentation/shared/contexts/CartContext';
import { useOrderActions } from '@/presentation/features/orders/hooks/useOrderActions';
import type { DeliveryDetails } from '@/domain/models/types';

const MenuPage        = lazy(() => import('@/presentation/features/menu/MenuPage'));
const CartPage        = lazy(() => import('@/presentation/features/cart/CartPage'));
const CheckoutPage    = lazy(() => import('@/presentation/features/checkout/CheckoutPage'));
const OrderStatusPage = lazy(() => import('@/presentation/features/orders/OrderStatusPage'));
const OrdersPage      = lazy(() => import('@/presentation/features/orders/OrdersPage'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 size={28} className="animate-spin text-primary" />
    </div>
  );
}

function Layout() {
  const { cart } = useCartContext();
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <NavBar cartCount={cartCount} />
      <main>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

function MenuRoute() {
  const { cart, addItem, updateQuantity } = useCartContext();
  return <MenuPage cart={cart} onAddToCart={addItem} onUpdateQuantity={updateQuantity} />;
}

function CartRoute() {
  const { cart, cartTotal, updateQuantity, removeItem } = useCartContext();
  return <CartPage cart={cart} cartTotal={cartTotal} onUpdateQuantity={updateQuantity} onRemove={removeItem} />;
}

function CheckoutRoute() {
  const { cart, cartTotal, clearCart } = useCartContext();
  const { placeOrder } = useOrderActions();
  if (cart.length === 0) return <Navigate to="/menu" replace />;

  const handlePlaceOrder = async (
    items: { menuItemId: string; quantity: number }[],
    delivery: DeliveryDetails
  ) => {
    const order = await placeOrder(items, delivery);
    return { id: order.id };
  };

  return (
    <CheckoutPage
      cart={cart}
      cartTotal={cartTotal}
      onPlaceOrder={handlePlaceOrder}
      onClearCart={clearCart}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,        element: <Navigate to="/menu" replace /> },
      { path: 'menu',       element: <MenuRoute /> },
      { path: 'cart',       element: <CartRoute /> },
      { path: 'checkout',   element: <CheckoutRoute /> },
      { path: 'orders',     element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderStatusPage /> },
    ],
  },
]);
