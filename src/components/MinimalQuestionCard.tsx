import { useState } from 'react';
import { Question } from '../utils/questionParser';
import { Check, X } from 'lucide-react';

interface MinimalQuestionCardProps {
  question: Question;
  showResult: boolean;
  onAnswerChange: (answer: string[]) => void;
  immediateFeedback: boolean;
  autoJump: boolean;
  onCorrectAnswer?: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isCurrent?: boolean;
  isNext?: boolean;
  isPrev?: boolean;
}

export const MinimalQuestionCard: React.FC<MinimalQuestionCardProps> = ({
  question,
  showResult,
  onAnswerChange,
  immediateFeedback,
  autoJump,
  onCorrectAnswer,
  isBookmarked,
  onToggleBookmark,
  isCurrent = true,
  isNext = false,
  isPrev = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string[]>(question.userAnswer || []);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const isSingleChoice = question.type === 'single';

  const handleSelect = (optionKey: string) => {
    if (showResult || answerStatus) return;

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    let newAnswer: string[];
    if (isSingleChoice) {
      newAnswer = [optionKey];
    } else {
      if (selectedAnswer.includes(optionKey)) {
        newAnswer = selectedAnswer.filter(key => key !== optionKey);
      } else {
        newAnswer = [...selectedAnswer, optionKey];
      }
    }

    setSelectedAnswer(newAnswer);
    onAnswerChange(newAnswer);

    if (immediateFeedback && !answerStatus) {
      handleAnswerSubmit(newAnswer);
    }
  };

  const handleAnswerSubmit = (answer: string[]) => {
    const isCorrect = answer.length === question.correctAnswer.length && 
      answer.every(key => question.correctAnswer.includes(key));

    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    setShowFeedback(true);

    if (isCorrect) {
      setTimeout(() => {
        if (onCorrectAnswer) {
          onCorrectAnswer();
        }
      }, autoJump ? 600 : 0);
    } else {
      setTimeout(() => {
        setShowCorrectAnswer(true);
      }, 200);
    }
  };

  const getOptionStyle = (optionKey: string) => {
    const isSelected = selectedAnswer.includes(optionKey);
    const isCorrectOption = question.correctAnswer.includes(optionKey);
    
    let bgClass = 'bg-white';
    let leftBorderColor = 'transparent';

    if (isSelected) {
      bgClass = 'bg-gradient-to-r from-blue-50 to-white';
      leftBorderColor = 'bg-blue-500';
    }

    if (showResult || showFeedback || showCorrectAnswer) {
      if (isCorrectOption) {
        bgClass = 'bg-gradient-to-r from-green-50 to-white';
        leftBorderColor = 'bg-green-500';
      } else if (isSelected && answerStatus === 'incorrect') {
        bgClass = 'bg-gradient-to-r from-red-50 to-white';
        leftBorderColor = 'bg-red-500';
      }
    }

    return { bgClass, leftBorderColor };
  };

  const getOptionIcon = (optionKey: string) => {
    const isCorrectOption = question.correctAnswer.includes(optionKey);
    
    if ((showResult || showFeedback) && isCorrectOption) {
      return <Check className="w-5 h-5 text-green-500 opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s' }} />;
    }
    
    if ((showResult || showFeedback) && selectedAnswer.includes(optionKey) && !isCorrectOption) {
      return <X className="w-5 h-5 text-red-500 opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s' }} />;
    }
    
    return null;
  };

  if (!question || !question.options || question.options.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto px-4 pt-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 text-center text-gray-500">
          暂无题目数据
        </div>
      </div>
    );
  }

  const options = question.options;

  return (
    <div 
      className={`
        w-full max-w-md mx-auto px-4 pt-6
        ${isPressed ? 'scale-[0.97]' : 'scale-100'}
        transition-transform duration-150
      `}
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-100/50 p-6 sm:p-8 border border-white/60">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <span className={`
              px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
              ${question.type === 'single' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}
            `}>
              {question.type === 'single' ? '单选' : '多选'}
            </span>
            <span className="text-xs text-gray-400">第 {question.id} 题</span>
          </div>
          {question.score && (
            <span className="text-orange-500 font-bold text-sm">
              {question.score}分
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
          {question.question}
        </h2>

        <div className="space-y-4">
          {options.map((option) => {
            const { bgClass, leftBorderColor } = getOptionStyle(option.key);
            const icon = getOptionIcon(option.key);
            return (
              <button
                key={option.key}
                onClick={() => handleSelect(option.key)}
                disabled={showResult || answerStatus !== null}
                className={`
                  w-full text-left p-4 sm:p-5 rounded-2xl
                  ${bgClass}
                  border border-gray-100/50
                  transition-all duration-200 ease-out
                  hover:shadow-md hover:border-blue-200/50
                  flex items-center gap-4
                  relative overflow-hidden
                  disabled:cursor-not-allowed disabled:opacity-90
                  group
                `}
              >
                <div className={`
                  absolute left-0 top-0 bottom-0 w-1
                  ${leftBorderColor}
                  transition-all duration-300 ease-out
                  ${leftBorderColor !== 'transparent' ? 'scale-y-100' : 'scale-y-0'}
                  origin-top
                `} />

                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full
                  flex items-center justify-center
                  font-bold text-base
                  bg-gray-50 text-gray-500
                  transition-all duration-300
                  ${selectedAnswer.includes(option.key) ? 'bg-blue-500 text-white scale-110' : ''}
                  ${(showResult || showFeedback) && question.correctAnswer.includes(option.key) ? 'bg-green-500 text-white scale-110' : ''}
                  ${(showResult || showFeedback) && selectedAnswer.includes(option.key) && !question.correctAnswer.includes(option.key) ? 'bg-red-500 text-white scale-110' : ''}
                `}>
                  {option.key}
                </div>

                <span className="flex-1 text-sm sm:text-base text-gray-700">
                  {option.value}
                </span>

                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {icon}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
