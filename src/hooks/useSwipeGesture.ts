import { useState, useRef, useCallback, useEffect } from 'react';

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  deltaX: number;
  deltaY: number;
}

export interface UseSwipeGestureOptions {
  enabled?: boolean;
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: () => void;
  onSwipeMove?: (direction: SwipeDirection) => void;
  onSwipeEnd?: (direction: SwipeDirection) => void;
}

export function useSwipeGesture(options: UseSwipeGestureOptions) {
  const {
    enabled = true,
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
  } = options;

  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    setIsSwiping(true);
    setSwipeDirection(null);
    setSwipeDistance(0);
    onSwipeStart?.();
  }, [enabled, onSwipeStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isSwiping) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = touch.clientY - startY.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    let direction: 'left' | 'right' | 'up' | 'down' | null = null;
    let distance = 0;
    
    if (absX > absY) {
      direction = deltaX > 0 ? 'right' : 'left';
      distance = absX;
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
      distance = absY;
    }
    
    setSwipeDirection(direction);
    setSwipeDistance(distance);
    
    const swipeInfo: SwipeDirection = {
      direction,
      distance,
      deltaX,
      deltaY,
    };
    
    onSwipeMove?.(swipeInfo);
  }, [enabled, isSwiping, onSwipeMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !isSwiping) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = touch.clientY - startY.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    const direction = absX > absY 
      ? (deltaX > 0 ? 'right' : 'left')
      : (deltaY > 0 ? 'down' : 'up');
    const distance = absX > absY ? absX : absY;
    
    if (distance >= threshold) {
      switch (direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    }
    
    const swipeInfo: SwipeDirection = {
      direction,
      distance,
      deltaX,
      deltaY,
    };
    
    onSwipeEnd?.(swipeInfo);
    setIsSwiping(false);
    setSwipeDirection(null);
    setSwipeDistance(0);
  }, [enabled, isSwiping, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd]);

  const setContainer = useCallback((element: HTMLDivElement | null) => {
    if (containerRef.current) {
      containerRef.current.removeEventListener('touchstart', handleTouchStart);
      containerRef.current.removeEventListener('touchmove', handleTouchMove);
      containerRef.current.removeEventListener('touchend', handleTouchEnd);
    }
    
    containerRef.current = element;
    
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd);
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    setContainer,
    isSwiping,
    swipeDirection,
    swipeDistance,
  };
}
