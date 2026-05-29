import { useState, memo } from 'react';

interface QuestionStatus {
  index: number;
  status: 'unanswered' | 'correct' | 'wrong' | 'current';
}

interface BottomNavProps {
  questions: QuestionStatus[];
  currentIndex: number;
  onQuestionClick: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isNightMode: boolean;
  showAnswerSheet: boolean;
  onAnswerSheetToggle: () => void;
}

export const BottomNav = memo(function BottomNav({
  questions,
  currentIndex,
  onQuestionClick,
  onPrev,
  onNext,
  onSubmit,
  isNightMode,
  showAnswerSheet,
  onAnswerSheetToggle
}: BottomNavProps) {
  const getStatusColor = (status: QuestionStatus['status']) => {
    switch (status) {
      case 'correct':
        return 'bg-green-500';
      case 'wrong':
        return 'bg-red-500';
      case 'current':
        return 'bg-blue-500 ring-2 ring-blue-300';
      default:
        return 'bg-gray-300';
    }
  };

  const visibleQuestions = questions.slice(0, Math.min(questions.length, 30));

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${isNightMode ? 'bg-slate-900 border-t border-slate-700' : 'bg-white border-t border-gray-200'} safe-area-pb`} style={{ height: 'auto', minHeight: '64px' }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* 左侧 - 题目进度 */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`text-xs sm:text-sm font-medium shrink-0 ${isNightMode ? 'text-slate-300' : 'text-gray-600'}`}>
              {currentIndex + 1} / {questions.length}
            </span>
            {/* 题目圆点 - 只在非移动端显示 */}
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto flex-1">
              {visibleQuestions.map((q, idx) => (
                <button
                  key={q.index}
                  onClick={() => onQuestionClick(q.index)}
                  className={`flex-shrink-0 rounded-full transition-all duration-200 ${getStatusColor(q.status)}`}
                  style={{
                    width: q.status === 'current' ? '12px' : '8px',
                    height: q.status === 'current' ? '12px' : '8px'
                  }}
                  title={`第 ${q.index + 1} 题`}
                />
              ))}
            </div>
            {/* 移动端显示已答数量 */}
            <span className="sm:hidden text-xs text-gray-500">
              已答 {questions.filter(q => q.status === 'correct' || q.status === 'wrong').length} 题
            </span>
          </div>

          {/* 中间 - 前后切换按钮 */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${isNightMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex === questions.length - 1}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${isNightMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 右侧 - 答题卡按钮 */}
          <button
            onClick={onAnswerSheetToggle}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${isNightMode ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
          >
            答题卡
          </button>
        </div>
      </div>
    </div>
  );
});
