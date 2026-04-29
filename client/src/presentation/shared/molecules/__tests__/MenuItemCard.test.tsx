import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItemCard from '../MenuItemCard';
import type { MenuItem, CartItem } from '@/domain/models/types';

// framer-motion causes issues in jsdom — mock it
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>,
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement>) => <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/ui/magic-card', () => ({
  MagicCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock('@/components/ui/food-image', () => ({
  FoodImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const item: MenuItem = {
  id: 'item-1',
  name: 'Margherita Pizza',
  description: 'Classic tomato and mozzarella',
  price: 12.99,
  imageUrl: '/pizza.jpg',
};

describe('MenuItemCard', () => {
  it('renders item name and price', () => {
    render(<MenuItemCard item={item} onAddToCart={jest.fn()} onUpdateQuantity={jest.fn()} />);
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
  });

  it('shows "Add to Cart" when item is not in cart', () => {
    render(<MenuItemCard item={item} onAddToCart={jest.fn()} onUpdateQuantity={jest.fn()} />);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('calls onAddToCart with the item when clicked', () => {
    const onAdd = jest.fn();
    render(<MenuItemCard item={item} onAddToCart={onAdd} onUpdateQuantity={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onAdd).toHaveBeenCalledWith(item);
  });

  it('shows quantity controls when item is in cart', () => {
    const cartItem: CartItem = { menuItem: item, quantity: 2 };
    render(<MenuItemCard item={item} cartItem={cartItem} onAddToCart={jest.fn()} onUpdateQuantity={jest.fn()} />);
    expect(screen.getByText('2 in cart')).toBeInTheDocument();
    expect(screen.getByLabelText('decrease quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('increase quantity')).toBeInTheDocument();
  });

  it('calls onUpdateQuantity with qty+1 on increase', () => {
    const onUpdate = jest.fn();
    const cartItem: CartItem = { menuItem: item, quantity: 2 };
    render(<MenuItemCard item={item} cartItem={cartItem} onAddToCart={jest.fn()} onUpdateQuantity={onUpdate} />);
    fireEvent.click(screen.getByLabelText('increase quantity'));
    expect(onUpdate).toHaveBeenCalledWith('item-1', 3);
  });

  it('calls onUpdateQuantity with qty-1 on decrease', () => {
    const onUpdate = jest.fn();
    const cartItem: CartItem = { menuItem: item, quantity: 3 };
    render(<MenuItemCard item={item} cartItem={cartItem} onAddToCart={jest.fn()} onUpdateQuantity={onUpdate} />);
    fireEvent.click(screen.getByLabelText('decrease quantity'));
    expect(onUpdate).toHaveBeenCalledWith('item-1', 2);
  });

  it('shows "Read more" toggle for long descriptions', () => {
    const longItem = { ...item, description: 'A'.repeat(80) };
    render(<MenuItemCard item={longItem} onAddToCart={jest.fn()} onUpdateQuantity={jest.fn()} />);
    expect(screen.getByLabelText('Read more')).toBeInTheDocument();
  });

  it('does not show "Read more" for short descriptions', () => {
    render(<MenuItemCard item={item} onAddToCart={jest.fn()} onUpdateQuantity={jest.fn()} />);
    expect(screen.queryByLabelText('Read more')).not.toBeInTheDocument();
  });
});
