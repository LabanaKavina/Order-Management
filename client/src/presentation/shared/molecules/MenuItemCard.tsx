import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { MagicCard } from '@/components/ui/magic-card';
import { FoodImage } from '@/components/ui/food-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/domain/models/types';
import type { CartItem } from '@/domain/models/types';

const TRUNCATE_AT = 72;

interface MenuItemCardProps {
  item: MenuItem;
  cartItem?: CartItem;
  index?: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
}

export default function MenuItemCard({ item, cartItem, index = 0, onAddToCart, onUpdateQuantity }: MenuItemCardProps) {
  const inCart = !!cartItem;
  const qty = cartItem?.quantity ?? 0;
  const isLong = item.description.length > TRUNCATE_AT;
  const [expanded, setExpanded] = useState(false);

  return (
    <MagicCard className="flex flex-col h-full">
      <div className="relative">
        <FoodImage src={item.imageUrl} alt={item.name} eager={index < 4} className="h-48 w-full rounded-t-xl transition-transform duration-500 group-hover:scale-105" />
        {inCart && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md">
            <Check size={12} strokeWidth={3} />
          </motion.div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-foreground leading-tight">{item.name}</h3>
        <div className="mt-1 flex-1">
          <p className={cn('text-sm text-muted-foreground transition-all duration-300', !expanded && isLong && 'line-clamp-2')}>
            {item.description}
          </p>
          {isLong && (
            <button onClick={() => setExpanded((v) => !v)} className="mt-1 flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors" aria-label={expanded ? 'Show less' : 'Read more'}>
              {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
            </button>
          )}
        </div>
        <p className="mt-3 text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
      </div>
      <div className="px-4 pb-4">
        <AnimatePresence mode="wait" initial={false}>
          {!inCart ? (
            <motion.div key="add" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              <Button className="w-full gap-2" onClick={() => onAddToCart(item)}>
                <ShoppingCart size={15} /> Add to Cart
              </Button>
            </motion.div>
          ) : (
            <motion.div key="controls" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="flex items-center justify-between gap-2">
              <Button variant="outline" size="icon" className={cn('h-9 w-9 shrink-0', qty === 1 && 'text-destructive border-destructive/40 hover:bg-destructive/10')} onClick={() => onUpdateQuantity(item.id, qty - 1)} aria-label="decrease quantity">
                <Minus size={14} />
              </Button>
              <span className="flex-1 text-center font-semibold text-sm tabular-nums">{qty} in cart</span>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => onUpdateQuantity(item.id, qty + 1)} aria-label="increase quantity">
                <Plus size={14} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MagicCard>
  );
}
