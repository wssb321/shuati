import { useState, useEffect } from 'react';
import { Question } from '../utils/questionParser';
import { MinimalQuestionCard } from './MinimalQuestionCard';

interface SwipeQuestionContainerProps {
  questions: Question[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  showResult: boolean;
  onAnswerChange: (answer: string[]) => void;
  immediateFeedback: boolean;
  autoJump: boolean;
  onCorrectAnswer?: (index: number) => void;
  isBookmarked: (questionId: number, quizFile?: string) => boolean;
  onToggleBookmark: (questionId: number, quizFile?: string) => void;
  currentQuiz: string;
}

export const SwipeQuestionContainer: React.FC<SwipeQuestionContainerProps> = ({
  questions,
  currentIndex,
  onIndexChange,
  showResult,
  onAnswerChange,
  immediateFeedback,
  autoJump,
  onCorrectAnswer,
  isBookmarked,
  onToggleBookmark,
  currentQuiz
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchMove, setTouchMove] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    console.log('SwipeQuestionContainer - questions length:', questions.length, 'currentIndex:', currentIndex);
  }, [questions, currentIndex]);

  const currentQuestion = questions[currentIndex];
  const prevQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAnimating) return;
    const touch = e.touches[0];
    setTouchMove({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || !touchStart || isAnimating) return;
    
    const endTime = Date.now();
    const endX = touchMove?.x || touchStart.x;
    const deltaX = endX - touchStart.x;
    const deltaY = touchMove ? touchMove.y - touchStart.y : 0;
    const timeElapsed = endTime - touchStart.time;

    const screenWidth = window.innerWidth;
    const threshold = screenWidth * 0.25;
    
    const isFastSwipe = timeElapsed < 250 && Math.abs(deltaX) > 30;
    const isSwipeValid = Math.abs(deltaY) < Math.abs(deltaX) * 0.5;

    if (isSwipeValid && (Math.abs(deltaX) > threshold || isFastSwipe)) {
      setIsAnimating(true);
      if (deltaX > 0 && currentIndex > 0) {
        setTimeout(() => {
          onIndexChange(currentIndex - 1);
          setIsAnimating(false);
        }, 150);
      } else if (deltaX < 0 && currentIndex < questions.length - 1) {
        setTimeout(() => {
          onIndexChange(currentIndex + 1);
          setIsAnimating(false);
        }, 150);
      } else {
        setIsAnimating(false);
      }
    }
    
    setIsDragging(false);
    setTouchStart(null);
    setTouchMove(null);
  };

  const getSwipeOffset = () => {
    if (!touchStart || !touchMove || !isDragging) return 0;
    return touchMove.x - touchStart.x;
  };

  const getTransform = (offset: number, scale: number = 1) => {
    return `translateX(${offset}px) scale(${scale})`;
  };

  const getOpacity = (offset: number, isCurrent: boolean) => {
    if (!isDragging) return 1;
    const absOffset = Math.abs(offset);
    const maxOffset = window.innerWidth * 0.5;
    if (isCurrent) {
      return Math.max(0.6, 1 - (absOffset / maxOffset) * 0.4);
    }
    return 0.6;
  };

  const getScale = (offset: number, isCurrent: boolean) => {
    if (!isDragging) return isCurrent ? 1 : 0.92;
    const absOffset = Math.abs(offset);
    const maxOffset = window.innerWidth * 0.5;
    if (isCurrent) {
      return Math.max(0.92, 1 - (absOffset / maxOffset) * 0.08);
    }
    return 0.92 + Math.min(0.08, (absOffset / maxOffset) * 0.08);
  };

  const offset = getSwipeOffset();

  return (
    <div 
      className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden select-none touch-pan-x bg-yellow-100/30"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {prevQuestion && (
          <div 
            className="absolute w-full h-full flex items-center justify-center"
            style={{
              transform: getTransform(offset > 0 ? offset - window.innerWidth * 0.9 : -window.innerWidth * 0.9, getScale(offset, false)),
              opacity: offset > 0 ? getOpacity(offset, false) : 0,
              transition: isDragging ? 'none' : 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <MinimalQuestionCard
              question={prevQuestion}
              showResult={showResult}
              onAnswerChange={onAnswerChange}
              immediateFeedback={immediateFeedback}
              autoJump={autoJump}
              isBookmarked={isBookmarked(prevQuestion.id, currentQuiz)}
              onToggleBookmark={() => onToggleBookmark(prevQuestion.id, currentQuiz)}
              isPrev={true}
            />
          </div>
        )}

        {currentQuestion && (
          <div 
            className="absolute w-full h-full flex items-center justify-center z-10"
            style={{
              transform: getTransform(offset, getScale(offset, true)),
              opacity: getOpacity(offset, true),
              transition: isDragging ? 'none' : 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <MinimalQuestionCard
              question={currentQuestion}
              showResult={showResult}
              onAnswerChange={onAnswerChange}
              immediateFeedback={immediateFeedback}
              autoJump={autoJump}
              onCorrectAnswer={() => onCorrectAnswer?.(currentIndex)}
              isBookmarked={isBookmarked(currentQuestion.id, currentQuiz)}
              onToggleBookmark={() => onToggleBookmark(currentQuestion.id, currentQuiz)}
              isCurrent={true}
            />
          </div>
        )}

        {nextQuestion && (
          <div 
            className="absolute w-full h-full flex items-center justify-center"
            style={{
              transform: getTransform(offset < 0 ? offset + window.innerWidth * 0.9 : window.innerWidth * 0.9, getScale(-offset, false)),
              opacity: offset < 0 ? getOpacity(-offset, false) : 0,
              transition: isDragging ? 'none' : 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <MinimalQuestionCard
              question={nextQuestion}
              showResult={showResult}
              onAnswerChange={onAnswerChange}
              immediateFeedback={immediateFeedback}
              autoJump={autoJump}
              isBookmarked={isBookmarked(nextQuestion.id, currentQuiz)}
              onToggleBookmark={() => onToggleBookmark(nextQuestion.id, currentQuiz)}
              isNext={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
