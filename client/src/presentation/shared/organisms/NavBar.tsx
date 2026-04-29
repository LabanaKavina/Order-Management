import { ShoppingCart, UtensilsCrossed, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface NavBarProps {
  cartCount?: number;
}

const navLinks = [
  { to: '/menu',   label: 'Menu',   icon: UtensilsCrossed },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
];

export default function NavBar({ cartCount = 0 }: NavBarProps) {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/menu" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <UtensilsCrossed size={16} />
          </span>
          <span className="hidden sm:inline">FoodDash</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200', pathname.startsWith(to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link to="/cart" className="hidden sm:block">
            <Button variant="outline" size="sm" className="relative gap-2">
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white animate-bounce-in">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
      <nav className="sm:hidden flex border-t border-border/40 bg-background/95 backdrop-blur-sm">
        {[...navLinks, { to: '/cart', label: 'Cart', icon: ShoppingCart }].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className={cn('relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors', pathname.startsWith(to) ? 'text-primary' : 'text-muted-foreground')}>
            <Icon size={18} />
            {label}
            {to === '/cart' && cartCount > 0 && (
              <span className="absolute top-1 right-[calc(50%-20px)] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </header>
  );
}
