import { useEffect, useRef } from 'react';
import {
  saveQuizProgress,
  QuizProgress as StoredQuizProgress,
  AnswerRecord,
  getProgressKey,
} from '../utils/progressManager';

interface UseProgressParams {
  questions: any[]; // Question[] but we avoid importing to reduce coupling
  currentQuestionIndex: number;
  answerRecords: AnswerRecord[];
  score: number;
  startTime: number;
  showResult: boolean;
  isExamMode: boolean;
  isMixedMode: boolean;
  isWrongMode: boolean;
  currentQuiz: string;
}

export function useProgress({
  questions,
  currentQuestionIndex,
  answerRecords,
  score,
  startTime,
  showResult,
  isExamMode,
  isMixedMode,
  isWrongMode,
  currentQuiz,
}: UseProgressParams) {
  // 计算 currentQuizId
  const currentQuizId = isExamMode ? 'exam_mode' : isMixedMode ? 'mixed_mode' : isWrongMode ? 'wrong_mode' : currentQuiz;

  // 构建 progress 对象
  const buildProgress = (completed: boolean, overrides?: Partial<Pick<StoredQuizProgress, 'answerRecords' | 'score'>>): StoredQuizProgress => ({
    quizId: currentQuizId,
    currentQuestionIndex,
    questions,
    answerRecords: overrides?.answerRecords ?? answerRecords,
    score: overrides?.score ?? score,
    startTime,
    lastUpdateTime: Date.now(),
    completed,
    mode: isExamMode ? 'exam' : isMixedMode ? 'mixed' : isWrongMode ? 'wrong' : 'practice'
  });

  // 自动保存进度（防抖）
  const autoSaveRef = useRef<number>(0);
  useEffect(() => {
    if (questions.length > 0 && !showResult) {
      clearTimeout(autoSaveRef.current);
      autoSaveRef.current = window.setTimeout(() => {
        saveQuizProgress(buildProgress(false));
      }, 500);
    }
    return () => clearTimeout(autoSaveRef.current);
  }, [currentQuestionIndex, questions, answerRecords, score, startTime]);

  // 页面关闭/隐藏时保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (questions.length > 0 && !showResult) {
        const progress = buildProgress(false);
        try {
          localStorage.setItem(getProgressKey(progress.quizId), JSON.stringify(progress));
        } catch (error) {
          console.error('页面关闭时保存进度失败:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && questions.length > 0 && !showResult) {
        saveQuizProgress(buildProgress(false));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [questions, currentQuestionIndex, answerRecords, score, startTime, showResult, isExamMode, isMixedMode, isWrongMode, currentQuiz]);

  return { currentQuizId, buildProgress };
}
