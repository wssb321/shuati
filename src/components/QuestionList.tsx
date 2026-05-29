import { memo } from 'react';

interface QuestionListProps {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<number>;
  showResult: boolean;
  correctAnswers: Set<number>;
  onSelect: (index: number) => void;
}

export const QuestionList = memo(function QuestionList({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  showResult,
  correctAnswers,
  onSelect
}: QuestionListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-lg">📋</span>
        题目导航
      </h3>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
        {Array.from({ length: totalQuestions }, (_, idx) => {
          const isAnswered = answeredQuestions.has(idx);
          const isCorrect = correctAnswers.has(idx);
          const isCurrent = idx === currentIndex;
          
          let bgClass = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
          if (isCurrent) {
            bgClass = 'bg-blue-500 text-white';
          } else if (isAnswered) {
            bgClass = isCorrect 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white';
          }
          
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`w-full aspect-square rounded-lg flex items-center justify-center font-medium text-xs sm:text-sm transition-all duration-150 hover:scale-105 active:scale-95 ${bgClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100"></span>
            <span className="text-gray-500">未答</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span className="text-gray-500">当前</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-500"></span>
            <span className="text-gray-500">正确</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span className="text-gray-500">错误</span>
          </div>
        </div>
      </div>
    </div>
  );
});
