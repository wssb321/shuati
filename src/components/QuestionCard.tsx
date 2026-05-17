import { useState, useEffect } from 'react';
import { Question } from '../utils/questionParser';
import { isBookmarked, toggleBookmark } from '../utils/bookmarkManager';

interface QuestionCardProps {
  question: Question;
  showResult: boolean;
  onAnswerChange: (answers: string[]) => void;
  immediateFeedback?: boolean;
  onCorrectAnswer?: () => void;
  onAnswerConfirmed?: (answers: string[]) => void;
  quizFile?: string;
}

export function QuestionCard({ question, showResult, onAnswerChange, immediateFeedback = false, onCorrectAnswer, onAnswerConfirmed, quizFile = '' }: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>(question.userAnswer || []);
  const [showAnswer, setShowAnswer] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (quizFile) {
      setBookmarked(isBookmarked(question.id, quizFile));
    }
  }, [question.id, quizFile]);

  const handleBookmarkToggle = () => {
    if (quizFile) {
      const newStatus = toggleBookmark(question.id, quizFile);
      setBookmarked(newStatus);
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
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-semibold text-amber-600">{question.score} 分</span>
          {quizFile && (
            <button
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-lg transition-colors ${
                bookmarked 
                  ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={bookmarked ? '取消收藏' : '收藏题目'}
            >
              {bookmarked ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )}
            </button>
          )}
        </div>
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
