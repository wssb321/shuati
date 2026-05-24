import { useState, useEffect, useRef, memo } from 'react';
import { Question } from '../utils/questionParser';

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
  const optionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

    // 点击动画
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

  // 代码高亮处理
  const renderTextWithCode = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code
            key={idx}
            className={`font-mono text-sm px-1.5 py-0.5 rounded ${isNightMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'}`}
          >
            {code}
          </code>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className={`rounded-2xl p-6 mb-6 ${isNightMode ? 'bg-slate-800' : 'bg-white'}`} style={{ paddingTop: '24px' }}>
      {/* 题目类型标签 */}
      <div className="mb-4 flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          question.type === 'single' 
            ? `${isNightMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`
            : `${isNightMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`
        }`}>
          {question.type === 'single' ? '单选题' : '多选题'}
        </span>
        {question.type === 'multiple' && !displayResult && (
          <span className={`text-xs ${isNightMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
            请选择所有符合的选项
          </span>
        )}
      </div>

      {/* 题目 */}
      <h3 className={`text-lg leading-relaxed mb-8 ${isNightMode ? 'text-slate-200' : 'text-gray-800'}`} style={{ fontSize: '18px', fontWeight: 400 }}>
        {renderTextWithCode(question.question)}
      </h3>

      {/* 选项 */}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selected.includes(option.key);
          const isCorrectOption = question.correctAnswer.includes(option.key);
          const isWrongSelected = isSelected && !isCorrectOption && displayResult;

          return (
            <div
              key={`${option.key}-${idx}`}
              ref={el => optionRefs.current[option.key] = el}
              onClick={() => handleSelect(option.key)}
              className={`
                relative overflow-hidden cursor-pointer
                px-5 py-4 rounded-xl border-2
                transition-all duration-200 ease-out
                flex items-start gap-3
                ${
                  displayResult
                    ? isCorrectOption
                      ? `${isNightMode ? 'bg-green-900/20 border-green-500' : 'bg-green-50 border-green-500'}`
                      : isWrongSelected
                      ? `${isNightMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-500'}`
                      : `${isNightMode ? 'bg-slate-700/50 border-slate-600 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60'}`
                    : isSelected
                    ? `${isNightMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-500'}`
                    : `${isNightMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/50 hover:border-blue-500' : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-500'}`
                }
                ${clickedOption === option.key ? 'scale-[0.98]' : ''}
                ${displayResult ? 'cursor-not-allowed' : ''}
              `}
            >
              {/* 圆形/方形选择器 */}
              <div className="flex-shrink-0 mt-0.5">
                {question.type === 'single' ? (
                  <div className={`
                    w-4.5 h-4.5 rounded-full border-2
                    flex items-center justify-center
                    transition-all duration-200
                    ${
                      displayResult
                        ? isCorrectOption
                          ? 'bg-green-500 border-green-500'
                          : isWrongSelected
                          ? 'bg-red-500 border-red-500'
                          : isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : `${isNightMode ? 'border-slate-600' : 'border-gray-300'}`
                        : isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : `${isNightMode ? 'border-slate-600' : 'border-gray-300'}`
                    }
                  `} style={{ width: '18px', height: '18px' }}>
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
                    w-4.5 h-4.5 rounded border-2
                    flex items-center justify-center
                    transition-all duration-200
                    ${
                      displayResult
                        ? isCorrectOption
                          ? 'bg-green-500 border-green-500'
                          : isWrongSelected
                          ? 'bg-red-500 border-red-500'
                          : isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : `${isNightMode ? 'border-slate-600' : 'border-gray-300'}`
                        : isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : `${isNightMode ? 'border-slate-600' : 'border-gray-300'}`
                    }
                  `} style={{ width: '18px', height: '18px' }}>
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
                <span className={`font-semibold mr-3 ${displayResult ? (isCorrectOption ? 'text-green-500' : isWrongSelected ? 'text-red-500' : isNightMode ? 'text-slate-400' : 'text-gray-400') : isNightMode ? 'text-slate-400' : 'text-gray-500'}`} style={{ fontSize: '14px' }}>
                  {option.key}.
                </span>
                <span className={`${displayResult ? (isCorrectOption ? 'font-bold' : isWrongSelected ? 'line-through' : '') : ''} ${isNightMode ? 'text-slate-200' : 'text-gray-700'}`} style={{ fontSize: '15px' }}>
                  {renderTextWithCode(option.value)}
                </span>
              </div>

              {/* 对/错图标 */}
              {displayResult && (
                <div className="flex-shrink-0 ml-2">
                  {isCorrectOption ? (
                    <span className="text-green-500 text-xl">✓</span>
                  ) : isWrongSelected ? (
                    <span className="text-red-500 text-xl">✗</span>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 答案解析 */}
      {displayResult && question.explanation && question.explanation.trim() !== '' && (
        <div className={`mt-6 p-4 rounded-xl ${isNightMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-500">💡</span>
            <span className={`font-semibold ${isNightMode ? 'text-blue-300' : 'text-blue-700'}`}>答案解析</span>
          </div>
          <p className={`text-sm leading-relaxed ${isNightMode ? 'text-slate-300' : 'text-gray-600'}`}>
            {renderTextWithCode(question.explanation)}
          </p>
        </div>
      )}

      {/* 确认按钮 */}
      {!displayResult && (!immediateFeedback || question.type === 'multiple') && (
        <button
          onClick={handleConfirm}
          disabled={selected.length === 0}
          className={`
            w-full mt-6 py-3 rounded-lg font-medium text-white
            transition-all duration-200
            ${
              selected.length > 0
                ? 'bg-blue-500 hover:bg-blue-600'
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
