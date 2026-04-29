import { useState, useMemo } from 'react';
import { UtensilsCrossed, Search, X, SlidersHorizontal } from 'lucide-react';
import MenuItemCard from '@/presentation/shared/molecules/MenuItemCard';
import EmptyState from '@/presentation/shared/atoms/EmptyState';
import HeroSlider from '@/presentation/shared/organisms/HeroSlider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMenuData } from './hooks/useMenuData';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { MenuItem } from '@/domain/models/types';
import type { CartItem } from '@/domain/models/types';

interface MenuPageProps {
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  cart: CartItem[];
}

type PriceRange = 'all' | 'under10' | '10to15' | 'over15';

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
          <div className="h-48 bg-muted" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/5 rounded bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
            <div className="h-3 w-2/5 rounded bg-muted" />
            <div className="mt-4 h-9 rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MenuPage({ onAddToCart, onUpdateQuantity, cart }: MenuPageProps) {
  const { menuItems, loading, error } = useMenuData();
  const cartMap = new Map(cart.map((c) => [c.menuItem.id, c]));

  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceRange>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query to avoid excessive filtering
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let items = menuItems;

    // Apply search filter (name only)
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      items = items.filter((item) => {
        if (priceFilter === 'under10') return item.price < 10;
        if (priceFilter === '10to15') return item.price >= 10 && item.price <= 15;
        if (priceFilter === 'over15') return item.price > 15;
        return true;
      });
    }

    return items;
  }, [menuItems, debouncedSearch, priceFilter]);

  const priceRanges: { value: PriceRange; label: string }[] = [
    { value: 'all', label: 'All Prices' },
    { value: 'under10', label: 'Under $10' },
    { value: '10to15', label: '$10 - $15' },
    { value: 'over15', label: 'Over $15' },
  ];

  const activeFiltersCount = (priceFilter !== 'all' ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
      <HeroSlider />
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Our Menu</h1>
        <p className="mt-1 text-muted-foreground">Fresh ingredients, bold flavours — delivered to your door.</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative gap-2"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="rounded-lg border border-border bg-card p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Price Range</h3>
              {priceFilter !== 'all' && (
                <button
                  onClick={() => setPriceFilter('all')}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range) => (
                <Badge
                  key={range.value}
                  variant={priceFilter === range.value ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setPriceFilter(range.value)}
                >
                  {range.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            {debouncedSearch && ` for "${debouncedSearch}"`}
          </div>
        )}
      </div>

      {/* Menu Items Grid */}
      {loading && <MenuSkeleton />}
      {!loading && error && <p className="text-destructive">Failed to load menu: {error}</p>}
      {!loading && !error && filteredItems.length === 0 && (
        <EmptyState
          icon={UtensilsCrossed}
          message={searchQuery || priceFilter !== 'all' ? 'No items match your filters' : 'No items available'}
          subMessage={searchQuery || priceFilter !== 'all' ? 'Try adjusting your search or filters' : 'Check back soon for our delicious offerings.'}
        />
      )}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item, i) => (
            <MenuItemCard
              key={item.id}
              item={item}
              index={i}
              cartItem={cartMap.get(item.id)}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
