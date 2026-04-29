import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, User, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FoodImage } from '@/components/ui/food-image';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/domain/models/types';
import type { DeliveryDetails } from '@/domain/models/types';

const PHONE_REGEX = /^\d{10}$/;

interface CheckoutPageProps {
  cart: CartItem[];
  cartTotal: number;
  onPlaceOrder: (items: { menuItemId: string; quantity: number }[], delivery: DeliveryDetails) => Promise<{ id: string }>;
  onClearCart: () => void;
}

interface FieldState { value: string; touched: boolean; }

const VALIDATORS = {
  name:    (v: string) => v.trim() ? null : 'Full name is required',
  address: (v: string) => v.trim() ? null : 'Delivery address is required',
  phone:   (v: string) => {
    const digits = v.replace(/\D/g, '');
    if (!v.trim()) return 'Phone number is required';
    if (digits.length < 10) return 'Phone number must be exactly 10 digits';
    if (digits.length > 10) return 'Phone number must be exactly 10 digits';
    if (!PHONE_REGEX.test(digits)) return 'Enter digits only (no spaces or dashes)';
    return null;
  },
};

function getFieldError(field: keyof typeof VALIDATORS, value: string): string | null {
  return VALIDATORS[field](value);
}

function Field({ label, icon: Icon, error, touched, valid, iconAlign = 'center', children }: {
  label: string; icon: React.ElementType; error: string | null; touched: boolean; valid: boolean; iconAlign?: 'center' | 'top'; children: React.ReactNode;
}) {
  const showError = touched && !!error;
  const showValid = touched && valid;
  return (
    <div className="space-y-1.5">
      <Label className={cn('flex items-center gap-1.5 text-sm font-medium', showError && 'text-destructive')}>
        <Icon size={13} className="opacity-60 shrink-0" />{label}
      </Label>
      <div className="relative">
        {children}
        <AnimatePresence>
          {showValid && (
            <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.15 }} className={cn('pointer-events-none absolute right-3 text-emerald-500', iconAlign === 'center' ? 'top-1/2 -translate-y-1/2' : 'top-2.5')}>
              <CheckCircle2 size={15} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showError && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive overflow-hidden">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CheckoutPage({ cart, cartTotal, onPlaceOrder, onClearCart }: CheckoutPageProps) {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Record<keyof typeof VALIDATORS, FieldState>>({
    name: { value: '', touched: false }, address: { value: '', touched: false }, phone: { value: '', touched: false },
  });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const errors = useMemo(() => ({
    name: getFieldError('name', fields.name.value),
    address: getFieldError('address', fields.address.value),
    phone: getFieldError('phone', fields.phone.value),
  }), [fields]);

  const isFormValid = !errors.name && !errors.address && !errors.phone && cart.length > 0;
  const validCount = [!errors.name && fields.name.value.trim(), !errors.address && fields.address.value.trim(), !errors.phone && fields.phone.value.trim()].filter(Boolean).length;
  const progressPct = Math.round((validCount / 3) * 100);

  function handleChange(field: keyof typeof VALIDATORS) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let val = e.target.value;
      if (field === 'phone') val = val.replace(/\D/g, '').slice(0, 10);
      setFields((prev) => ({ ...prev, [field]: { value: val, touched: true } }));
      setApiError(null);
    };
  }

  function handleBlur(field: keyof typeof VALIDATORS) {
    return () => setFields((prev) => ({ ...prev, [field]: { ...prev[field], touched: true } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const items = cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity }));
      const delivery: DeliveryDetails = { name: fields.name.value.trim(), address: fields.address.value.trim(), phone: fields.phone.value.trim() };
      const order = await onPlaceOrder(items, delivery);
      onClearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const isValid = (f: keyof typeof VALIDATORS) => !errors[f] && fields[f].value.trim().length > 0;
  const borderClass = (f: keyof typeof VALIDATORS) => cn('pr-9 transition-colors', fields[f].touched && errors[f] && 'border-destructive focus-visible:ring-destructive', fields[f].touched && !errors[f] && fields[f].value && 'border-emerald-400 focus-visible:ring-emerald-400');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 page-enter">
      <h1 className="mb-1 text-3xl font-extrabold">Checkout</h1>
      <p className="mb-8 text-sm text-muted-foreground">Fill in your delivery details to place the order.</p>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Delivery Details</h2>
              <span className="text-xs text-muted-foreground tabular-nums">{validCount}/3 fields</span>
            </div>
            <div className="mb-5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ type: 'spring', stiffness: 200, damping: 25 }} />
            </div>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Field label="Full Name" icon={User} error={errors.name} touched={fields.name.touched} valid={isValid('name')} iconAlign="center">
                <Input placeholder="Jane Smith" value={fields.name.value} onChange={handleChange('name')} onBlur={handleBlur('name')} autoComplete="name" className={borderClass('name')} />
              </Field>
              <Field label="Delivery Address" icon={MapPin} error={errors.address} touched={fields.address.touched} valid={isValid('address')} iconAlign="top">
                <textarea rows={2} placeholder="123 Main St, City, State" value={fields.address.value} onChange={handleChange('address')} onBlur={handleBlur('address')} autoComplete="street-address" className={cn('flex w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors', fields.address.touched && errors.address && 'border-destructive focus-visible:ring-destructive', fields.address.touched && !errors.address && fields.address.value && 'border-emerald-400 focus-visible:ring-emerald-400')} />
              </Field>
              <Field label="Phone Number" icon={Phone} error={errors.phone} touched={fields.phone.touched} valid={isValid('phone')} iconAlign="center">
                <Input type="tel" inputMode="numeric" placeholder="9876543210" maxLength={10} value={fields.phone.value} onChange={handleChange('phone')} onBlur={handleBlur('phone')} autoComplete="tel" className={borderClass('phone')} />
                <span className={cn('absolute right-9 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none', fields.phone.value.length === 10 ? 'text-emerald-500' : 'text-muted-foreground')}>
                  {fields.phone.value.length}/10
                </span>
              </Field>
              {apiError && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {apiError}
                </motion.div>
              )}
              <div className="pt-1">
                <Button type="submit" size="lg" className="w-full gap-2" disabled={!isFormValid || submitting}>
                  {submitting ? <><Loader2 size={16} className="animate-spin" />Placing Order…</> : <><ShieldCheck size={16} />Place Order</>}
                </Button>
                <AnimatePresence>
                  {!isFormValid && !submitting && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 text-center text-xs text-muted-foreground overflow-hidden">
                      Complete all fields above to continue
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card sticky top-24">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="flex items-center gap-3">
                  <FoodImage src={item.menuItem.imageUrl} alt={item.menuItem.name} className="h-10 w-10 rounded-md shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.menuItem.name}</p>
                    <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Delivery</span><span className="text-emerald-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span><span className="text-primary">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
