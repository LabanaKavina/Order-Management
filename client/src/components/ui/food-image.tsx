import { useEffect, useRef, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

export function FoodImage({ src, alt, className, eager = false }: FoodImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView]   = useState(eager);
  const [loaded, setLoaded]   = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (eager) return;
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div ref={wrapperRef} className={cn('relative overflow-hidden bg-muted', className)}>
      {(!loaded || !inView) && !errored && <div className="absolute inset-0 shimmer" />}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-muted via-muted/80 to-muted/60">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/60">
            <UtensilsCrossed size={22} className="text-muted-foreground/50" />
          </div>
          <span className="px-2 text-center text-[11px] font-medium text-muted-foreground/60 leading-tight line-clamp-2">{alt}</span>
        </div>
      )}
      {inView && !errored && (
        <img src={src} alt={alt} decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => { setErrored(true); setLoaded(false); }}
          className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </div>
  );
}
