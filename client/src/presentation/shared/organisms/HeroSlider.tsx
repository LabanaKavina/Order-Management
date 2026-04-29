import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SLIDES = [
  { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=85', title: 'Crafted with Passion', sub: 'Every dish made fresh, delivered fast.' },
  { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1400&q=85', title: 'Bold Flavours', sub: 'From smoky BBQ to creamy pasta — we have it all.' },
  { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&q=85', title: 'Street Food Favourites', sub: 'Tacos, wraps and more — right to your door.' },
  { url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1400&q=85', title: 'Sweet Endings', sub: 'Desserts that make every meal complete.' },
];

const INTERVAL = 5000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '21/8' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence initial={false}>
        <motion.div key={current} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
          <img src={SLIDES[current].url} alt={SLIDES[current].title} className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="absolute bottom-0 left-0 p-6 sm:p-10">
            <h2 className="text-2xl font-extrabold text-white sm:text-4xl drop-shadow-lg">{SLIDES[current].title}</h2>
            <p className="mt-1 text-sm text-white/80 sm:text-base drop-shadow">{SLIDES[current].sub}</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <button onClick={prev} aria-label="Previous slide" className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors">
        <ChevronLeft size={18} />
      </button>
      <button onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors">
        <ChevronRight size={18} />
      </button>
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`} className={cn('h-1.5 rounded-full transition-all duration-300', i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80')} />
        ))}
      </div>
    </div>
  );
}
