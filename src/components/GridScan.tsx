import React, { useEffect, useRef } from 'react';

interface GridScanProps {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  enablePost?: boolean;
  bloomIntensity?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
  lineJitter?: number;
  scanGlow?: number;
  scanSoftness?: number;
  enableWebcam?: boolean;
  showPreview?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const GridScan: React.FC<GridScanProps> = ({
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = '#2F293A',
  gridScale = 0.1,
  scanColor = '#FF9FFC',
  scanOpacity = 0.4,
  enablePost = true,
  bloomIntensity = 0.6,
  chromaticAberration = 0.002,
  noiseIntensity = 0.01,
  lineJitter = 0.1,
  scanGlow = 0.5,
  scanSoftness = 2,
  enableWebcam = false,
  showPreview = false,
  className = '',
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const rect = container.getBoundingClientRect();
        mouseRef.current = {
          x: (touch.clientX - rect.left) / rect.width,
          y: (touch.clientY - rect.top) / rect.height,
        };
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove);

    const draw = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.clearRect(0, 0, width, height);

      // 绘制网格
      ctx.strokeStyle = linesColor;
      ctx.lineWidth = lineThickness;
      ctx.globalAlpha = 0.3;

      const gridSize = Math.max(20, gridScale * 100);
      const offsetX = (mouseRef.current.x - 0.5) * sensitivity * 10;
      const offsetY = (mouseRef.current.y - 0.5) * sensitivity * 10;

      // 垂直线
      for (let x = -gridSize + (timeRef.current % (gridSize * 2)); x < width + gridSize; x += gridSize) {
        const jitter = lineJitter * Math.sin(x * 0.05 + timeRef.current * 0.002);
        ctx.beginPath();
        ctx.moveTo(x + offsetX + jitter, 0);
        ctx.lineTo(x + offsetX - jitter, height);
        ctx.stroke();
      }

      // 水平线
      for (let y = -gridSize + (timeRef.current % (gridSize * 2)); y < height + gridSize; y += gridSize) {
        const jitter = lineJitter * Math.cos(y * 0.05 + timeRef.current * 0.002);
        ctx.beginPath();
        ctx.moveTo(0, y + offsetY + jitter);
        ctx.lineTo(width, y + offsetY - jitter);
        ctx.stroke();
      }

      // 绘制扫描线
      const scanY = (Math.sin(timeRef.current * 0.003) * 0.5 + 0.5) * height;
      const scanGradient = ctx.createLinearGradient(0, scanY - 50 * scanSoftness, 0, scanY + 50 * scanSoftness);
      scanGradient.addColorStop(0, 'transparent');
      scanGradient.addColorStop(0.5 - scanGlow * 0.1, scanColor);
      scanGradient.addColorStop(0.5, scanColor);
      scanGradient.addColorStop(0.5 + scanGlow * 0.1, scanColor);
      scanGradient.addColorStop(1, 'transparent');

      ctx.globalAlpha = scanOpacity;
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanY - 50 * scanSoftness, width, 100 * scanSoftness);

      // 添加噪点
      if (noiseIntensity > 0) {
        ctx.globalAlpha = noiseIntensity * 0.1;
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          ctx.fillStyle = scanColor;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // 中心光晕
      const centerX = mouseRef.current.x * width;
      const centerY = mouseRef.current.y * height;
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
      glowGradient.addColorStop(0, scanColor + '40');
      glowGradient.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.3 * bloomIntensity;
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      timeRef.current++;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    sensitivity,
    lineThickness,
    linesColor,
    gridScale,
    scanColor,
    scanOpacity,
    enablePost,
    bloomIntensity,
    chromaticAberration,
    noiseIntensity,
    lineJitter,
    scanGlow,
    scanSoftness,
  ]);

  return (
    <div
      ref={containerRef}
      className={`gridscan ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
