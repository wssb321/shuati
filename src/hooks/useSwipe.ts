import { useRef, useCallback } from 'react';

interface UseSwipeParams {
  onPrev: () => void;
  onNext: () => void;
}

export function useSwipe({ onPrev, onNext }: UseSwipeParams) {
  const swipeOffsetRef = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isSwiping = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;

    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true;
      swipeOffsetRef.current = deltaX * 0.3;
      if (mainRef.current) {
        mainRef.current.style.transform = `translateX(${deltaX * 0.3}px)`;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) {
      swipeOffsetRef.current = 0;
      if (mainRef.current) {
        mainRef.current.style.transform = '';
      }
      return;
    }

    const deltaX = touchEndX.current - touchStartX.current;

    if (deltaX > 50) {
      onPrev();
    } else if (deltaX < -50) {
      onNext();
    }

    swipeOffsetRef.current = 0;
    if (mainRef.current) {
      mainRef.current.style.transform = '';
    }
    isSwiping.current = false;
  }, [onPrev, onNext]);

  return {
    mainRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
