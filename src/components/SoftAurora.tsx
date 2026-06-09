import './SoftAurora.css';

interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  className?: string;
}

export default function SoftAurora({
  color1 = '#6366f1',
  color2 = '#7c3aed',
  className = ''
}: SoftAuroraProps) {
  return (
    <div
      className={`soft-aurora-container ${className}`}
      style={{
        '--aurora-color1': color1,
        '--aurora-color2': color2,
      } as React.CSSProperties}
    >
      <div className="aurora-layer aurora-layer-1" />
      <div className="aurora-layer aurora-layer-2" />
      <div className="aurora-layer aurora-layer-3" />
    </div>
  );
}
