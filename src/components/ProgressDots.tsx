interface ProgressDotsProps {
  total: number;
  current: number;
  answered: number[];
  correct: number[];
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({ total, current, answered, correct }) => {
  const dots = Array.from({ length: total }, (_, i) => i);

  const getDotStyle = (index: number) => {
    const isCurrent = index === current;
    const isAnswered = answered.includes(index);
    const isCorrect = correct.includes(index);

    if (isCurrent) {
      return 'w-4 h-4 bg-blue-500 shadow-lg shadow-blue-500/50 scale-150';
    }

    if (isAnswered) {
      if (isCorrect) {
        return 'w-2 h-2 bg-green-500';
      }
      return 'w-2 h-2 bg-red-400';
    }

    return 'w-2 h-2 bg-gray-300';
  };

  return (
    <div className="fixed bottom-28 left-0 right-0 z-40">
      <div className="flex justify-center gap-2 px-4">
        {dots.map((index) => (
          <div
            key={index}
            className={`
              rounded-full transition-all duration-300 ease-out
              ${getDotStyle(index)}
            `}
          />
        ))}
      </div>
      <div className="text-center mt-3">
        <span className="text-xs text-gray-500 font-medium">
          {current + 1} / {total}
        </span>
      </div>
    </div>
  );
};
