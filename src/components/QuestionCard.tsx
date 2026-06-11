import { useState, useEffect, useRef, memo } from 'react';
import { Question } from '../utils/questionParser';
import { isBookmarked, toggleBookmark } from '../utils/bookmarkManager';
import { renderTextWithCode } from '../lib/utils';

interface QuestionCardProps {
  question: Question;
  showResult: boolean;
  onAnswerChange: (answers: string[]) => void;
  immediateFeedback?: boolean;
  onCorrectAnswer?: () => void;
  onAnswerConfirmed?: (answers: string[]) => void;
  quizFile?: string;
  isNightMode?: boolean;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  showResult,
  onAnswerChange,
  immediateFeedback = false,
  onCorrectAnswer,
  onAnswerConfirmed,
  quizFile = '',
  isNightMode = false
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>(question.userAnswer || []);
  const [showAnswer, setShowAnswer] = useState(false);
  const [clickedOption, setClickedOption] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const optionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (quizFile) {
      setBookmarked(isBookmarked(question.id, quizFile));
    }
  }, [question.id, quizFile]);

  const handleBookmarkClick = () => {
    if (quizFile) {
      toggleBookmark(question.id, quizFile);
      setBookmarked(!bookmarked);
    }
  };

  useEffect(() => {
    setSelected(question.userAnswer || []);
    setShowAnswer(false);
  }, [question.id]);

  const handleSelect = (key: string) => {
    if (showResult || showAnswer) return;

    let newSelected: string[];
    if (question.type === 'single') {
      newSelected = [key];
    } else {
      if (selected.includes(key)) {
        newSelected = selected.filter(k => k !== key);
      } else {
        newSelected = [...selected, key].sort();
      }
    }

    setSelected(newSelected);
    setClickedOption(key);
    onAnswerChange(newSelected);

    setTimeout(() => setClickedOption(null), 100);

    if (immediateFeedback && question.type === 'single') {
      setShowAnswer(true);

      if (onAnswerConfirmed) {
        onAnswerConfirmed(newSelected);
      }

      const isCorrect = newSelected.length === question.correctAnswer.length &&
        newSelected.every(s => question.correctAnswer.includes(s));

      if (isCorrect && onCorrectAnswer) {
        setTimeout(() => {
          onCorrectAnswer();
        }, 1200);
      }
    }
  };

  const handleConfirm = () => {
    if (showResult || showAnswer) return;

    setShowAnswer(true);

    if (onAnswerConfirmed) {
      onAnswerConfirmed(selected);
    }

    const isCorrect = selected.length === question.correctAnswer.length &&
      selected.every(s => question.correctAnswer.includes(s));

    if (isCorrect && onCorrectAnswer) {
      setTimeout(() => {
        onCorrectAnswer();
      }, 1200);
    }
  };

  const displayResult = showResult || showAnswer;

  const isAnswerCorrect = displayResult &&
    selected.length === question.correctAnswer.length &&
    selected.every(s => question.correctAnswer.includes(s));

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm border border-white/50">
      {/* 题目类型标签和收藏按钮 */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            question.type === 'single' 
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-purple-100 text-purple-700'
          }`}>
            {question.type === 'single' ? '单选题' : '多选题'}
          </span>
          {question.type === 'multiple' && !displayResult && (
            <span className="text-xs text-gray-500">
              多选题
            </span>
          )}
        </div>
        {quizFile && (
          <button
            onClick={handleBookmarkClick}
            className={`p-2 rounded-lg transition-all hover:bg-gray-100/80 ${
              bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'
            }`}
            title={bookmarked ? '取消收藏' : '收藏题目'}
          >
            <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        )}
      </div>

      {/* 题目 */}
      <h3 className="text-lg sm:text-xl leading-relaxed mb-6 text-gray-800 font-normal">
        {renderTextWithCode(question.question)}
      </h3>

      {/* 选项 */}
      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.key);
          const isCorrectOption = question.correctAnswer.includes(option.key);
          const isWrongSelected = isSelected && !isCorrectOption && displayResult;

          return (
            <div
              key={option.key}
              ref={el => optionRefs.current[option.key] = el}
              onClick={() => handleSelect(option.key)}
              className={`
                relative cursor-pointer
                px-4 py-3.5 rounded-xl border-2
                transition-all duration-150 ease-out
                flex items-center gap-3
                ${
                  displayResult
                    ? isCorrectOption
                      ? 'bg-green-50 border-green-500'
                      : isWrongSelected
                      ? 'bg-red-50 border-red-500'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-500'
                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }
                ${clickedOption === option.key ? 'scale-[0.99]' : ''}
                ${displayResult ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              {/* 选择器 */}
              <div className="flex-shrink-0">
                {question.type === 'single' ? (
                  <div className={`
                    w-5 h-5 rounded-full border-2
                    flex items-center justify-center
                    transition-all duration-150
                    ${
                      displayResult
                        ? isCorrectOption
                          ? 'bg-green-500 border-green-500'
                          : isWrongSelected
                          ? 'bg-red-500 border-red-500'
                          : 'border-gray-300'
                        : isSelected
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-gray-300'
                    }
                  `}>
                    {displayResult && isCorrectOption && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {displayResult && isWrongSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                ) : (
                  <div className={`
                    w-5 h-5 rounded border-2
                    flex items-center justify-center
                    transition-all duration-150
                    ${
                      displayResult
                        ? isCorrectOption
                          ? 'bg-green-500 border-green-500'
                          : isWrongSelected
                          ? 'bg-red-500 border-red-500'
                          : 'border-gray-300'
                        : isSelected
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-gray-300'
                    }
                  `}>
                    {displayResult && isCorrectOption && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {displayResult && isWrongSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              {/* 选项内容 */}
              <div className="flex-1">
                <span className={`font-medium mr-2 ${displayResult ? (isCorrectOption ? 'text-green-600' : isWrongSelected ? 'text-red-600' : 'text-gray-400') : 'text-gray-500'}`} style={{ fontSize: '14px' }}>
                  {option.key}.
                </span>
                <span className={`${displayResult ? (isCorrectOption ? 'font-semibold' : isWrongSelected ? 'line-through text-red-500' : '') : ''} text-gray-700`} style={{ fontSize: '15px' }}>
                  {renderTextWithCode(option.value)}
                </span>
              </div>

              {/* 对/错图标 */}
              {displayResult && (
                <div className="flex-shrink-0 ml-2">
                  {isCorrectOption ? (
                    <span className="text-green-500 text-lg">✓</span>
                  ) : isWrongSelected ? (
                    <span className="text-red-500 text-lg">✗</span>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 答案解析 */}
      {displayResult && question.explanation && question.explanation.trim() !== '' && (
        <div className="mt-6 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-indigo-500">💡</span>
            <span className="font-semibold text-indigo-700">答案解析</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            {renderTextWithCode(question.explanation)}
          </p>
        </div>
      )}

      {/* 确认按钮 */}
      {!displayResult && (question.type === 'multiple' || !immediateFeedback) && (
        <button
          onClick={handleConfirm}
          disabled={selected.length === 0}
          className={`
            w-full mt-6 py-3 rounded-xl font-medium text-white
            transition-all duration-150
            ${
              selected.length > 0
                ? 'bg-indigo-500 hover:bg-indigo-600'
                : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          确认答案
        </button>
      )}
    </div>
  );
});
