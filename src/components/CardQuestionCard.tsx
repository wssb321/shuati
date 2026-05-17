import { useState, useEffect, useRef } from 'react';
import { Question } from '../utils/questionParser';
import { BookmarkItem, isBookmarked, isFlagged } from '../utils/bookmarkManager';

interface CardQuestionCardProps {
  question: Question;
  index: number;
  total: number;
  showResult: boolean;
  isCorrect?: boolean;
  onAnswerChange: (answers: string[]) => void;
  onAnswerConfirm?: (answers: string[]) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleBookmark?: () => void;
  onToggleFlag?: () => void;
  isBookmarked?: boolean;
  isFlagged?: boolean;
}

export function CardQuestionCard({
  question,
  index,
  total,
  showResult,
  isCorrect,
  onAnswerChange,
  onAnswerConfirm,
  onPrev,
  onNext,
  onToggleBookmark,
  onToggleFlag,
  isBookmarked,
  isFlagged,
}: CardQuestionCardProps) {
  const [selected, setSelected] = useState<string[]>(question.userAnswer || []);
  const [translateX, setTranslateX] = useState(0);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);
  
  useEffect(() => {
    setSelected(question.userAnswer || []);
  }, [question.id]);
  
  const handleSelect = (key: string) => {
    if (showResult) return;
    
    let newSelected: string[];
    if (question.type === 'single') {
      newSelected = [key];
      onAnswerChange(newSelected);
      setTimeout(() => onAnswerConfirm?.(newSelected), 300);
    } else {
      if (selected.includes(key)) {
        newSelected = selected.filter(k => k !== key);
      } else {
        newSelected = [...selected, key].sort();
      }
      onAnswerChange(newSelected);
    }
    setSelected(newSelected);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startTimeRef.current = Date.now();
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startXRef.current;
    
    setTranslateX(deltaX);
    
    const absDelta = Math.abs(deltaX);
    const progress = Math.min(absDelta / (window.innerWidth * 0.3), 1);
    setScale(1 - progress * 0.05);
    setOpacity(1 - progress * 0.3);
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const deltaX = translateX;
    const timeDiff = Date.now() - startTimeRef.current;
    const velocity = Math.abs(deltaX) / timeDiff;
    
    const shouldSwitch = Math.abs(deltaX) > window.innerWidth * 0.3 || (Math.abs(deltaX) > 50 && velocity > 0.5);
    
    if (shouldSwitch) {
      if (deltaX > 0 && index > 0) {
        onPrev();
      } else if (deltaX < 0 && index < total - 1) {
        onNext();
      }
    }
    
    setTranslateX(0);
    setScale(1);
    setOpacity(1);
  };
  
  const handleVibrate = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch (e) {
        console.log('Vibration not supported');
      }
    }
  };
  
  const hasAnswered = selected.length > 0;
  const isAnsweredCorrect = showResult && isCorrect;
  const isAnsweredWrong = showResult && !isCorrect;
  
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex flex-col select-none">
      {/* 顶部状态栏 */}
      <div className="pt-safe-top px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            question.type === 'single' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-purple-100 text-purple-700'
          }`}>
            {question.type === 'single' ? '单选题' : '多选题'}
          </span>
          <span className="text-gray-500 text-sm">
            第 {index + 1} 题 / {total} 题
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-600 font-semibold">
            {question.score} 分
          </span>
        </div>
      </div>
      
      {/* 卡片内容区 */}
      <div 
        className="flex-1 flex items-center justify-center p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className={`w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
            isAnsweredCorrect ? 'border-l-4 border-l-green-500' : 
            isAnsweredWrong ? 'border-l-4 border-l-red-500' : ''
          }`}
          style={{
            transform: `translateX(${translateX}px) scale(${scale})`,
            opacity: opacity,
            transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div className="p-6">
            {/* 题目内容 */}
            <h3 className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
              {question.question}
            </h3>
            
            {/* 选项 */}
            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selected.includes(option.key);
                const isCorrectAnswer = question.correctAnswer.includes(option.key);
                
                let optionClass = 'w-full p-4 rounded-xl border-2 transition-all duration-150 min-h-[44px] flex items-center gap-3 cursor-pointer';
                
                if (showResult) {
                  if (isCorrectAnswer) {
                    optionClass += ' border-green-500 bg-green-50 text-green-800';
                  } else if (isSelected) {
                    optionClass += ' border-red-500 bg-red-50 text-red-800';
                  } else {
                    optionClass += ' border-gray-200 bg-gray-50 text-gray-500 opacity-60';
                  }
                } else if (isSelected) {
                  optionClass += ' border-blue-500 bg-blue-50 text-blue-800';
                } else {
                  optionClass += ' border-gray-200 hover:border-blue-300 hover:bg-blue-50';
                }
                
                return (
                  <div
                    key={option.key}
                    className={optionClass}
                    onClick={() => {
                      if (!showResult) {
                        handleVibrate();
                        handleSelect(option.key);
                      }
                    }}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                      showResult ? (
                        isCorrectAnswer ? 'bg-green-500 text-white' : 
                        isSelected ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                      ) : (
                        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      )
                    }`}>
                      {option.key}
                    </span>
                    <span className="flex-1">{option.value}</span>
                    {showResult && isCorrectAnswer && (
                      <span className="text-green-500 text-xl">✓</span>
                    )}
                    {showResult && isSelected && !isCorrectAnswer && (
                      <span className="text-red-500 text-xl">✗</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* 多选题确认按钮 */}
            {question.type === 'multiple' && !showResult && hasAnswered && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    handleVibrate();
                    onAnswerConfirm?.(selected);
                  }}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 active:scale-[0.98] transition-all"
                >
                  确认答案
                </button>
              </div>
            )}
            
            {/* 解析和结果 */}
            {showResult && (
              <div className={`mt-6 p-4 rounded-xl ${
                isAnsweredCorrect ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-lg font-medium ${
                    isAnsweredCorrect ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {isAnsweredCorrect ? '✓ 回答正确' : '✗ 回答错误'}
                  </span>
                  {!isAnsweredCorrect && (
                    <span className="text-amber-700 text-sm">
                      正确答案: {question.correctAnswer.join('、')}
                    </span>
                  )}
                </div>
                
                {question.explanation && (
                  <div className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-800">答案解析：</strong>
                    {question.explanation}
                  </div>
                )}
                
                {question.knowledgePoints.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">知识点：</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {question.knowledgePoints.map((point, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 底部功能栏 */}
      <div className="px-4 pb-safe-bottom pb-4 pt-2 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-around mb-4">
          <button
            onClick={() => {
              handleVibrate();
              onToggleBookmark?.();
            }}
            className={`p-3 rounded-full transition-all ${
              isBookmarked 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl">⭐</span>
          </button>
          
          <button
            onClick={() => {
              handleVibrate();
              onToggleFlag?.();
            }}
            className={`p-3 rounded-full transition-all ${
              isFlagged 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl">🚩</span>
          </button>
          
          <button
            onClick={() => {
              handleVibrate();
              setShowExplanation(!showExplanation);
            }}
            className={`p-3 rounded-full transition-all ${
              showExplanation 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl">📖</span>
          </button>
        </div>
      </div>
    </div>
  );
}
