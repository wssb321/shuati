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
  timeElapsed?: number;
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
  showSubmit = true,
  timeElapsed = 0
}: ProgressPanelProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const answeredProgress = (answeredCount / totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-3 sm:p-4 z-50 safe-area-bottom">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <span className="text-xs sm:text-sm text-gray-600">进度：</span>
              <span className="font-semibold text-blue-600 text-sm sm:text-base">{currentIndex + 1} / {totalQuestions}</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs sm:text-sm text-gray-600">已答：</span>
              <span className="font-semibold text-green-600 text-sm sm:text-base">{answeredCount} / {totalQuestions}</span>
            </div>
            {timeElapsed > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-amber-600 text-sm sm:text-base">{formatTime(timeElapsed)}</span>
              </div>
            )}
            {showResult && (
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-xs sm:text-sm text-gray-600">得分：</span>
                <span className="font-semibold text-purple-600 text-sm sm:text-base">{score} / {totalScore}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-3 sm:mb-4">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500 ease-out opacity-60"
            style={{ width: `${answeredProgress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] btn-ripple ${
              currentIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs sm:text-sm">上一题</span>
          </button>
          
          {showSubmit && !showResult && (
            <button
              onClick={onSubmit}
              disabled={answeredCount !== totalQuestions}
              className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] btn-ripple ${
                answeredCount === totalQuestions
                  ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs sm:text-sm">提交答卷</span>
            </button>
          )}
          
          {showResult && (
            <button
              onClick={onSubmit}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] btn-ripple"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs sm:text-sm">重新开始</span>
            </button>
          )}
          
          <button
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] btn-ripple ${
              currentIndex === totalQuestions - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-200'
            }`}
          >
            <span className="text-xs sm:text-sm">下一题</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}