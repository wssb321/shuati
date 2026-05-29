import { memo } from 'react';

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

export const ProgressPanel = memo(function ProgressPanel({
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 sm:p-4 z-50 safe-area-bottom" style={{ height: 'auto' }}>
      <div className="max-w-4xl mx-auto">
        {/* 进度条 */}
        <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div 
            className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* 统计信息 - 响应式布局 */}
        <div className="flex items-center justify-between mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-gray-600 shrink-0">
              <span className="font-semibold text-blue-600">{currentIndex + 1}</span> / {totalQuestions}
            </span>
            <span className="hidden sm:inline text-gray-400">|</span>
            <span className="text-gray-600 shrink-0">
              已答 <span className="font-semibold text-green-600">{answeredCount}</span> 题
            </span>
            {timeElapsed > 0 && (
              <>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="text-gray-600 shrink-0">
                  ⏱️ {formatTime(timeElapsed)}
                </span>
              </>
            )}
          </div>
          {showResult && (
            <span className="text-gray-600 font-medium text-right shrink-0">
              得分 <span className="text-purple-600">{score}</span> / {totalScore}
            </span>
          )}
        </div>
        
        {/* 操作按钮 - 响应式布局 */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
              currentIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">上一题</span>
          </button>
          
          {showSubmit && !showResult && (
            <button
              onClick={onSubmit}
              disabled={answeredCount !== totalQuestions}
              className={`flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-white transition-all text-sm sm:text-base flex-1 sm:flex-none max-w-[140px] sm:max-w-none ${
                answeredCount === totalQuestions
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              提交答卷
            </button>
          )}
          
          {showResult && (
            <button
              onClick={onSubmit}
              className="flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all text-sm sm:text-base flex-1 sm:flex-none max-w-[140px] sm:max-w-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新开始
            </button>
          )}
          
          <button
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
              currentIndex === totalQuestions - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <span className="hidden sm:inline">下一题</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});
