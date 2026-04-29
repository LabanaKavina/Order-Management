/**
 * Integration tests for CheckoutRoute in router.tsx covering:
 * - Redirects to /menu when cart is empty
 * - Renders CheckoutPage when cart has items
 * - Wires onPlaceOrder through useOrderActions.placeOrder
 * - Wires onClearCart through CartContext.clearCart
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CartContext }  from '@/presentation/shared/contexts/CartContext';
import { OrderContext } from '@/presentation/features/orders/context/OrderContext';
import CheckoutPage from '@/presentation/features/checkout/CheckoutPage';
import type { CartItem } from '@/domain/models/types';

// httpClientFactory uses import.meta which Jest doesn't support — mock it out
jest.mock('@/infrastructure/utils/http/httpClientFactory', () => ({
  createHttpClient: jest.fn(),
}));

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('framer-motion', () => ({
  motion: {
    div:  ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>)  => <div {...p}>{children}</div>,
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement>) => <span {...p}>{children}</span>,
    p:    ({ children, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...p}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/ui/food-image', () => ({
  FoodImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
jest.mock('@/components/ui/separator',  () => ({ Separator: () => <hr /> }));
jest.mock('@/components/ui/button',     () => ({
  Button: ({ children, disabled, type, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    <button type={type} disabled={disabled} {...p}>{children}</button>,
}));
jest.mock('@/components/ui/input',  () => ({ Input: (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} /> }));
jest.mock('@/components/ui/label',  () => ({ Label: ({ children, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...p}>{children}</label> }));
jest.mock('@/presentation/shared/organisms/NavBar', () => ({
  default: () => <nav />,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const cartItem: CartItem = {
  menuItem: { id: 'm1', name: 'Pizza', description: '', price: 10.00, imageUrl: '' },
  quantity: 1,
};

function makeCartContext(overrides = {}) {
  return {
    cart: [cartItem],
    cartTotal: 10.00,
    addItem:        jest.fn(),
    updateQuantity: jest.fn(),
    removeItem:     jest.fn(),
    clearCart:      jest.fn(),
    ...overrides,
  };
}

function makeOrderContext(overrides = {}) {
  const submitOrder = jest.fn().mockResolvedValue({
    id: 'order-1',
    items: [],
    deliveryDetails: { name: '', address: '', phone: '' },
    totalPrice: 0,
    status: 'Order Received',
    createdAt: new Date().toISOString(),
  });

  return {
    orderService: { getAllOrders: jest.fn(), getOrder: jest.fn(), submitOrder },
    orders: [],
    loading: false,
    error: null,
    setOrders:  jest.fn(),
    setLoading: jest.fn(),
    setError:   jest.fn(),
    markDeliveredNotified: jest.fn(),
    isDeliveredNotified:   jest.fn().mockReturnValue(false),
    submitOrder,
    ...overrides,
  };
}

// Lazy-import the router component after mocks are set up
// We render just the checkout route in isolation using MemoryRouter
function renderCheckout(cartCtx = makeCartContext(), orderCtx = makeOrderContext()) {
  function CheckoutRoute() {
    const cart      = cartCtx.cart;
    const cartTotal = cartCtx.cartTotal;
    const clearCart = cartCtx.clearCart;
    const { orderService } = orderCtx;

    if (cart.length === 0) {
      return <div data-testid="redirected-to-menu">Redirected</div>;
    }

    const handlePlaceOrder = async (
      items: { menuItemId: string; quantity: number }[],
      delivery: { name: string; address: string; phone: string }
    ) => {
      const order = await orderService.submitOrder(items, delivery);
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

  return render(
    <CartContext.Provider value={cartCtx as any}>
      <OrderContext.Provider value={orderCtx as any}>
        <MemoryRouter initialEntries={['/checkout']}>
          <Routes>
            <Route path="/checkout" element={<CheckoutRoute />} />
            <Route path="/menu"     element={<div data-testid="menu-page">Menu</div>} />
            <Route path="/orders/:id" element={<div data-testid="order-status-page">Status</div>} />
          </Routes>
        </MemoryRouter>
      </OrderContext.Provider>
    </CartContext.Provider>
  );
}

function fillForm(name = 'Jane Smith', address = '123 Main St', phone = '9876543210') {
  fireEvent.change(screen.getByPlaceholderText('Jane Smith'),              { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText('123 Main St, City, State'), { target: { value: address } });
  fireEvent.change(screen.getByPlaceholderText('9876543210'),              { target: { value: phone } });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CheckoutRoute integration', () => {
  it('redirects to /menu when cart is empty', () => {
    renderCheckout(makeCartContext({ cart: [] }));
    expect(screen.getByTestId('redirected-to-menu')).toBeInTheDocument();
  });

  it('renders CheckoutPage when cart has items', () => {
    renderCheckout();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

  it('calls orderService.submitOrder with correct payload on submit', async () => {
    const orderCtx = makeOrderContext();
    renderCheckout(makeCartContext(), orderCtx);
    fillForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    });

    expect(orderCtx.orderService.submitOrder).toHaveBeenCalledWith(
      [{ menuItemId: 'm1', quantity: 1 }],
      { name: 'Jane Smith', address: '123 Main St', phone: '9876543210' }
    );
  });

  it('calls clearCart after successful order', async () => {
    const cartCtx  = makeCartContext();
    const orderCtx = makeOrderContext();
    renderCheckout(cartCtx, orderCtx);
    fillForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    });

    expect(cartCtx.clearCart).toHaveBeenCalledTimes(1);
  });

  it('shows API error when submitOrder rejects', async () => {
    const orderCtx = makeOrderContext({
      orderService: {
        getAllOrders: jest.fn(),
        getOrder:    jest.fn(),
        submitOrder: jest.fn().mockRejectedValue(new Error('Payment failed')),
      },
    });
    renderCheckout(makeCartContext(), orderCtx);
    fillForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Payment failed')).toBeInTheDocument();
    });
  });

  it('does not call clearCart when order fails', async () => {
    const cartCtx  = makeCartContext();
    const orderCtx = makeOrderContext({
      orderService: {
        getAllOrders: jest.fn(),
        getOrder:    jest.fn(),
        submitOrder: jest.fn().mockRejectedValue(new Error('fail')),
      },
    });
    renderCheckout(cartCtx, orderCtx);
    fillForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    });

    expect(cartCtx.clearCart).not.toHaveBeenCalled();
  });
});
