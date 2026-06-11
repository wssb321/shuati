import { memo } from 'react';
import { Question } from '../utils/questionParser';
import { renderTextWithCode } from '../lib/utils';

interface ExplanationPanelProps {
  question: Question;
  showResult: boolean;
}

export const ExplanationPanel = memo(function ExplanationPanel({
  question,
  showResult
}: ExplanationPanelProps) {
  if (!showResult || !question.explanation || question.explanation.trim() === '') {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-indigo-100/50 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="font-semibold text-indigo-700 text-sm">答案解析</span>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">
        {renderTextWithCode(question.explanation)}
      </p>
      
      {/* 答案展示 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">正确答案:</span>
          <span className="text-sm font-semibold text-green-600">
            {question.correctAnswer.join('、')}
          </span>
        </div>
      </div>
    </div>
  );
});
