import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/presentation/theme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative flex h-8 w-14 items-center rounded-full border border-border p-0.5 transition-colors duration-300',
        isDark ? 'bg-primary/20 border-primary/40' : 'bg-muted border-border',
        className
      )}
    >
      <Sun  size={11} className="absolute left-1.5 text-amber-400 opacity-70" />
      <Moon size={11} className="absolute right-1.5 text-primary opacity-70" />
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={cn('relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-colors duration-300', isDark ? 'bg-primary ml-auto' : 'bg-white ml-0')}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span key="moon" initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Moon size={12} className="text-white" />
            </motion.span>
          ) : (
            <motion.span key="sun" initial={{ rotate: 30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -30, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sun size={12} className="text-amber-500" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
