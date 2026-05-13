import React, { useRef, useEffect, useCallback } from 'react';

// --- Type Definitions ---
interface Node {
  x: number;
  y: number;
  baseRadius: number;
  currentRadius: number;
  phase: number;
  connections: number[];
}

interface Spark {
  from: number;
  to: number;
  progress: number;
  speed: number;
}

interface SynapseLogoProps {
  size?: number;
  isDarkMode?: boolean;
  className?: string;
}

// --- Color Palette ---
const colors = {
  light: {
    core: '#3b82f6', // Blue 500
    coreGlow: 'rgba(59, 130, 246, 0.4)',
    nodes: '#8b5cf6', // Violet 500
    connections: 'rgba(139, 92, 246, 0.4)',
    sparks: '#f59e0b', // Amber 500
    background: 'transparent',
  },
  dark: {
    core: '#60a5fa', // Blue 400
    coreGlow: 'rgba(96, 165, 250, 0.6)',
    nodes: '#a78bfa', // Violet 400
    connections: 'rgba(167, 139, 250, 0.5)',
    sparks: '#fbbf24', // Amber 400
    background: 'transparent',
  },
};

// --- Main Component ---
const SynapseLogo: React.FC<SynapseLogoProps> = ({
  size = 48,
  isDarkMode = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const timeRef = useRef<number>(0);

  const palette = isDarkMode ? colors.dark : colors.light;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = size / 64; // base unit scale

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Update Nodes ---
    nodesRef.current.forEach(node => {
      node.currentRadius = node.baseRadius + Math.sin(timeRef.current * 0.05 + node.phase) * (node.baseRadius * 0.3);
    });

    // --- Draw Connections ---
    ctx.lineWidth = 1.5 * scale;
    nodesRef.current.forEach((node, i) => {
      node.connections.forEach(connIndex => {
        const targetNode = nodesRef.current[connIndex];
        if (!targetNode) return;

        const gradient = ctx.createLinearGradient(node.x, node.y, targetNode.x, targetNode.y);
        gradient.addColorStop(0, palette.nodes);
        gradient.addColorStop(1, palette.core);
        
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = gradient;
        ctx.stroke();
      });
    });

    // --- Draw Nodes ---
    nodesRef.current.forEach(node => {
      const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.currentRadius * 3);
      glowGradient.addColorStop(0, palette.coreGlow);
      glowGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.currentRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = palette.nodes;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();
    });

    // --- Draw Sparks ---
    ctx.shadowBlur = 10;
    ctx.shadowColor = palette.sparks;
    sparksRef.current.forEach(spark => {
      const fromNode = nodesRef.current[spark.from];
      const toNode = nodesRef.current[spark.to];
      if (!fromNode || !toNode) return;

      const x = fromNode.x + (toNode.x - fromNode.x) * spark.progress;
      const y = fromNode.y + (toNode.y - fromNode.y) * spark.progress;

      ctx.beginPath();
      ctx.arc(x, y, 2 * scale, 0, Math.PI * 2);
      ctx.fillStyle = palette.sparks;
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // --- Draw Core ---
    const coreBreathing = 6 * scale + Math.sin(timeRef.current * 0.02) * (1.5 * scale);
    
    const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreBreathing * 4);
    coreGlow.addColorStop(0, palette.coreGlow);
    coreGlow.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(centerX, centerY, coreBreathing * 4, 0, Math.PI * 2);
    ctx.fillStyle = coreGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, coreBreathing, 0, Math.PI * 2);
    ctx.fillStyle = palette.core;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // --- Advance Sparks ---
    sparksRef.current = sparksRef.current.filter(spark => {
      spark.progress += spark.speed;
      if (spark.progress >= 1) {
        spark.from = spark.to;
        spark.to = Math.floor(Math.random() * nodesRef.current.length);
        spark.progress = 0;
        spark.speed = 0.005 + Math.random() * 0.02;
      }
      return true;
    });

    timeRef.current += 1;
    animationFrameId.current = requestAnimationFrame(draw);
  }, [size, palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasSize = size * 2; // retina scaling
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const radius = size * 0.7;

    // Create neural network nodes in a symmetric pattern
    const nodePositions = [
      { angle: -Math.PI / 2, dist: radius * 0.7 }, // top
      { angle: Math.PI / 2, dist: radius * 0.7 },  // bottom
      { angle: Math.PI, dist: radius * 0.7 },      // left
      { angle: 0, dist: radius * 0.7 },            // right
      { angle: -Math.PI / 4, dist: radius * 0.5 }, // top-right
      { angle: Math.PI / 4, dist: radius * 0.5 },  // bottom-right
      { angle: Math.PI * 3/4, dist: radius * 0.5 },// top-left
      { angle: -Math.PI * 3/4, dist: radius * 0.5 },// bottom-left
    ];

    nodesRef.current = nodePositions.map((pos, index) => ({
      x: centerX + Math.cos(pos.angle) * pos.dist,
      y: centerY + Math.sin(pos.angle) * pos.dist,
      baseRadius: 3,
      currentRadius: 3,
      phase: index * (Math.PI / 4),
      connections: [(index + 1) % nodePositions.length, (index + 3) % nodePositions.length],
    }));

    sparksRef.current = [
      { from: 0, to: 1, progress: 0, speed: 0.01 },
      { from: 2, to: 3, progress: 0.5, speed: 0.015 },
      { from: 4, to: 5, progress: 0.2, speed: 0.008 },
    ];

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [size, draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-full ${className}`}
      aria-label="Synapse Logo"
      role="img"
    />
  );
};

export default SynapseLogo;