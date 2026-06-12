import { useState, useEffect, useRef } from 'react';

export function useExamTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const handleSubmitRef = useRef<() => void>(() => {});

  useEffect(() => {
    let timer: number | undefined;
    if (examStarted && !examCompleted) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examStarted, examCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    setTimeLeft,
    examStarted,
    setExamStarted,
    examCompleted,
    setExamCompleted,
    handleSubmitRef,
    formatTime,
  };
}
