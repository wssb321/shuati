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
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 animate-fadeIn">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
          📋
        </span>
        题目导航
      </h3>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-2.5">
        {Array.from({ length: totalQuestions }, (_, idx) => {
          const isAnswered = answeredQuestions.has(idx);
          const isCorrect = correctAnswers.has(idx);
          const isCurrent = idx === currentIndex;
          
          let bgClass = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
          if (isCurrent) {
            bgClass = 'bg-blue-500 text-white shadow-lg shadow-blue-300';
          } else if (showResult && isAnswered) {
            bgClass = isCorrect 
              ? 'bg-green-500 text-white shadow-md shadow-green-200' 
              : 'bg-red-500 text-white shadow-md shadow-red-200';
          } else if (isAnswered) {
            bgClass = 'bg-green-100 text-green-700 hover:bg-green-200';
          }
          
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`w-full aspect-square rounded-xl flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 clickable ${bgClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-100">
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-4 h-4 rounded-lg bg-gray-100 shadow-sm"></span>
            <span className="text-gray-600">未答</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-4 h-4 rounded-lg bg-green-100 shadow-sm"></span>
            <span className="text-gray-600">已答</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-4 h-4 rounded-lg bg-blue-500 shadow-sm"></span>
            <span className="text-gray-600">当前</span>
          </div>
          {showResult && (
            <>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-4 h-4 rounded-lg bg-green-500 shadow-sm"></span>
                <span className="text-gray-600">正确</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-4 h-4 rounded-lg bg-red-500 shadow-sm"></span>
                <span className="text-gray-600">错误</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});