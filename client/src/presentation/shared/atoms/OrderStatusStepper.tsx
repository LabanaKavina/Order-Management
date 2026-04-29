import { CheckCircle2, Clock } from 'lucide-react';
import { STATUS_SEQUENCE, type OrderStatus } from '@/domain/models/types';
import { cn } from '@/lib/utils';

const STEP_ICONS = ['🧾', '👨‍🍳', '🛵', '✅'];

interface OrderStatusStepperProps {
  status: OrderStatus;
}

export default function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const activeStep = STATUS_SEQUENCE.indexOf(status);

  return (
    <div className="flex items-start justify-between w-full gap-2">
      {STATUS_SEQUENCE.map((label, idx) => {
        const done = idx < activeStep;
        const active = idx === activeStep;
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <div className={cn('flex-1 h-0.5 transition-colors duration-500', idx === 0 ? 'invisible' : done || active ? 'bg-primary' : 'bg-border')} />
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all duration-500',
                done ? 'border-primary bg-primary text-white' : active ? 'border-primary bg-primary/10 text-primary scale-110 shadow-md shadow-primary/20' : 'border-border bg-muted text-muted-foreground'
              )}>
                {done ? <CheckCircle2 size={18} className="text-white" /> : active ? <Clock size={18} /> : <span className="text-base">{STEP_ICONS[idx]}</span>}
              </div>
              <div className={cn('flex-1 h-0.5 transition-colors duration-500', idx === STATUS_SEQUENCE.length - 1 ? 'invisible' : done ? 'bg-primary' : 'bg-border')} />
            </div>
            <span className={cn(
              'text-center text-xs font-medium leading-tight transition-colors',
              active ? 'text-primary font-semibold' : done ? 'text-primary/70' : 'text-muted-foreground'
            )}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
