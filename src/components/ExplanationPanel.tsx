import { useEffect, useCallback } from 'react';
import { Question } from '../utils/questionParser';

interface ExplanationPanelProps {
  question: Question;
  userAnswer: string[];
  isCorrect: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
  isNightMode: boolean;
}

export function ExplanationPanel({
  question,
  userAnswer,
  isCorrect,
  isOpen,
  onClose,
  onNextQuestion,
  isLastQuestion,
  isNightMode
}: ExplanationPanelProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={handleOverlayClick}
    >
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* 面板 */}
      <div 
        className={`relative max-h-[50vh] overflow-hidden ${isNightMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}
      >
        {/* 拖动指示器 */}
        <div className={`w-12 h-1 mx-auto my-3 rounded-full ${isNightMode ? 'bg-slate-600' : 'bg-gray-300'}`} />

        {/* 结果标识 */}
        <div className={`px-6 py-4 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="flex items-center justify-center gap-2">
            {isCorrect ? (
              <>
                <span className="text-2xl animate-bounce">✅</span>
                <span className="text-white font-semibold text-lg">回答正确</span>
              </>
            ) : (
              <>
                <span className="text-2xl">❌</span>
                <span className="text-white font-semibold text-lg">
                  回答错误 · 正确答案：{question.correctAnswer.join('、')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 解析内容 */}
        <div className="overflow-y-auto max-h-[35vh]">
          <div className="px-6 py-4">
            <h4 className={`text-sm font-semibold mb-3 ${isNightMode ? 'text-slate-400' : 'text-gray-500'}`}>
              题目解析
            </h4>
            <p className={`text-sm leading-relaxed ${isNightMode ? 'text-slate-200' : 'text-gray-700'}`}>
              {question.explanation || '暂无解析'}
            </p>

            {/* 相关知识点 */}
            {question.knowledgePoints && question.knowledgePoints.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {question.knowledgePoints.map((point, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs ${isNightMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-700'}`}
                  >
                    {point}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className={`border-t px-6 py-4 ${isNightMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between gap-4">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isNightMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              收藏本题
            </button>
            <button
              onClick={onNextQuestion}
              className="flex-1 px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              {isLastQuestion ? '提交试卷' : '下一题'}
              {!isLastQuestion && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
