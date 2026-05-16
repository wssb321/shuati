import { useState, useEffect } from 'react';
import { Question } from '../utils/questionParser';

interface QuestionCardProps {
  question: Question;
  showResult: boolean;
  onAnswerChange: (answers: string[]) => void;
  immediateFeedback?: boolean;
  onCorrectAnswer?: () => void;
  onAnswerConfirmed?: (answers: string[]) => void;
}

export function QuestionCard({ question, showResult, onAnswerChange, immediateFeedback = false, onCorrectAnswer, onAnswerConfirmed }: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>(question.userAnswer || []);
  const [showAnswer, setShowAnswer] = useState(false);

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
    onAnswerChange(newSelected);
    
    if (immediateFeedback && question.type === 'single') {
      setShowAnswer(true);
      
      // 调用答案确认回调来保存错题
      if (onAnswerConfirmed) {
        onAnswerConfirmed(newSelected);
      }
      
      const isAnswerCorrect = newSelected.length === question.correctAnswer.length &&
        newSelected.every(s => question.correctAnswer.includes(s));
      
      if (isAnswerCorrect && onCorrectAnswer) {
        setTimeout(() => {
          onCorrectAnswer();
        }, 1500);
      }
    }
  };

  const handleConfirm = () => {
    if (showResult || showAnswer) return;
    
    setShowAnswer(true);
    
    // 调用答案确认回调来保存错题
    if (onAnswerConfirmed) {
      onAnswerConfirmed(selected);
    }
    
    const isAnswerCorrect = selected.length === question.correctAnswer.length &&
      selected.every(s => question.correctAnswer.includes(s));
    
    if (isAnswerCorrect && onCorrectAnswer) {
      setTimeout(() => {
        onCorrectAnswer();
      }, 1500);
    }
  };

  const displayResult = showResult || showAnswer;

  const getOptionClass = (key: string) => {
    const base = 'w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-2 sm:gap-3 cursor-pointer';
    
    if (displayResult) {
      const isCorrect = question.correctAnswer.includes(key);
      const isSelected = selected.includes(key);
      
      if (isCorrect) {
        return `${base} border-green-500 bg-green-50 text-green-800`;
      }
      if (isSelected && !isCorrect) {
        return `${base} border-red-500 bg-red-50 text-red-800`;
      }
      return `${base} border-gray-200 bg-gray-50 opacity-50`;
    }
    
    if (selected.includes(key)) {
      return `${base} border-blue-500 bg-blue-50 text-blue-800`;
    }
    return `${base} border-gray-200 hover:border-blue-300 hover:bg-blue-50`;
  };

  const isCorrect = displayResult && 
    selected.length === question.correctAnswer.length &&
    selected.every(s => question.correctAnswer.includes(s));

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
            question.type === 'single' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-purple-100 text-purple-700'
          }`}>
            {question.type === 'single' ? '单选题' : '多选题'}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">第 {question.id} 题</span>
        </div>
        <span className="text-sm sm:text-base font-semibold text-amber-600">{question.score} 分</span>
      </div>
      
      <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4 leading-relaxed">
        {question.question}
      </h3>
      
      <div className="space-y-2 sm:space-y-3">
        {question.options.map(option => (
          <div
            key={option.key}
            className={getOptionClass(option.key)}
            onClick={() => handleSelect(option.key)}
          >
            <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0 ${
              displayResult 
                ? question.correctAnswer.includes(option.key) 
                  ? 'bg-green-500 text-white' 
                  : selected.includes(option.key) && !question.correctAnswer.includes(option.key)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                : selected.includes(option.key)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {option.key}
            </span>
            <span className="flex-1 pt-0.5 sm:pt-1 text-sm sm:text-base">{option.value}</span>
            {displayResult && question.correctAnswer.includes(option.key) && (
              <span className="text-green-500 text-base sm:text-xl flex-shrink-0">✓</span>
            )}
            {displayResult && selected.includes(option.key) && !question.correctAnswer.includes(option.key) && (
              <span className="text-red-500 text-base sm:text-xl flex-shrink-0">✗</span>
            )}
          </div>
        ))}
      </div>
      
      {!displayResult && question.type === 'multiple' && immediateFeedback && (
        <div className="mt-3 sm:mt-4 flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            确认答案
          </button>
        </div>
      )}

      {displayResult && (
        <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg ${
          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-base sm:text-lg font-medium ${isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
              {isCorrect ? '✓ 回答正确！' : '✗ 回答错误'}
            </span>
            {!isCorrect && (
              <span className="text-xs sm:text-sm text-amber-700">
                正确答案: {question.correctAnswer.join('、')}
              </span>
            )}
          </div>
          <div className="text-gray-700 text-xs sm:text-sm leading-relaxed">
            <strong className="text-gray-800">答案解析：</strong>
            {question.explanation}
          </div>
          {question.knowledgePoints.length > 0 && (
            <div className="mt-2 sm:mt-3">
              <span className="text-xs sm:text-sm font-medium text-gray-700">知识点：</span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                {question.knowledgePoints.map((point, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 sm:px-2 sm:py-1 bg-gray-100 rounded text-xs text-gray-600"
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
  );
}
