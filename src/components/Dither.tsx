import './Dither.css';

interface DitherProps {
  waveColor?: string;
}

export default function Dither({ waveColor = '#f5f5f5' }: DitherProps) {
  return (
    <div className="dither-container">
      <div className="dither-wave" style={{ '--wave-color': waveColor } as React.CSSProperties} />
      <div className="dither-pattern" />
    </div>
  );
}
