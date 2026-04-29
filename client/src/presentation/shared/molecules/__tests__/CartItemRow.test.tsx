import { render, screen, fireEvent } from '@testing-library/react';
import CartItemRow from '../CartItemRow';
import type { CartItem } from '@/domain/models/types';

jest.mock('@/components/ui/food-image', () => ({
  FoodImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

const cartItem: CartItem = {
  menuItem: {
    id: 'item-1',
    name: 'Chicken Wrap',
    description: 'Grilled chicken wrap',
    price: 8.5,
    imageUrl: '/wrap.jpg',
  },
  quantity: 3,
};

describe('CartItemRow', () => {
  it('renders item name and unit price', () => {
    render(<CartItemRow item={cartItem} onUpdateQuantity={jest.fn()} onRemove={jest.fn()} />);
    expect(screen.getByText('Chicken Wrap')).toBeInTheDocument();
    expect(screen.getByText('$8.50 each')).toBeInTheDocument();
  });

  it('renders correct line total', () => {
    render(<CartItemRow item={cartItem} onUpdateQuantity={jest.fn()} onRemove={jest.fn()} />);
    expect(screen.getByText('$25.50')).toBeInTheDocument();
  });

  it('renders current quantity', () => {
    render(<CartItemRow item={cartItem} onUpdateQuantity={jest.fn()} onRemove={jest.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onUpdateQuantity with qty+1 on increase', () => {
    const onUpdate = jest.fn();
    render(<CartItemRow item={cartItem} onUpdateQuantity={onUpdate} onRemove={jest.fn()} />);
    fireEvent.click(screen.getByLabelText('increase'));
    expect(onUpdate).toHaveBeenCalledWith('item-1', 4);
  });

  it('calls onUpdateQuantity with qty-1 on decrease', () => {
    const onUpdate = jest.fn();
    render(<CartItemRow item={cartItem} onUpdateQuantity={onUpdate} onRemove={jest.fn()} />);
    fireEvent.click(screen.getByLabelText('decrease'));
    expect(onUpdate).toHaveBeenCalledWith('item-1', 2);
  });

  it('calls onRemove with item id when trash button clicked', () => {
    const onRemove = jest.fn();
    render(<CartItemRow item={cartItem} onUpdateQuantity={jest.fn()} onRemove={onRemove} />);
    fireEvent.click(screen.getByLabelText('remove Chicken Wrap'));
    expect(onRemove).toHaveBeenCalledWith('item-1');
  });
});
