import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

import './SoftAurora.css';

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

const vertexShader = `attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 0, 1); }`;

const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;

#define TAU 6.28318

float rand(vec2 n) { 
  return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u*u*(3.0-2.0*u);

  float res = mix(
    mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
    mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x),
    u.y);
  return res;
}

float fbm(vec2 p) {
  float f = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for(int i=0; i<3; i++) {
    f += amp * noise(p * freq);
    amp *= 0.5;
    freq *= 2.0;
  }
  return f;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uTime * uSpeed;
  
  vec2 p = uv * uScale;
  p.x += t * 0.1;
  p.y += t * 0.05;
  
  float n = fbm(p);
  float glow = smoothstep(0.3, 0.8, n);
  
  vec3 col = mix(uColor1, uColor2, uv.x + sin(t * 0.5) * 0.2);
  col *= glow * uBrightness;
  
  float alpha = clamp(glow * 0.5, 0.0, 0.3);
  gl_FragColor = vec4(col, alpha);
}
`;

interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  className?: string;
}

export default function SoftAurora({
  speed = 0.5,
  scale = 2.0,
  brightness = 0.8,
  color1 = '#818cf8',
  color2 = '#3b82f6',
  className = ''
}: SoftAuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    const renderer = new Renderer({ 
      alpha: true, 
      premultipliedAlpha: false,
      dpr: Math.min(window.devicePixelRatio, 1.5)
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let program: Program;

    function resize() {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      if (program) {
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
      }
    }
    window.addEventListener('resize', resize);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uBrightness: { value: brightness },
        uColor1: { value: hexToVec3(color1) },
        uColor2: { value: hexToVec3(color2) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    let animationFrameId: number;

    function update(time: number) {
      animationFrameId = requestAnimationFrame(update);
      program.uniforms.uTime.value = time * 0.001;
      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [speed, scale, brightness, color1, color2]);

  return <div ref={containerRef} className={`soft-aurora-container ${className}`} />;
}
