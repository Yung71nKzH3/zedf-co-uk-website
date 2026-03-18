'use client';

import { useEffect, useRef } from 'react';

const TARGET_TEXT = "w1ll0w";
const PARTICLE_COLOR = '#06b6d4'; 
const RESOLUTION = 4; 
const HOVER_AREA_RADIUS = 200; 
const FRICTION = 0.9;
const SPRING = 0.08; 
const DRIFT_SPEED = 0.005; 

class Particle {
  targetX: number;
  targetY: number;
  shape: string;
  x: number;
  y: number;
  initialX: number;
  initialY: number;
  vx: number;
  vy: number;
  size: number;

  constructor(targetX: number, targetY: number, shape: string, box: {x: number, y: number, w: number, h: number}) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.shape = shape;
    this.x = box.x + Math.random() * box.w;
    this.y = box.y + Math.random() * box.h;
    this.initialX = this.x;
    this.initialY = this.y;
    this.vx = 0;
    this.vy = 0;
    this.size = Math.random() * 2 + 1; 
  }

  update(isFormed: boolean, box: {x: number, y: number, w: number, h: number}) {
    let targetX, targetY;
    
    if (isFormed) {
      targetX = this.targetX;
      targetY = this.targetY;
    } else {
      if (Math.random() < DRIFT_SPEED) {
        this.initialX = box.x + Math.random() * box.w;
        this.initialY = box.y + Math.random() * box.h;
      }
      targetX = this.initialX;
      targetY = this.initialY;
    }
    
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    
    this.vx += dx * SPRING;
    this.vy += dy * SPRING;
    this.vx *= FRICTION;
    this.vy *= FRICTION;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PARTICLE_COLOR;
    const s = this.size;

    ctx.beginPath();
    if (this.shape === 'square') {
      ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
    } else if (this.shape === 'circle') {
      ctx.arc(this.x, this.y, s / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'triangle') {
      ctx.moveTo(this.x, this.y - s);
      ctx.lineTo(this.x - s, this.y + s);
      ctx.lineTo(this.x + s, this.y + s);
      ctx.closePath();
      ctx.fill();
    }
  }
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isFormedRef = useRef(false);
  const animationRef = useRef<number>(0);
  
  const textMetricsRef = useRef({ width: 0, height: 120, textX: 0, textY: 0 });
  const boxRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let textSize = 120;

    const getResponsiveConfig = () => {
      if (window.innerWidth <= 768) {
        return { size: 80, yFactor: 0.45 };
      } else {
        return { size: 120, yFactor: 0.2 };
      }
    };

    const mapTextToParticles = () => {
      particlesRef.current = [];
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      tempCtx.font = `${textSize}px 'Inter', sans-serif`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      
      textMetricsRef.current.textX = tempCanvas.width / 2;
      textMetricsRef.current.width = tempCtx.measureText(TARGET_TEXT).width;
      
      tempCtx.fillStyle = 'white';
      tempCtx.fillText(TARGET_TEXT, textMetricsRef.current.textX, textMetricsRef.current.textY);
      
      const boxMargin = 100;
      boxRef.current.x = textMetricsRef.current.textX - textMetricsRef.current.width / 2 - boxMargin;
      boxRef.current.y = textMetricsRef.current.textY - textSize / 2 - boxMargin;
      boxRef.current.w = textMetricsRef.current.width + 2 * boxMargin;
      boxRef.current.h = textSize + 2 * boxMargin;

      const data = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
      const shapes = ['square', 'circle', 'triangle'];
      
      for (let y = 0; y < tempCanvas.height; y += RESOLUTION) {
        for (let x = 0; x < tempCanvas.width; x += RESOLUTION) {
          const index = (y * tempCanvas.width + x) * 4;
          if (data[index + 3] > 0) {
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            particlesRef.current.push(new Particle(x, y, randomShape, boxRef.current));
          }
        }
      }
    };

    const resizeCanvas = () => {
      if (window.innerWidth <= 768) {
        canvas.width = window.innerWidth;
        canvas.height = 300;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      const config = getResponsiveConfig();
      textSize = config.size;
      textMetricsRef.current.textY = canvas.height * config.yFactor;
      textMetricsRef.current.height = textSize;

      mapTextToParticles();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(p => {
        p.update(isFormedRef.current, boxRef.current);
        p.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const dx = mouseX - textMetricsRef.current.textX;
      const dy = mouseY - textMetricsRef.current.textY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < HOVER_AREA_RADIUS) {
        if (!isFormedRef.current) {
          isFormedRef.current = true;
        }
      } else {
        if (isFormedRef.current) {
          isFormedRef.current = false;
          particlesRef.current.forEach(p => {
            p.initialX = boxRef.current.x + Math.random() * boxRef.current.w;
            p.initialY = boxRef.current.y + Math.random() * boxRef.current.h;
          });
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Ensure font is loaded before measuring
    document.fonts.ready.then(() => {
      resizeCanvas();
      animate();
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-[300px] md:h-full z-0 pointer-events-none"
    />
  );
}
