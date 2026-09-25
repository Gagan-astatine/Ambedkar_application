import React from 'react';

export default function GlowPillar({ 
  color = 'rgba(255, 236, 39, 0.6)', 
  width = '80px', 
  left = '50%', 
  rotation = '0deg', 
  delay = '0s',
  opacity = 0.5
}) {
  return (
    <div 
      className="absolute top-[-10%] h-[120%] pointer-events-none animate-sway mix-blend-screen"
      style={{
        width,
        left,
        transformOrigin: 'center',
        transform: `translateX(-50%) rotate(${rotation})`,
        background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
        filter: 'blur(45px)',
        opacity,
        animationDelay: delay,
        zIndex: 0
      }}
    />
  );
}
