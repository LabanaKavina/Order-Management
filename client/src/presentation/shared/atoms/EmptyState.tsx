import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  subMessage?: string;
}

export default function EmptyState({ icon: Icon, message, subMessage }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Icon size={36} className="opacity-50" />
      </div>
      <p className="text-lg font-semibold text-foreground">{message}</p>
      {subMessage && <p className="text-sm text-muted-foreground">{subMessage}</p>}
    </div>
  );
}
