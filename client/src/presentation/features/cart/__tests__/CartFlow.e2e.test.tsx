/**
 * E2E-style integration test: simulates a user adding items to the cart,
 * updating quantities, removing items, and verifying totals — all wired
 * through the real CartContext (no mocks for the context itself).
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCartContext } from '@/presentation/shared/contexts/CartContext';
import type { MenuItem } from '@/domain/models/types';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>,
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement>) => <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/ui/food-image', () => ({
  FoodImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock('@/components/ui/magic-card', () => ({
  MagicCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

// Minimal inline cart UI driven by real CartContext
function CartTestUI({ items }: { items: MenuItem[] }) {
  const { cart, cartTotal, addItem, updateQuantity, removeItem } = useCartContext();
  return (
    <div>
      <section aria-label="menu">
        {items.map((item) => (
          <button key={item.id} onClick={() => addItem(item)} aria-label={`add ${item.name}`}>
            {item.name} ${item.price.toFixed(2)}
          </button>
        ))}
      </section>
      <section aria-label="cart">
        {cart.map((c) => (
          <div key={c.menuItem.id} data-testid={`cart-row-${c.menuItem.id}`}>
            <span>{c.menuItem.name}</span>
            <span data-testid={`qty-${c.menuItem.id}`}>{c.quantity}</span>
            <button onClick={() => updateQuantity(c.menuItem.id, c.quantity + 1)} aria-label={`inc ${c.menuItem.name}`}>+</button>
            <button onClick={() => updateQuantity(c.menuItem.id, c.quantity - 1)} aria-label={`dec ${c.menuItem.name}`}>-</button>
            <button onClick={() => removeItem(c.menuItem.id)} aria-label={`remove ${c.menuItem.name}`}>×</button>
          </div>
        ))}
        <div data-testid="total">${cartTotal.toFixed(2)}</div>
      </section>
    </div>
  );
}

const menuItems: MenuItem[] = [
  { id: 'p1', name: 'Pizza', description: '', price: 10.00, imageUrl: '' },
  { id: 'p2', name: 'Pasta', description: '', price: 7.50, imageUrl: '' },
];

function setup() {
  return render(
    <CartProvider>
      <CartTestUI items={menuItems} />
    </CartProvider>
  );
}

describe('Cart flow (E2E)', () => {
  it('cart is empty on load', () => {
    setup();
    expect(screen.getByTestId('total')).toHaveTextContent('$0.00');
    expect(screen.queryByTestId('cart-row-p1')).not.toBeInTheDocument();
  });

  it('adding an item shows it in the cart', () => {
    setup();
    fireEvent.click(screen.getByLabelText('add Pizza'));
    expect(screen.getByTestId('cart-row-p1')).toBeInTheDocument();
    expect(screen.getByTestId('qty-p1')).toHaveTextContent('1');
  });

  it('adding the same item twice increments quantity', () => {
    setup();
    fireEvent.click(screen.getByLabelText('add Pizza'));
    fireEvent.click(screen.getByLabelText('add Pizza'));
    expect(screen.getByTestId('qty-p1')).toHaveTextContent('2');
  });

  it('total updates correctly with multiple items', () => {
    setup();
    fireEvent.click(screen.getByLabelText('add Pizza'));   // 10.00
    fireEvent.click(screen.getByLabelText('add Pasta'));   // 7.50
    fireEvent.click(screen.getByLabelText('add Pizza'));   // 10.00 * 2 = 20.00
    // total = 20.00 + 7.50 = 27.50
    expect(screen.getByTestId('total')).toHaveTextContent('$27.50');
  });

  it('increment button increases quantity', () => {
    setup();
    fireEvent.click(screen.getByLabelText('add Pizza'));
    fireEvent.click(screen.getByLabelText('inc Pizza'));
    expect(screen.getByTestId('qty-p1')).toHaveTextContent('2');
  });

  it('decrement to 0 removes item from cart', () => {
    setup();
    fireEvent.click(screen.getByLabelText('add Pizza'));
    fireEvent.click(screen.getByLabelText('dec Pizza'));
    expect(screen.queryByTestId('cart-row-p1')).not.toBeInTheDocument();
  });

  it('remove button removes item', () => {
    setup();
    fireEvent.click(screen.getByLabelText('add Pizza'));
    fireEvent.click(screen.getByLabelText('add Pasta'));
    fireEvent.click(screen.getByLabelText('remove Pizza'));
    expect(screen.queryByTestId('cart-row-p1')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-row-p2')).toBeInTheDocument();
  });

  it('total resets to 0 after removing all items', () => {
    setup();
    fireEvent.click(screen.getByLabelText('add Pizza'));
    fireEvent.click(screen.getByLabelText('remove Pizza'));
    expect(screen.getByTestId('total')).toHaveTextContent('$0.00');
  });
});
