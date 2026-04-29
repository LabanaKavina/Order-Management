import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeContext, useThemeState } from '@/presentation/theme';
import { CartProvider } from '@/presentation/shared/contexts/CartContext';
import { MenuProvider } from '@/presentation/features/menu/context/MenuContext';
import { OrderProvider } from '@/presentation/features/orders/context/OrderContext';
import OrderToastWatcher from '@/presentation/features/orders/OrderToastWatcher';
import { router } from '@/presentation/routes/router';

function RootWithProviders() {
  const themeHook = useThemeState();
  return (
    <ThemeContext.Provider value={themeHook}>
      <RouterProvider router={router} />
    </ThemeContext.Provider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <MenuProvider>
          <OrderProvider>
            <OrderToastWatcher />
            <RootWithProviders />
          </OrderProvider>
        </MenuProvider>
      </CartProvider>
    </ToastProvider>
  );
}
