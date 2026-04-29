import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCartContext } from '../CartContext';
import type { MenuItem } from '@/domain/models/types';

function makeItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'item-1',
    name: 'Burger',
    description: 'A tasty burger',
    price: 9.99,
    imageUrl: '/burger.jpg',
    ...overrides,
  };
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.cartTotal).toBe(0);
  });

  it('addItem adds a new item with quantity 1', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });
    const item = makeItem();
    act(() => result.current.addItem(item));
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it('addItem increments quantity for existing item', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });
    const item = makeItem();
    act(() => { result.current.addItem(item); result.current.addItem(item); });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
  });

  it('updateQuantity changes quantity', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });
    const item = makeItem();
    act(() => result.current.addItem(item));
    act(() => result.current.updateQuantity('item-1', 5));
    expect(result.current.cart[0].quantity).toBe(5);
  });

  it('updateQuantity with 0 removes the item', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });
    act(() => result.current.addItem(makeItem()));
    act(() => result.current.updateQuantity('item-1', 0));
    expect(result.current.cart).toHaveLength(0);
  });

  it('removeItem removes the correct item', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });
    act(() => {
      result.current.addItem(makeItem({ id: 'item-1' }));
      result.current.addItem(makeItem({ id: 'item-2', name: 'Pizza' }));
    });
    act(() => result.current.removeItem('item-1'));
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].menuItem.id).toBe('item-2');
  });

  it('clearCart empties the cart', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });
    act(() => { result.current.addItem(makeItem()); result.current.addItem(makeItem({ id: 'item-2' })); });
    act(() => result.current.clearCart());
    expect(result.current.cart).toHaveLength(0);
  });

  it('cartTotal is sum of price * quantity, rounded to 2dp', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });
    act(() => {
      result.current.addItem(makeItem({ id: 'a', price: 9.99 }));
      result.current.addItem(makeItem({ id: 'a', price: 9.99 })); // qty 2
      result.current.addItem(makeItem({ id: 'b', price: 4.50 }));
    });
    // 9.99 * 2 + 4.50 * 1 = 24.48
    expect(result.current.cartTotal).toBe(24.48);
  });

  it('throws when used outside CartProvider', () => {
    // Suppress React error boundary noise
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCartContext())).toThrow(
      'useCartContext must be used within CartProvider'
    );
    spy.mockRestore();
  });
});
