interface QuestionListProps {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<number>;
  showResult: boolean;
  correctAnswers: Set<number>;
  onSelect: (index: number) => void;
}

export function QuestionList({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  showResult,
  correctAnswers,
  onSelect
}: QuestionListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">题目导航</h3>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, idx) => {
          const isAnswered = answeredQuestions.has(idx);
          const isCorrect = correctAnswers.has(idx);
          const isCurrent = idx === currentIndex;
          
          let bgClass = 'bg-gray-100 text-gray-600';
          if (isCurrent) {
            bgClass = 'bg-blue-500 text-white';
          } else if (showResult && isAnswered) {
            bgClass = isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
          } else if (isAnswered) {
            bgClass = 'bg-green-100 text-green-700';
          }
          
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`w-full aspect-square rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-200 hover:scale-105 ${bgClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-gray-100"></span>
            <span className="text-gray-600">未答</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-100"></span>
            <span className="text-gray-600">已答</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-blue-500"></span>
            <span className="text-gray-600">当前</span>
          </div>
          {showResult && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-green-500"></span>
                <span className="text-gray-600">正确</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-red-500"></span>
                <span className="text-gray-600">错误</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}