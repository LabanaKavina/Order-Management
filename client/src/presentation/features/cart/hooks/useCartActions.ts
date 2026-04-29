import { useCartContext } from '@/presentation/shared/contexts/CartContext';

export function useCartActions() {
  return useCartContext();
}
