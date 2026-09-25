import React, { useEffect, useRef, useState } from 'react';

export default function SectionBlock({ eyebrow, headline, description, imageLabel, reverse = false }) {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion || !imageRef.current) return;
      
      const rect = imageRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Only animate if in viewport
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const scrolled = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        const yOffset = (scrolled - 0.5) * 40; // max 20px shift up/down
        imageRef.current.style.transform = `translateY(${yOffset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`container mx-auto px-6 py-24 flex flex-col gap-16 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        reverse ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="flex-1 space-y-6">
        <p className="text-brand-gold uppercase tracking-[0.2em] text-xs font-bold">{eyebrow}</p>
        
        <div className="relative inline-block">
          <h2 className="text-4xl md:text-5xl font-serif leading-tight">{headline}</h2>
          <div 
            className={`h-px bg-brand-gold absolute bottom-0 left-0 transition-all duration-1000 delay-300 ease-out motion-reduce:w-full ${
              isVisible ? 'w-full' : 'w-0'
            }`}
          />
        </div>

        <p className="text-brand-cream/70 text-lg leading-relaxed font-light mt-6">
          {description}
        </p>
      </div>
      
      <div className="flex-1 w-full aspect-[4/3] bg-brand-black border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-black/80 to-brand-black/20 z-10 pointer-events-none" />
        <div 
          ref={imageRef}
          className="absolute -inset-10 flex items-center justify-center motion-reduce:transform-none"
        >
          <img 
            src={`/images/covers/placeholder${imageLabel}.jpg`} 
            alt={headline} 
            className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" 
          />
        </div>
      </div>
    </section>
  );
}
