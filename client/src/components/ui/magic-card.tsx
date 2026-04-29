import React, { useCallback, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientColor?: string;
}

export function MagicCard({ children, className, gradientColor = 'rgba(16,185,129,0.12)' }: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-999);
    mouseY.set(-999);
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 80%)`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card',
        'shadow-card transition-all duration-300 ease-spring',
        'hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/30',
        className
      )}
    >
      <motion.div className="pointer-events-none absolute inset-0 z-0" style={{ background }} />
      <div className="pointer-events-none absolute inset-0 z-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ring-1 ring-primary/20" />
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  );
}
