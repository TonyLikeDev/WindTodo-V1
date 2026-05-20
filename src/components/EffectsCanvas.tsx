'use client';

import { useEffect, useRef } from 'react';

// 1. Play magical crystal sound
export function playCelestialChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Main note (high sweet bell)
    const osc1 = ctx.createOscillator();
    const gainNode1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1100, now);
    osc1.frequency.exponentialRampToValueAtTime(1250, now + 0.1);
    
    // Perfect fifth note (glowing metallic resonance)
    const osc2 = ctx.createOscillator();
    const gainNode2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1650, now); // 1.5x harmonic
    osc2.frequency.exponentialRampToValueAtTime(1850, now + 0.12);
    
    // Subtle higher sparkle harmonic
    const osc3 = ctx.createOscillator();
    const gainNode3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(2200, now); // 2x harmonic
    
    // Envelopes
    gainNode1.gain.setValueAtTime(0, now);
    gainNode1.gain.linearRampToValueAtTime(0.18, now + 0.005);
    gainNode1.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    
    gainNode2.gain.setValueAtTime(0, now);
    gainNode2.gain.linearRampToValueAtTime(0.06, now + 0.005);
    gainNode2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    
    gainNode3.gain.setValueAtTime(0, now);
    gainNode3.gain.linearRampToValueAtTime(0.03, now + 0.002);
    gainNode3.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    
    osc1.connect(gainNode1);
    osc2.connect(gainNode2);
    osc3.connect(gainNode3);
    
    gainNode1.connect(ctx.destination);
    gainNode2.connect(ctx.destination);
    gainNode3.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    
    osc1.stop(now + 0.75);
    osc2.stop(now + 0.4);
    osc3.stop(now + 0.25);
  } catch (e) {
    console.error('AudioContext failed to play', e);
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  decay: number;
  type: 'star' | 'circle' | 'sparkle';
  spikes?: number;
}

export default function EffectsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Particle loop
    let animationId: number;
    
    const drawStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      color: string,
      alpha: number,
      rotation: number
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rotation);
      c.beginPath();
      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      c.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(0, -outerRadius);
      c.closePath();
      c.fillStyle = color;
      c.globalAlpha = alpha;
      
      // Shadow glow effect
      c.shadowBlur = 8;
      c.shadowColor = color;
      
      c.fill();
      c.restore();
    };

    const updateAndRender = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (p.type === 'star') {
          drawStar(ctx, p.x, p.y, p.spikes || 5, p.size, p.size / 2.2, p.color, p.alpha, p.rotation);
        } else if (p.type === 'sparkle') {
          drawStar(ctx, p.x, p.y, 4, p.size, p.size / 4, p.color, p.alpha, p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 4;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(updateAndRender);
    };
    updateAndRender();

    // Event listener for sparkle trigger
    const COLORS = [
      '#FFD700', // Gold
      '#FFF',    // White
      '#FF69B4', // Hot Pink
      '#87CEEB', // Sky Blue
      '#98FB98', // Pale Green
      '#DDA0DD'  // Plum
    ];

    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      const { x, y } = customEvent.detail;

      // Burst of particles
      const count = 25 + Math.floor(Math.random() * 12);
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4.5;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const size = 3.5 + Math.random() * 7;
        const typeRand = Math.random();
        const type = typeRand < 0.4 ? 'star' : typeRand < 0.8 ? 'sparkle' : 'circle';

        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.8, // Slight upward bias
          size,
          color,
          alpha: 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          gravity: 0.12 + Math.random() * 0.08,
          decay: 0.012 + Math.random() * 0.012,
          type,
          spikes: Math.floor(Math.random() * 2) + 5 // 5 or 6 spikes for stars
        });
      }

      particlesRef.current.push(...newParticles);
    };

    window.addEventListener('star-confetti', handleTrigger);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('star-confetti', handleTrigger);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
