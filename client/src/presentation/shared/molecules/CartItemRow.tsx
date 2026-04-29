import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FoodImage } from '@/components/ui/food-image';
import type { CartItem } from '@/domain/models/types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemove: (menuItemId: string) => void;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { menuItem, quantity } = item;
  const lineTotal = (menuItem.price * quantity).toFixed(2);

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <FoodImage src={menuItem.imageUrl} alt={menuItem.name} className="h-16 w-16 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{menuItem.name}</p>
          <p className="text-sm text-muted-foreground">${menuItem.price.toFixed(2)} each</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(menuItem.id, quantity - 1)} aria-label="decrease">
            <Minus size={12} />
          </Button>
          <span className="w-6 text-center text-sm font-semibold tabular-nums">{quantity}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(menuItem.id, quantity + 1)} aria-label="increase">
            <Plus size={12} />
          </Button>
        </div>
        <p className="w-16 text-right font-semibold text-foreground tabular-nums">${lineTotal}</p>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemove(menuItem.id)} aria-label={`remove ${menuItem.name}`}>
          <Trash2 size={15} />
        </Button>
      </div>
      <Separator />
    </>
  );
}
