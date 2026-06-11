import { Question } from './questionParser';

export interface AnswerRecord {
  questionIndex: number;
  questionId: number;
  options: string[];
  isCorrect: boolean;
  timestamp: number;
}

export interface QuizProgress {
  quizId: string;
  currentQuestionIndex: number;
  questions: Question[];
  answerRecords: AnswerRecord[];
  score: number;
  startTime: number;
  lastUpdateTime: number;
  completed: boolean;
  mode: 'practice' | 'exam' | 'mixed' | 'wrong' | 'favorites';
}

// 轻量级进度数据，只存题目ID和用户答案，不存完整题目内容
export interface LightweightQuizProgress {
  quizId: string;
  currentQuestionIndex: number;
  questionIds: number[];
  answerRecords: AnswerRecord[];
  score: number;
  startTime: number;
  lastUpdateTime: number;
  completed: boolean;
  mode: 'practice' | 'exam' | 'mixed' | 'wrong' | 'favorites';
}

const PROGRESS_KEY_PREFIX = 'quiz_progress_';
const COMPLETED_PROGRESS_KEY = 'quiz_completed_progress';
const CLEANUP_TIMESTAMP_KEY = 'quiz_cleanup_timestamp';

const COMPLETED_EXPIRE_DAYS = 7;
const INCOMPLETED_EXPIRE_DAYS = 30;

export function getProgressKey(quizId: string): string {
  return `${PROGRESS_KEY_PREFIX}${quizId}`;
}

let saveTimer: number | null = null;

// 将完整进度转为轻量级格式（普通练习模式只存ID，考试/混合/错题模式存完整题目）
function toLightweight(progress: QuizProgress): LightweightQuizProgress | QuizProgress {
  const isDynamicMode = progress.mode === 'exam' || progress.mode === 'mixed' || progress.mode === 'wrong' || progress.mode === 'favorites';
  if (isDynamicMode) {
    // 动态模式的题目无法从文件重新加载，必须保存完整题目
    return progress;
  }
  // 普通练习模式只存题目ID
  return {
    quizId: progress.quizId,
    currentQuestionIndex: progress.currentQuestionIndex,
    questionIds: progress.questions.map(q => q.id),
    answerRecords: progress.answerRecords,
    score: progress.score,
    startTime: progress.startTime,
    lastUpdateTime: progress.lastUpdateTime,
    completed: progress.completed,
    mode: progress.mode,
  };
}

export function saveQuizProgress(progress: QuizProgress): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  
  saveTimer = window.setTimeout(() => {
    try {
      const lightweight = toLightweight(progress);
      const data = {
        ...lightweight,
        lastUpdateTime: Date.now()
      };
      localStorage.setItem(getProgressKey(progress.quizId), JSON.stringify(data));
      
      if (progress.completed) {
        const completedList = getCompletedProgressList();
        const existingIndex = completedList.findIndex(p => p.quizId === progress.quizId);
        if (existingIndex >= 0) {
          completedList[existingIndex] = { quizId: progress.quizId, completedTime: Date.now() };
        } else {
          completedList.push({ quizId: progress.quizId, completedTime: Date.now() });
        }
        localStorage.setItem(COMPLETED_PROGRESS_KEY, JSON.stringify(completedList));
      }
    } catch (error) {
      console.error('保存答题进度失败:', error);
    }
  }, 300);
}

export function getQuizProgress(quizId: string): QuizProgress | null {
  try {
    const data = localStorage.getItem(getProgressKey(quizId));
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    if (!parsed.quizId || parsed.currentQuestionIndex === undefined) {
      return null;
    }
    
    const daysSinceLastUpdate = (Date.now() - parsed.lastUpdateTime) / (1000 * 60 * 60 * 24);
    
    if (parsed.completed && daysSinceLastUpdate > COMPLETED_EXPIRE_DAYS) {
      clearQuizProgress(quizId);
      return null;
    }
    
    if (!parsed.completed && daysSinceLastUpdate > INCOMPLETED_EXPIRE_DAYS) {
      clearQuizProgress(quizId);
      return null;
    }
    
    // 兼容轻量级格式（questionIds）和完整格式（questions）
    if (parsed.questionIds && !parsed.questions) {
      // 轻量级格式，questions 为空，调用者需从文件重新加载
      const lightweight = parsed as LightweightQuizProgress;
      return {
        quizId: lightweight.quizId,
        currentQuestionIndex: lightweight.currentQuestionIndex,
        questions: [], // 调用者需根据 quizId 重新加载题目
        answerRecords: lightweight.answerRecords,
        score: lightweight.score,
        startTime: lightweight.startTime,
        lastUpdateTime: lightweight.lastUpdateTime,
        completed: lightweight.completed,
        mode: lightweight.mode,
      };
    }
    
    return parsed as QuizProgress;
  } catch {
    return null;
  }
}

export function clearQuizProgress(quizId: string): void {
  try {
    localStorage.removeItem(getProgressKey(quizId));
    
    const completedList = getCompletedProgressList();
    const filteredList = completedList.filter(p => p.quizId !== quizId);
    localStorage.setItem(COMPLETED_PROGRESS_KEY, JSON.stringify(filteredList));
  } catch (error) {
    console.error('清除答题进度失败:', error);
  }
}

export function hasQuizProgress(quizId: string): boolean {
  return getQuizProgress(quizId) !== null;
}

export interface CompletedProgressItem {
  quizId: string;
  completedTime: number;
}

export function getCompletedProgressList(): CompletedProgressItem[] {
  try {
    const data = localStorage.getItem(COMPLETED_PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getIncompleteProgressList(): QuizProgress[] {
  const results: QuizProgress[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PROGRESS_KEY_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const progress = JSON.parse(data) as QuizProgress;
            if (!progress.completed) {
              results.push(progress);
            }
          } catch {
            continue;
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return results;
}

export function clearAllProgress(): void {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PROGRESS_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    localStorage.removeItem(COMPLETED_PROGRESS_KEY);
  } catch (error) {
    console.error('清除所有进度失败:', error);
  }
}

export function clearExpiredProgress(): void {
  try {
    const now = Date.now();
    
    const completedList = getCompletedProgressList();
    const validCompleted = completedList.filter(item => {
      const days = (now - item.completedTime) / (1000 * 60 * 60 * 24);
      return days <= COMPLETED_EXPIRE_DAYS;
    });
    localStorage.setItem(COMPLETED_PROGRESS_KEY, JSON.stringify(validCompleted));
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PROGRESS_KEY_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const progress = JSON.parse(data) as QuizProgress;
            const days = (now - progress.lastUpdateTime) / (1000 * 60 * 60 * 24);
            
            if (progress.completed && days > COMPLETED_EXPIRE_DAYS) {
              localStorage.removeItem(key);
            } else if (!progress.completed && days > INCOMPLETED_EXPIRE_DAYS) {
              localStorage.removeItem(key);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
    }
    
    localStorage.setItem(CLEANUP_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('清理过期进度失败:', error);
  }
}

export function shouldCleanup(): boolean {
  try {
    const lastCleanup = localStorage.getItem(CLEANUP_TIMESTAMP_KEY);
    if (!lastCleanup) return true;
    
    const daysSinceLastCleanup = (Date.now() - parseInt(lastCleanup)) / (1000 * 60 * 60 * 24);
    return daysSinceLastCleanup >= 1;
  } catch {
    return true;
  }
}