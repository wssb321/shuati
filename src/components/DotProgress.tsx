import { useEffect, useRef } from 'react';

interface DotProgressProps {
  total: number;
  current: number;
  answered: Set<number>;
  correctAnswers: Set<number>;
  showResult: boolean;
  onSelect: (index: number) => void;
}

export function DotProgress({
  total,
  current,
  answered,
  correctAnswers,
  showResult,
  onSelect,
}: DotProgressProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      const dotWidth = 24;
      const containerWidth = scrollRef.current.clientWidth;
      const targetX = current * dotWidth - containerWidth / 2 + dotWidth / 2;
      scrollRef.current.scrollTo({
        left: Math.max(0, targetX),
        behavior: 'smooth',
      });
    }
  }, [current]);
  
  const maxDots = Math.min(total, 30);
  const dots = Array.from({ length: maxDots }, (_, i) => i);
  
  const handleDotClick = (index: number) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch (e) {
        console.log('Vibration not supported');
      }
    }
    onSelect(index);
  };
  
  const getDotClass = (index: number) => {
    const isCurrent = index === current;
    const isAnswered = answered.has(index);
    const isCorrect = correctAnswers.has(index);
    
    if (isCurrent) {
      return 'bg-blue-500 scale-125 shadow-lg';
    } else if (showResult && isAnswered) {
      return isCorrect ? 'bg-green-500' : 'bg-red-500';
    } else if (isAnswered) {
      return 'bg-green-400';
    } else {
      return 'bg-gray-300';
    }
  };
  
  return (
    <div 
      ref={scrollRef}
      className="w-full overflow-x-auto scrollbar-hide pb-2"
    >
      <div className="flex items-center justify-center gap-2 px-4 min-w-max">
        {dots.map((index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-4 h-4 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${getDotClass(index)}`}
            aria-label={`跳转到第 ${index + 1} 题`}
          />
        ))}
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
