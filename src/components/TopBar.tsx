import { useState, useEffect, memo } from 'react';
import { isBookmarked, toggleBookmark } from '../utils/bookmarkManager';

interface TopBarProps {
  mode: 'exam' | 'practice' | 'mixed' | 'wrong';
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  questionId: number;
  quizFile?: string;
  isPaused: boolean;
  onPauseToggle: () => void;
  onBookmarkToggle: () => void;
  onNightModeToggle: () => void;
  isNightMode: boolean;
  isMarked: boolean;
  onMarkToggle: () => void;
}

export const TopBar = memo(function TopBar({ 
  mode, 
  currentIndex, 
  totalQuestions, 
  timeLeft, 
  questionId, 
  quizFile = '', 
  isPaused, 
  onPauseToggle,
  onBookmarkToggle,
  onNightModeToggle,
  isNightMode,
  isMarked,
  onMarkToggle
}: TopBarProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    if (quizFile) {
      setBookmarked(isBookmarked(questionId, quizFile));
    }
  }, [questionId, quizFile]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft <= 300;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const getModeLabel = () => {
    switch (mode) {
      case 'exam': return '模拟考试';
      case 'mixed': return '混合练习';
      case 'wrong': return '错题练习';
      default: return '章节练习';
    }
  };

  const handleBookmarkClick = () => {
    if (quizFile) {
      toggleBookmark(questionId, quizFile);
      setBookmarked(!bookmarked);
    }
    onBookmarkToggle();
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isNightMode ? 'bg-slate-900 border-b border-slate-700' : 'glass-card border-b border-white/30'} shadow-md`} style={{ height: '56px' }}>
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* 左侧 */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPauseToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isNightMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            title={isPaused ? '继续' : '暂停'}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isNightMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
            {getModeLabel()}
          </span>
        </div>

        {/* 中间 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <div style={{ width: '120px', height: '6px', borderRadius: '3px' }} className={`overflow-hidden ${isNightMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div 
                style={{ width: `${progress}%`, height: '100%' }} 
                className="bg-blue-500 transition-all duration-300"
              />
            </div>
          </div>
          <span className={`text-sm ${isNightMode ? 'text-slate-400' : 'text-gray-500'}`} style={{ fontSize: '13px' }}>
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        {/* 右侧 */}
        <div className="flex items-center gap-2">
          {mode === 'exam' && (
            <span className={`text-base font-mono font-semibold ${isUrgent ? 'text-red-500 animate-pulse' : isNightMode ? 'text-slate-200' : 'text-gray-800'}`}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmarkClick}
              className={`w-8 h-8 flex items-center justify-center transition-all ${isNightMode ? 'hover:bg-slate-800/80' : 'hover:bg-gray-100/80'} rounded-lg`}
              title={bookmarked ? '取消收藏' : '收藏题目'}
            >
              {bookmarked ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : (
                <svg className={`w-5 h-5 ${isNightMode ? 'text-slate-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )}
            </button>
            <button
              onClick={onMarkToggle}
              className={`w-8 h-8 flex items-center justify-center transition-all ${isNightMode ? 'hover:bg-slate-800/80' : 'hover:bg-gray-100/80'} rounded-lg`}
              title={isMarked ? '取消标记' : '标记题目'}
            >
              {isMarked ? (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              ) : (
                <svg className={`w-5 h-5 ${isNightMode ? 'text-slate-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              )}
            </button>
            <button
              onClick={onNightModeToggle}
              className={`w-8 h-8 flex items-center justify-center transition-all ${isNightMode ? 'hover:bg-slate-800/80' : 'hover:bg-gray-100/80'} rounded-lg`}
              title={isNightMode ? '日间模式' : '夜间模式'}
            >
              {isNightMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 第二行 - 详细信息 */}
      {showDetails && (
        <div className={`px-4 py-2 border-t ${isNightMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${isNightMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                单选题
              </span>
              <span className={`text-sm ${isNightMode ? 'text-slate-300' : 'text-gray-700'}`}>
                第 {currentIndex + 1} 题
              </span>
              <span className={`text-sm ${isNightMode ? 'text-slate-400' : 'text-gray-500'}`}>
                3.3分
              </span>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className={`text-xs ${isNightMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
            >
              收起
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
