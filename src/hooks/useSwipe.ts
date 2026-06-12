import { useRef, useCallback, useEffect } from 'react';

interface UseSwipeParams {
  onPrev?: () => void;
  onNext?: () => void;
}

export function useSwipe({ onPrev, onNext }: UseSwipeParams = {}) {
  const swipeOffsetRef = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isSwiping = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);
  
  // 使用 ref 存储回调，避免闭包问题
  const onPrevRef = useRef(onPrev || (() => {}));
  const onNextRef = useRef(onNext || (() => {}));
  
  // 动态更新回调
  useEffect(() => {
    if (onPrev) onPrevRef.current = onPrev;
    if (onNext) onNextRef.current = onNext;
  }, [onPrev, onNext]);

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
      onPrevRef.current();
    } else if (deltaX < -50) {
      onNextRef.current();
    }

    swipeOffsetRef.current = 0;
    if (mainRef.current) {
      mainRef.current.style.transform = '';
    }
    isSwiping.current = false;
  }, []);

  // 更新回调的方法
  const setCallbacks = useCallback((callbacks: { onPrev?: () => void; onNext?: () => void }) => {
    if (callbacks.onPrev) onPrevRef.current = callbacks.onPrev;
    if (callbacks.onNext) onNextRef.current = callbacks.onNext;
  }, []);

  return {
    mainRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setCallbacks,
  };
}
