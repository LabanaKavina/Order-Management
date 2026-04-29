import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CartItemRow from '@/presentation/shared/molecules/CartItemRow';
import EmptyState from '@/presentation/shared/atoms/EmptyState';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CartItem } from '@/domain/models/types';

interface CartPageProps {
  cart: CartItem[];
  cartTotal: number;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemove: (menuItemId: string) => void;
}

export default function CartPage({ cart, cartTotal, onUpdateQuantity, onRemove }: CartPageProps) {
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-extrabold">Your Cart</h1>
        <EmptyState icon={ShoppingCart} message="Your cart is empty" subMessage="Browse the menu and add some items." />
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate('/')}>Browse Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">Your Cart</h1>
      <div className="rounded-xl border border-border bg-card p-4">
        {cart.map((item) => (
          <CartItemRow key={item.menuItem.id} item={item} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} />
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Subtotal ({cart.reduce((s, c) => s + c.quantity, 0)} items)</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-3">
          <span>Delivery</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
        <Separator className="mb-3" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">${cartTotal.toFixed(2)}</span>
        </div>
        <Button size="lg" className="mt-5 w-full gap-2" onClick={() => navigate('/checkout')}>
          Proceed to Checkout <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
