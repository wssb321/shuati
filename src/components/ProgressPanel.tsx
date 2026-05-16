interface ProgressPanelProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  score: number;
  totalScore: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  showResult: boolean;
  showSubmit?: boolean;
}

export function ProgressPanel({
  currentIndex,
  totalQuestions,
  answeredCount,
  score,
  totalScore,
  onPrev,
  onNext,
  onSubmit,
  showResult,
  showSubmit = true
}: ProgressPanelProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const answeredProgress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 sm:p-4 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className="text-xs sm:text-sm">
              <span className="text-gray-600">进度：</span>
              <span className="font-semibold text-blue-600">{currentIndex + 1} / {totalQuestions}</span>
            </div>
            <div className="text-xs sm:text-sm">
              <span className="text-gray-600">已答：</span>
              <span className="font-semibold text-green-600">{answeredCount} / {totalQuestions}</span>
            </div>
            {showResult && (
              <div className="text-xs sm:text-sm">
                <span className="text-gray-600">得分：</span>
                <span className="font-semibold text-amber-600">{score} / {totalScore}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden mb-2 sm:mb-3">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3 sm:mb-4">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${answeredProgress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
          >
            ← 上一题
          </button>
          
          {showSubmit && (!showResult ? (
            <button
              onClick={onSubmit}
              className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm sm:text-base font-medium"
            >
              提交答卷
            </button>
          ) : (
            <button
              onClick={onSubmit}
              className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium"
            >
              重新开始
            </button>
          ))}
          
          <button
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
          >
            下一题 →
          </button>
        </div>
      </div>
    </div>
  );
}
