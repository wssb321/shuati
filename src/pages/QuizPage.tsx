import { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressPanel } from '../components/ProgressPanel';
import { QuestionList } from '../components/QuestionList';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { QuizPageSkeleton } from '../components/Skeleton';
import { Empty } from '../components/Empty';
import { parseQuestionFile, Question, QuestionGroup, shuffleArray } from '../utils/questionParser';
import { saveWrongQuestion, getWrongQuestions, removeWrongQuestion, clearWrongQuestions, convertToQuestion, recordCorrectAnswer } from '../utils/wrongQuestionManager';
import { getBookmarks } from '../utils/bookmarkManager';
import { 
  saveQuizProgress, 
  getQuizProgress, 
  clearQuizProgress, 
  hasQuizProgress, 
  QuizProgress as StoredQuizProgress, 
  AnswerRecord,
  shouldCleanup,
  clearExpiredProgress,
  getIncompleteProgressList,
  getProgressKey
} from '../utils/progressManager';

const TopBar = lazy(() => import('../components/TopBar').then(module => ({ default: module.TopBar })));
const BottomNav = lazy(() => import('../components/BottomNav').then(module => ({ default: module.BottomNav })));
const SubmitConfirmDialog = lazy(() => import('../components/SubmitConfirmDialog').then(module => ({ default: module.SubmitConfirmDialog })));

type Mode = 'practice' | 'exam' | 'mixed' | 'wrong';

interface ResumeModalProps {
  quizId: string;
  progress: StoredQuizProgress;
  onContinue: () => void;
  onRestart: () => void;
}

function ResumeModal({ quizId, progress, onContinue, onRestart }: ResumeModalProps) {
  const answeredCount = progress.answerRecords.length;
  const totalQuestions = progress.questions.length;
  const lastUpdate = new Date(progress.lastUpdateTime).toLocaleString('zh-CN');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-card shadow-hover max-w-sm w-full p-6 animate-fadeIn">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-[#1f2937] mb-2">检测到未完成的答题</h3>
          <p className="text-[#6b7280] text-tag">试卷: {quizId.replace('.txt', '')}</p>
        </div>
        
        <div className="bg-gray-50 rounded-card p-4 mb-6 space-y-2">
          <div className="flex justify-between text-tag">
            <span className="text-[#6b7280]">已答题目</span>
            <span className="font-medium text-[#1f2937]">{answeredCount}/{totalQuestions}</span>
          </div>
          <div className="flex justify-between text-tag">
            <span className="text-[#6b7280]">当前得分</span>
            <span className="font-medium text-[#1f2937]">{progress.score}分</span>
          </div>
          <div className="flex justify-between text-tag">
            <span className="text-[#6b7280]">上次答题</span>
            <span className="text-[#6b7280]">{lastUpdate}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-[#3b82f6] text-white rounded-card hover:bg-[#2563eb] font-medium transition-fast active:scale-[0.98] btn-ripple"
          >
            继续答题
          </button>
          <button
            onClick={onRestart}
            className="w-full py-3 bg-gray-100 text-[#1f2937] rounded-card hover:bg-gray-200 font-medium transition-fast active:scale-[0.98] btn-ripple"
          >
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuizPage() {
  const navigate = useNavigate();
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [availableQuizzes, setAvailableQuizzes] = useState<string[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState('');
  const [mode, setMode] = useState<Mode>('practice');
  const [immediateFeedback, setImmediateFeedback] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [isExamMode, setIsExamMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [selectedQuizFiles, setSelectedQuizFiles] = useState<string[]>([]);
  const [examConfig, setExamConfig] = useState({
    singleCount: '10',
    multipleCount: '5',
    duration: '30'
  });
  const [mixedQuestions, setMixedQuestions] = useState<Question[]>([]);
  const [isMixedMode, setIsMixedMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [wrongQuestionsCount, setWrongQuestionsCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [isWrongMode, setIsWrongMode] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingProgress, setPendingProgress] = useState<StoredQuizProgress | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  // 新增状态
  const [isNightMode, setIsNightMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  // 触摸滑动相关
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isSwiping = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);
  
  // 竞态处理 - 跟踪最新的题库加载请求
  const latestQuizRequestRef = useRef<string>('');

  useEffect(() => {
    if (shouldCleanup()) {
      clearExpiredProgress();
    }
  }, []);

  useEffect(() => {
    const discoverQuizzes = async () => {
      try {
        const quizzes = ['模拟第一章.txt', '模拟第二章.txt', '模拟第三章.txt', '模拟第四章.txt', '模拟第五章.txt', '模拟第六章.txt', '模拟第七章.txt', '模拟第八章.txt', '模拟第九章.txt', '模拟考试.txt', '模拟考试一.txt', '模拟考试二.txt', '第一章.txt', '第三章.txt', '第四章.txt', '第五章.txt', '第六章.txt', '第七章.txt', '第八章.txt', '第八章2.txt', '第八章3.txt', '第八章4.txt', '第八章5.txt', '第九章.txt', '第九章1.txt', '第九章2.txt', '第九章3.txt', '第九章4.txt', '案例一.txt', '案例二.txt', '案例三.txt', '小游戏.txt'];
        setAvailableQuizzes(quizzes);
        setSelectedQuizFiles(quizzes);
        
        await loadWrongQuestions();
        updateBookmarkCount();

        // 清除过期进度
        clearExpiredProgress();
        
        // 检查是否从收藏页面跳转过来（批量练习模式）
        const practiceMode = sessionStorage.getItem('practiceMode');
        const practiceQuestionsJson = sessionStorage.getItem('practiceQuestions');
        
        if (practiceMode === 'bookmark' && practiceQuestionsJson) {
          try {
            const practiceQuestions: Question[] = JSON.parse(practiceQuestionsJson);
            console.log(`=== 从收藏页面跳转，加载 ${practiceQuestions.length} 道收藏题目 ===`);
            
            // 设置为收藏练习模式
            setQuestions(practiceQuestions);
            setCurrentQuestionIndex(0);
            setLoading(false);
            
            // 清空 sessionStorage
            sessionStorage.removeItem('practiceMode');
            sessionStorage.removeItem('practiceQuestions');
            return; // 跳过后续常规加载
          } catch (err) {
            console.error('Failed to parse practice questions:', err);
          }
        }
        
        console.log(`=== 初始化检查 ===`);
        console.log(`题库列表长度: ${quizzes.length}`);
        
        // 检查是否从收藏页面跳转过来
        const selectedQuizFromStorage = sessionStorage.getItem('selectedQuiz');
        const selectedQuestionIdFromStorage = sessionStorage.getItem('selectedQuestionId');
        
        // 确定要加载的题库
        let quizToLoad = quizzes[0];
        if (selectedQuizFromStorage && quizzes.includes(selectedQuizFromStorage)) {
          quizToLoad = selectedQuizFromStorage;
          console.log(`从收藏页面跳转，加载指定题库: ${quizToLoad}`);
        } else {
          console.log(`加载第一个题库: ${quizToLoad}`);
        }
        
        setCurrentQuiz(quizToLoad);
        await loadQuiz(quizToLoad);
        
        // 清除 sessionStorage 中的参数（跳转逻辑在 useEffect 中处理）
        if (selectedQuestionIdFromStorage) {
          sessionStorage.removeItem('selectedQuestionId');
        }
        sessionStorage.removeItem('selectedQuiz');
      } catch (err) {
        setError('加载题库失败，请检查文件路径');
        setLoading(false);
      }
    };
    discoverQuizzes();
  }, []);

  useEffect(() => {
    // 处理从收藏页面跳转过来的题目定位
    const selectedQuestionId = sessionStorage.getItem('selectedQuestionId');
    if (selectedQuestionId && questions.length > 0) {
      const targetIndex = questions.findIndex(q => q.id === parseInt(selectedQuestionId));
      if (targetIndex !== -1 && targetIndex !== currentQuestionIndex) {
        console.log(`跳转到指定题目: ${selectedQuestionId} (索引: ${targetIndex})`);
        setCurrentQuestionIndex(targetIndex);
        setShowResult(false);
      }
    }
  }, [questions.length]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (questions.length > 0 && !showResult) {
        const progress: StoredQuizProgress = {
          quizId: isExamMode ? 'exam_mode' : isMixedMode ? 'mixed_mode' : isWrongMode ? 'wrong_mode' : currentQuiz,
          currentQuestionIndex,
          questions,
          answerRecords,
          score,
          startTime,
          lastUpdateTime: Date.now(),
          completed: false,
          mode: isExamMode ? 'exam' : isMixedMode ? 'mixed' : isWrongMode ? 'wrong' : 'practice'
        };
        
        try {
          localStorage.setItem(getProgressKey(progress.quizId), JSON.stringify(progress));
        } catch (error) {
          console.error('页面关闭时保存进度失败:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && questions.length > 0 && !showResult) {
        const progress: StoredQuizProgress = {
          quizId: isExamMode ? 'exam_mode' : isMixedMode ? 'mixed_mode' : isWrongMode ? 'wrong_mode' : currentQuiz,
          currentQuestionIndex,
          questions,
          answerRecords,
          score,
          startTime,
          lastUpdateTime: Date.now(),
          completed: false,
          mode: isExamMode ? 'exam' : isMixedMode ? 'mixed' : isWrongMode ? 'wrong' : 'practice'
        };
        saveQuizProgress(progress);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [questions, currentQuestionIndex, answerRecords, score, startTime, showResult, isExamMode, isMixedMode, isWrongMode, currentQuiz]);

  const updateWrongQuestionsCount = () => {
    const wrongQs = getWrongQuestions();
    setWrongQuestionsCount(wrongQs.length);
  };

  const updateBookmarkCount = () => {
    const bookmarks = getBookmarks();
    setBookmarkCount(bookmarks.length);
  };

  useEffect(() => {
    let timer: number | undefined;
    if (examStarted && !examCompleted) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
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

  const loadQuiz = useCallback(async (quizFile: string) => {
    // 竞态处理：记录当前请求的题库文件
    latestQuizRequestRef.current = quizFile;
    
    try {
      console.log(`=== 开始加载题库: ${quizFile} ===`);
      
      setLoading(true);
      
      console.log(`1. 发起请求: /tiku/${quizFile}`);
      const response = await fetch(`/shuati/tiku/${encodeURIComponent(quizFile)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      
      const content = await response.text();
      console.log(`2. 请求成功，内容长度: ${content.length}`);
      
      // 竞态处理：检查当前请求是否还是最新的
      if (latestQuizRequestRef.current !== quizFile) {
        console.log(`3. 忽略旧的请求 ${quizFile}`);
        setLoading(false);
        return;
      }
      
      console.log(`4. 开始解析题库...`);
      const groups = parseQuestionFile(content);
      console.log(`5. 解析完成，分组数: ${groups.length}`);
      
      if (groups.length > 0) {
        const allQuestions = groups.flatMap(g => g.questions);
        console.log(`6. 题目总数: ${allQuestions.length}`);
        
        if (allQuestions.length === 0) {
          throw new Error('题库中没有题目');
        }
        
        console.log(`7. 设置题目数据...`);
        setQuestionGroups(groups);
        setQuestions(allQuestions);
        console.log(`8. 题目数据设置完成`);
      } else {
        throw new Error('无法解析题库内容');
      }
      
      // 完整重置所有状态
      console.log(`9. 重置状态...`);
      resetQuizState();
      console.log(`10. 状态重置完成`);
      
      setError('');
      setLoading(false);
      console.log(`=== 题库加载成功: ${quizFile} ===`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      console.error(`=== 加载题库失败 ${quizFile}: ${errorMsg} ===`);
      
      // 检查是否是最新请求出错
      if (latestQuizRequestRef.current === quizFile) {
        setError(`加载题库失败: ${errorMsg}`);
        setLoading(false);
      }
    }
  }, []);
  
  // 完整重置题库状态的辅助函数
  const resetQuizState = () => {
    setCurrentQuestionIndex(0);
    setCurrentGroupIndex(0);
    setShowResult(false);
    setScore(0);
    setCorrectAnswers(new Set());
    setAnswerRecords([]);
    setStartTime(Date.now());
    setMarkedQuestions(new Set());
    setShowExplanationPanel(false);
    setShowAnswerSheet(false);
    setShowSubmitDialog(false);
  };
  
  // 统一的章节切换处理函数
  const handleQuizChange = async (newQuizFile: string) => {
    // 如果是同一个题库，不需要重新加载
    if (newQuizFile === currentQuiz) {
      return;
    }
    
    // 清除当前题库的进度
    if (currentQuiz) {
      clearQuizProgress(currentQuiz);
    }
    
    // 设置新题库
    setCurrentQuiz(newQuizFile);
    
    // 加载新题库
    await loadQuiz(newQuizFile);
  };
  
  // 章节组（同一题库内的分组）切换处理函数
  const handleQuizGroupChange = (groupIndex: number) => {
    // 设置新的组索引
    setCurrentGroupIndex(groupIndex);
    
    // 切换题目
    const group = questionGroups[groupIndex];
    setQuestions(group.questions);
    
    // 完全重置状态
    resetQuizState();
  };

  const loadAllQuizzes = async (quizFiles: string[]) => {
    const allQuestions: Question[] = [];
    for (const file of quizFiles) {
      try {
        const response = await fetch(`/shuati/tiku/${file}`);
        if (response.ok) {
          const content = await response.text();
          const groups = parseQuestionFile(content);
          groups.forEach(g => allQuestions.push(...g.questions));
        }
      } catch (err) {
        console.warn(`Failed to load ${file}`);
      }
    }
    return allQuestions;
  };

  const generateExam = async () => {
    const singleCount = examConfig.singleCount.trim() === '' ? 10 : parseInt(examConfig.singleCount) || 10;
    const multipleCount = examConfig.multipleCount.trim() === '' ? 5 : parseInt(examConfig.multipleCount) || 5;
    const duration = examConfig.duration.trim() === '' ? 30 : parseInt(examConfig.duration) || 30;

    const allQuestions = await loadAllQuizzes(selectedQuizFiles);
    const singleQuestions = allQuestions.filter(q => q.type === 'single');
    const multipleQuestions = allQuestions.filter(q => q.type === 'multiple');

    const shuffledSingle = shuffleArray(singleQuestions);
    const shuffledMultiple = shuffleArray(multipleQuestions);

    const selectedSingle = shuffledSingle.slice(0, singleCount);
    const selectedMultiple = shuffledMultiple.slice(0, multipleCount);

    const examQuestionsList = shuffleArray([...selectedSingle, ...selectedMultiple]);
    setExamQuestions(examQuestionsList);
    setQuestions(examQuestionsList);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setScore(0);
    setCorrectAnswers(new Set());
    setAnswerRecords([]);
    setStartTime(Date.now());
    setExamStarted(true);
    setExamCompleted(false);
    setTimeLeft(duration * 60);
  };

  const startMixedMode = async () => {
    const allQuestions = await loadAllQuizzes(selectedQuizFiles);
    const shuffledQuestions = shuffleArray(allQuestions);
    setMixedQuestions(shuffledQuestions);
    setQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setScore(0);
    setCorrectAnswers(new Set());
    setAnswerRecords([]);
    setStartTime(Date.now());
    setIsMixedMode(true);
  };

  const exitMixedMode = () => {
    setIsMixedMode(false);
    loadQuiz(currentQuiz);
  };

  const loadWrongQuestions = async () => {
    const wrongs = await getWrongQuestions();
    const questionsList = wrongs.map(convertToQuestion);
    setWrongQuestions(questionsList);
    setWrongQuestionsCount(questionsList.length);
  };

  const startWrongMode = () => {
    const wrongs = getWrongQuestions();
    const questionsList = wrongs.map(convertToQuestion);
    const shuffledQuestions = shuffleArray(questionsList);
    setWrongQuestions(questionsList);
    setQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setScore(0);
    setCorrectAnswers(new Set());
    setAnswerRecords([]);
    setStartTime(Date.now());
    setIsWrongMode(true);
    setMode('wrong');
    setShowResumeModal(false);
    setPendingProgress(null);
  };

  const exitWrongMode = () => {
    setIsWrongMode(false);
    loadQuiz(currentQuiz);
  };

  const checkAndSaveWrongQuestion = (question: any, userAnswer: string[]) => {
    const isAnswerCorrect = userAnswer.length === question.correctAnswer.length &&
      userAnswer.every(s => question.correctAnswer.includes(s));
    
    if (!isAnswerCorrect && !isWrongMode) {
      saveWrongQuestion(question, userAnswer, currentQuiz);
      updateWrongQuestionsCount();
    } else if (isAnswerCorrect) {
      const removed = recordCorrectAnswer(question.id, currentQuiz);
      if (removed) {
        updateWrongQuestionsCount();
      }
    }
  };

  const handleAnswerConfirmed = (answers: string[]) => {
    const isCorrect = answers.length === currentQuestion.correctAnswer.length &&
      answers.every(a => currentQuestion.correctAnswer.includes(a));
    
    const newRecord: AnswerRecord = {
      questionIndex: currentQuestionIndex,
      questionId: currentQuestion.id,
      options: answers,
      isCorrect,
      timestamp: Date.now()
    };

    setAnswerRecords(prev => {
      const existingIndex = prev.findIndex(r => r.questionIndex === currentQuestionIndex);
      if (existingIndex >= 0) {
        const newRecords = [...prev];
        newRecords[existingIndex] = newRecord;
        return newRecords;
      }
      return [...prev, newRecord];
    });

    if (isCorrect && !correctAnswers.has(currentQuestionIndex)) {
      setScore(prev => prev + currentQuestion.score);
      setCorrectAnswers(prev => new Set([...prev, currentQuestionIndex]));
    } else if (!isCorrect && correctAnswers.has(currentQuestionIndex)) {
      setScore(prev => prev - currentQuestion.score);
      setCorrectAnswers(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentQuestionIndex);
        return newSet;
      });
    }

    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[currentQuestionIndex] = {
        ...newQuestions[currentQuestionIndex],
        userAnswer: answers
      };
      return newQuestions;
    });

    checkAndSaveWrongQuestion(currentQuestion, answers);
    setShowResult(true);
  };

  const handleAnswerChange = (answers: string[]) => {
    if (showResult) return;
    
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[currentQuestionIndex] = {
        ...newQuestions[currentQuestionIndex],
        userAnswer: answers
      };
      return newQuestions;
    });
  };

  // 自动保存进度（防抖，避免频繁写入 localStorage）
  const autoSaveRef = useRef<number>(0);
  useEffect(() => {
    if (questions.length > 0 && !showResult) {
      clearTimeout(autoSaveRef.current);
      autoSaveRef.current = window.setTimeout(() => {
        const progress: StoredQuizProgress = {
          quizId: isExamMode ? 'exam_mode' : isMixedMode ? 'mixed_mode' : isWrongMode ? 'wrong_mode' : currentQuiz,
          currentQuestionIndex,
          questions,
          answerRecords,
          score,
          startTime,
          lastUpdateTime: Date.now(),
          completed: false,
          mode: isExamMode ? 'exam' : isMixedMode ? 'mixed' : isWrongMode ? 'wrong' : 'practice'
        };
        saveQuizProgress(progress);
      }, 500);
    }
    return () => clearTimeout(autoSaveRef.current);
  }, [currentQuestionIndex, questions, answerRecords, score, startTime]);

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowResult(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResult(false);
    }
  };

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowResult(false);
    setShowMobileMenu(false);
  };

  const handleSubmit = () => {
    if (showResult) {
      setQuestions(questions.map(q => ({ ...q, userAnswer: undefined })));
      setShowResult(false);
      setScore(0);
      setCorrectAnswers(new Set());
      setAnswerRecords([]);
      setCurrentQuestionIndex(0);
      setExamCompleted(false);
      setExamStarted(false);
      setTimeLeft(0);
      setStartTime(Date.now());
      
      const currentQuizId = isExamMode ? 'exam_mode' : isMixedMode ? 'mixed_mode' : isWrongMode ? 'wrong_mode' : currentQuiz;
      clearQuizProgress(currentQuizId);

      if (isExamMode && examQuestions.length > 0) {
        setQuestions(examQuestions);
      }
      if (isMixedMode && mixedQuestions.length > 0) {
        setQuestions(mixedQuestions);
      }
      return;
    }

    let totalScore = 0;
    let earnedScore = 0;
    const correct = new Set<number>();
    const newRecords: AnswerRecord[] = [];

    questions.forEach((q, idx) => {
      totalScore += q.score;
      const userAnswer = q.userAnswer || [];
      const isCorrect = userAnswer.length === q.correctAnswer.length &&
        userAnswer.every(a => q.correctAnswer.includes(a));
      
      if (isCorrect) {
        earnedScore += q.score;
        correct.add(idx);
      }
      
      newRecords.push({
        questionIndex: idx,
        questionId: q.id,
        options: userAnswer,
        isCorrect,
        timestamp: Date.now()
      });
    });

    setScore(earnedScore);
    setCorrectAnswers(correct);
    setAnswerRecords(newRecords);
    
    const currentQuizId = isExamMode ? 'exam_mode' : isMixedMode ? 'mixed_mode' : isWrongMode ? 'wrong_mode' : currentQuiz;
    
    const completedProgress: StoredQuizProgress = {
      quizId: currentQuizId,
      currentQuestionIndex,
      questions,
      answerRecords: newRecords,
      score: earnedScore,
      startTime,
      lastUpdateTime: Date.now(),
      completed: true,
      mode: isExamMode ? 'exam' : isMixedMode ? 'mixed' : isWrongMode ? 'wrong' : 'practice'
    };
    saveQuizProgress(completedProgress);

    if (isExamMode) {
      setExamCompleted(true);
      setExamStarted(false);
    }
    
    // 跳转到结果页面
    navigate(`/result/${encodeURIComponent(currentQuizId)}`);
  };

  const handleResumeContinue = async () => {
    if (pendingProgress) {
      setShowResumeModal(false);
      
      // 先设置loading，避免闪烁
      setLoading(true);
      
      try {
        // 根据 quizId 确定模式和加载对应的题目
        const quizId = pendingProgress.quizId;
        
        // 重置所有模式标志
        setIsExamMode(false);
        setIsMixedMode(false);
        setIsWrongMode(false);
        
        if (quizId === 'exam_mode') {
          // 考试模式
          setIsExamMode(true);
          setExamQuestions(pendingProgress.questions);
          setQuestions(pendingProgress.questions);
          if (pendingProgress.mode === 'exam') {
            // 如果之前是考试模式，设置考试状态
            setExamStarted(true);
            // 这里我们假设没有保存时间，所以不设置 timeLeft
          }
        } else if (quizId === 'mixed_mode') {
          // 混合模式
          setIsMixedMode(true);
          setMixedQuestions(pendingProgress.questions);
          setQuestions(pendingProgress.questions);
        } else if (quizId === 'wrong_mode') {
          // 错题模式
          setIsWrongMode(true);
          setWrongQuestions(pendingProgress.questions);
          setQuestions(pendingProgress.questions);
        } else {
          // 普通练习模式
          setCurrentQuiz(quizId);
          
          // 检查是否有题目，没有的话加载一下
          if (pendingProgress.questions.length > 0) {
            // 使用存储的题目
            setQuestions(pendingProgress.questions);
            // 尝试提取分组信息
            // 这里简单处理，直接使用题目
          } else {
            // 如果没有存储题目，重新加载
            await loadQuiz(quizId);
          }
        }
        
        // 恢复进度
        setCurrentQuestionIndex(pendingProgress.currentQuestionIndex);
        setShowResult(false);
        setScore(pendingProgress.score);
        setCorrectAnswers(new Set(pendingProgress.answerRecords.filter(r => r.isCorrect).map(r => r.questionIndex)));
        setAnswerRecords(pendingProgress.answerRecords);
        setStartTime(pendingProgress.startTime);
        
        // 确保题目中有用户答案
        setQuestions(prevQuestions => {
          const newQuestions = [...prevQuestions];
          pendingProgress.answerRecords.forEach(record => {
            if (newQuestions[record.questionIndex]) {
              newQuestions[record.questionIndex] = {
                ...newQuestions[record.questionIndex],
                userAnswer: record.options
              };
            }
          });
          return newQuestions;
        });
        
      } catch (err) {
        console.error('恢复进度失败:', err);
        setError('恢复进度失败');
      } finally {
        setPendingProgress(null);
        setLoading(false);
      }
    }
  };

  const handleResumeRestart = () => {
    if (pendingProgress) {
      clearQuizProgress(pendingProgress.quizId);
      setShowResumeModal(false);
      setPendingProgress(null);
      loadQuiz(currentQuiz);
    }
  };

  const startExam = () => {
    setIsExamMode(true);
    generateExam();
  };

  const exitExam = () => {
    const currentQuizId = 'exam_mode';
    clearQuizProgress(currentQuizId);
    setIsExamMode(false);
    setExamStarted(false);
    setExamCompleted(false);
    setTimeLeft(0);
    loadQuiz(currentQuiz);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredQuestions = new Set(
    questions
      .map((q, idx) => (q.userAnswer && q.userAnswer.length > 0 ? idx : -1))
      .filter(idx => idx !== -1)
  );

  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);

  if (loading) {
    return <QuizPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent">
        <Empty 
          type="load-error" 
          title={error}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">题库加载中...</h2>
          <p className="text-gray-500">请稍候，正在加载题目数据</p>
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // 触摸滑动处理函数
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;
    
    // 如果水平移动距离大于垂直移动距离，认为是横向滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true;
      setSwipeOffset(deltaX * 0.3); // 限制偏移量
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) {
      setSwipeOffset(0);
      return;
    }
    
    const deltaX = touchEndX.current - touchStartX.current;
    
    if (deltaX > 50) {
      // 向右滑动，上一题
      handlePrev();
    } else if (deltaX < -50) {
      // 向左滑动，下一题
      handleNext();
    }
    
    setSwipeOffset(0);
    isSwiping.current = false;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen">
      {showResumeModal && pendingProgress && (
        <ResumeModal
          quizId={pendingProgress.quizId}
          progress={pendingProgress}
          onContinue={handleResumeContinue}
          onRestart={handleResumeRestart}
        />
      )}

      <header className="glass-card sticky top-0 z-40 safe-area-top border-b border-white/30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap">
            {/* 标题 */}
            <div className="flex items-center gap-2 shrink-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold tracking-tight gradient-text">
                {isExamMode ? '模拟考试' : isMixedMode ? '混合题库' : isWrongMode ? '错题练习' : 'Steam刷题管家'}
              </h1>
              {isExamMode && examStarted && (
                <span className={`text-xs sm:text-sm font-mono font-bold shrink-0 ${timeLeft <= 300 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}>
                  ⏱️ {formatTime(timeLeft)}
                </span>
              )}
            </div>
            
            {/* 分隔线 */}
            <div className="hidden sm:block w-px h-5 bg-gray-200"></div>
            
            {/* 收藏夹和错题库按钮 */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigate('/bookmarks')}
                className="flex p-2 rounded-card hover:bg-gray-100 transition-fast items-center gap-1 active:scale-95"
                title="收藏夹"
              >
                <span className="text-lg">⭐</span>
                {bookmarkCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-yellow-500 text-white rounded-full text-xs font-bold">
                    {bookmarkCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/wrong-questions')}
                className="flex p-2 rounded-card hover:bg-gray-100 transition-fast items-center gap-1 active:scale-95"
                title="错题库"
              >
                <span className="text-lg">📋</span>
                {wrongQuestionsCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                    {wrongQuestionsCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* 分隔线 */}
            <div className="hidden sm:block w-px h-5 bg-gray-200"></div>
            
            {/* 模式选择 */}
            {!isExamMode && !isMixedMode && !isWrongMode && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline text-xs text-gray-600">模式:</span>
                <div className="flex bg-gray-100/80 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setMode('practice');
                      setIsExamMode(false);
                      setIsMixedMode(false);
                      setIsWrongMode(false);
                      setShowResult(false);
                    }}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      mode === 'practice' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    练习
                  </button>
                  <button
                    onClick={() => setMode('exam')}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      mode === 'exam' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    考试
                  </button>
                  <button
                    onClick={startMixedMode}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      mode === 'mixed' || isMixedMode ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    混合
                  </button>
                  <button
                    onClick={startWrongMode}
                    disabled={wrongQuestionsCount === 0}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      mode === 'wrong' || isWrongMode ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    错题
                    {wrongQuestionsCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">
                        {wrongQuestionsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* 即时反馈 */}
            {(mode === 'practice' || mode === 'mixed' || mode === 'wrong') && (
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={immediateFeedback}
                  onChange={(e) => setImmediateFeedback(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-600">即时反馈</span>
              </label>
            )}
            
            {/* 模式按钮 */}
            {mode === 'exam' && !isExamMode && (
              <button
                onClick={() => setIsExamMode(true)}
                className="px-2 sm:px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-xs shrink-0"
              >
                🎯 开始考试
              </button>
            )}
            {mode === 'mixed' && !isMixedMode && (
              <button
                onClick={startMixedMode}
                className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-xs shrink-0"
              >
                🎲 开始混合
              </button>
            )}
            {mode === 'wrong' && !isWrongMode && (
              <button
                onClick={startWrongMode}
                disabled={wrongQuestionsCount === 0}
                className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                📝 开始错题
              </button>
            )}
            
            {/* 退出按钮 */}
            {(isExamMode && !examCompleted) && (
              <button
                onClick={exitExam}
                className="px-2 sm:px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-xs shrink-0"
              >
                退出考试
              </button>
            )}
            {isMixedMode && (
              <button
                onClick={exitMixedMode}
                className="px-2 sm:px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-xs shrink-0"
              >
                退出混合
              </button>
            )}
            {isWrongMode && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={exitWrongMode}
                  className="px-2 sm:px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-xs"
                >
                  退出错题
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要清空所有错题吗？')) {
                      clearWrongQuestions();
                      loadWrongQuestions();
                      alert('错题已清空！');
                    }
                  }}
                  className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-xs"
                >
                  清空错题
                </button>
              </div>
            )}
            
            {/* 章节选择 */}
            {!isExamMode && !isMixedMode && !isWrongMode && availableQuizzes.length > 0 && (
              <select
                value={currentQuiz}
                onChange={(e) => handleQuizChange(e.target.value)}
                className="px-2 sm:px-3 py-1 border border-gray-200 rounded-lg bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shrink-0"
              >
                {availableQuizzes.map((quiz, idx) => (
                  <option key={idx} value={quiz}>{quiz.replace('.txt', '')}</option>
                ))}
              </select>
            )}
            
            {/* 分组选择 */}
            {!isExamMode && !isMixedMode && !isWrongMode && questionGroups.length > 0 && (
              <select
                value={currentGroupIndex}
                onChange={(e) => handleQuizGroupChange(parseInt(e.target.value))}
                className="px-2 sm:px-3 py-1 border border-gray-200 rounded-lg bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs shrink-0"
              >
                {questionGroups.map((group, idx) => (
                  <option key={idx} value={idx}>{group.title}</option>
                ))}
              </select>
            )}
            
            {/* 菜单按钮 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="hidden sm:flex p-2 rounded-card hover:bg-gray-100 transition-fast active:scale-95"
              aria-label="菜单"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {showMobileMenu && (
            <div className="lg:hidden mt-4 pb-2 animate-fadeIn border-t border-gray-100/50 pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">模式:</span>
                <div className="flex bg-gray-100/80 rounded-lg p-1 flex-wrap gap-1">
                  <button
                    onClick={() => {
                      setMode('practice');
                      setIsExamMode(false);
                      setIsMixedMode(false);
                      setIsWrongMode(false);
                      setShowMobileMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      mode === 'practice' && !isExamMode && !isMixedMode && !isWrongMode ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    练习模式
                  </button>
                  <button
                    onClick={() => {
                      setMode('exam');
                      setIsExamMode(false);
                      setIsMixedMode(false);
                      setIsWrongMode(false);
                      setShowMobileMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      mode === 'exam' && !isExamMode && !isMixedMode && !isWrongMode ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    模拟考试
                  </button>
                  <button
                    onClick={() => {
                      setMode('mixed');
                      setIsExamMode(false);
                      setIsMixedMode(false);
                      setIsWrongMode(false);
                      setShowMobileMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      mode === 'mixed' && !isExamMode && !isMixedMode && !isWrongMode ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    混合题库
                  </button>
                  <button
                    onClick={() => {
                      startWrongMode();
                      setShowMobileMenu(false);
                    }}
                    disabled={wrongQuestionsCount === 0}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      mode === 'wrong' || isWrongMode ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    错题练习
                    {wrongQuestionsCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">
                        {wrongQuestionsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              {(mode === 'practice' || mode === 'mixed') && !isExamMode && !isMixedMode && !isWrongMode && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={immediateFeedback}
                    onChange={(e) => setImmediateFeedback(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">即时反馈</span>
                </label>
              )}
              {mode === 'exam' && !isExamMode && (
                <button
                  onClick={() => {
                    setIsExamMode(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
                >
                  🎯 开始模拟考试
                </button>
              )}
              {mode === 'mixed' && !isMixedMode && (
                <button
                  onClick={() => {
                    startMixedMode();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  🎲 开始混合题库
                </button>
              )}
              {isExamMode && !examCompleted && (
                <button
                  onClick={() => {
                    exitExam();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                >
                  退出考试
                </button>
              )}
              {isMixedMode && (
                <button
                  onClick={() => {
                    exitMixedMode();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                >
                  退出混合题库
                </button>
              )}
              {mode === 'wrong' && !isWrongMode && (
                <button
                  onClick={() => {
                    startWrongMode();
                    setShowMobileMenu(false);
                  }}
                  disabled={wrongQuestionsCount === 0}
                  className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📝 开始错题练习
                </button>
              )}
              {isWrongMode && (
                <button
                  onClick={() => {
                    exitWrongMode();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                >
                  退出错题练习
                </button>
              )}
              {!isExamMode && !isMixedMode && !isWrongMode && availableQuizzes.length > 0 && (
                <select
                  value={currentQuiz}
                  onChange={(e) => {
                    handleQuizChange(e.target.value);
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableQuizzes.map((quiz, idx) => (
                    <option key={idx} value={quiz}>{quiz.replace('.txt', '')}</option>
                  ))}
                </select>
              )}
              {!isExamMode && !isMixedMode && !isWrongMode && questionGroups.length > 0 && (
                <select
                  value={currentGroupIndex}
                  onChange={(e) => {
                    handleQuizGroupChange(parseInt(e.target.value));
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {questionGroups.map((group, idx) => (
                    <option key={idx} value={idx}>{group.title}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </header>

      {questions.length === 0 && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 pt-24 sm:pt-28">
          <div className="text-center w-full max-w-sm animate-fadeIn">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📚</span>
            </div>
            <p className="text-gray-600 text-base font-medium">暂无题目</p>
            <p className="text-gray-400 text-sm mt-2">请选择章节开始答题</p>
          </div>
        </div>
      )}

      {mode === 'exam' && !isExamMode && (
        <div className="px-3 sm:px-4 py-4 sm:py-6 pt-24 sm:pt-28">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-8 mx-auto border border-white/50" style={{ 
            maxWidth: '600px', 
            width: '100%',
            boxShadow: '0 8px 32px rgba(79,70,229,0.08)' 
          }}>
            {/* 顶部标题区 */}
            <div className="text-center mb-7">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">模拟考试配置</h2>
              <p className="text-gray-400 text-sm">自定义你的练习计划</p>
            </div>
            
            <div className="space-y-6">
              {/* 题库选择区 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">选择题库</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedQuizFiles(availableQuizzes)}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                    >
                      全选
                    </button>
                    <button
                      onClick={() => setSelectedQuizFiles([])}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {availableQuizzes.map((quiz, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-2 px-3 py-3 rounded-lg border cursor-pointer transition-all text-sm relative ${
                        selectedQuizFiles.includes(quiz) 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600' 
                          : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      {selectedQuizFiles.includes(quiz) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg" />
                      )}
                      <input
                        type="checkbox"
                        checked={selectedQuizFiles.includes(quiz)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuizFiles([...selectedQuizFiles, quiz]);
                          } else {
                            setSelectedQuizFiles(selectedQuizFiles.filter(f => f !== quiz));
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span>{quiz.replace('.txt', '')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 参数配置区 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontSize: '13px', color: '#6b7280' }}>
                    单选题数量
                    <span className="text-xs text-gray-400 ml-1">默认</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
                    value={examConfig.singleCount}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const value = e.currentTarget.value;
                      const num = parseInt(value);
                      if (!value || (num >= 1 && num <= 100 && value.match(/^\d*$/))) {
                        setExamConfig({ ...examConfig, singleCount: value });
                      }
                    }}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                      e.currentTarget.select();
                      e.currentTarget.style.borderColor = '#4f46e5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)';
                    }}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none transition-all"
                    style={{ 
                      fontSize: '15px', 
                      color: '#1f2937',
                      borderColor: '#d1d5db'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontSize: '13px', color: '#6b7280' }}>
                    多选题数量
                    <span className="text-xs text-gray-400 ml-1">默认</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="5"
                    value={examConfig.multipleCount}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const value = e.currentTarget.value;
                      const num = parseInt(value);
                      if (!value || (num >= 1 && num <= 100 && value.match(/^\d*$/))) {
                        setExamConfig({ ...examConfig, multipleCount: value });
                      }
                    }}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                      e.currentTarget.select();
                      e.currentTarget.style.borderColor = '#4f46e5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)';
                    }}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none transition-all"
                    style={{ 
                      fontSize: '15px', 
                      color: '#1f2937',
                      borderColor: '#d1d5db'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontSize: '13px', color: '#6b7280' }}>
                    考试时长(分钟)
                    <span className="text-xs text-gray-400 ml-1">默认</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    placeholder="30"
                    value={examConfig.duration}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const value = e.currentTarget.value;
                      const num = parseInt(value);
                      if (!value || (num >= 1 && num <= 180 && value.match(/^\d*$/))) {
                        setExamConfig({ ...examConfig, duration: value });
                      }
                    }}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                      e.currentTarget.select();
                      e.currentTarget.style.borderColor = '#4f46e5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)';
                    }}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none transition-all"
                    style={{ 
                      fontSize: '15px', 
                      color: '#1f2937',
                      borderColor: '#d1d5db'
                    }}
                  />
                </div>
              </div>

              {/* 配置摘要区 */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                <div className="text-center text-sm text-gray-600">
                  已选 <span className="font-semibold text-indigo-600">{selectedQuizFiles.length}</span> 个章节 · 
                  共 <span className="font-semibold text-indigo-600">{parseInt(examConfig.singleCount || '10') + parseInt(examConfig.multipleCount || '5')}</span> 题 · 
                  预计用时 <span className="font-semibold text-indigo-600">{examConfig.duration || '30'}</span> 分钟
                </div>
              </div>

              {/* 考试说明区 */}
              <details open>
                <summary className="flex items-center justify-between cursor-pointer px-4 py-3 rounded-xl font-medium bg-indigo-50/50 text-indigo-600">
                  <span className="text-sm font-semibold">考试说明</span>
                  <svg 
                    className="w-4 h-4 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="pt-3">
                  <p className="text-sm leading-relaxed text-indigo-500">
                    考试开始后将从所选题库中随机抽取题目，答题完成后点击提交查看成绩。考试时间结束将自动提交。
                  </p>
                </div>
              </details>

              {/* 操作按钮区 */}
              <div className="pt-2">
                <p className="text-xs text-gray-400 text-center mb-3">配置将自动保存，下次访问保留上次设置</p>
                <button
                  onClick={() => {
                    if (selectedQuizFiles.length === 0) {
                      alert('请至少选择一个题库');
                      return;
                    }
                    startExam();
                  }}
                  disabled={selectedQuizFiles.length === 0}
                  className="w-full h-12 flex items-center justify-center gap-2 text-white rounded-xl font-semibold transition-all gradient-primary"
                  style={{ 
                    opacity: selectedQuizFiles.length === 0 ? 0.5 : 1,
                    cursor: selectedQuizFiles.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedQuizFiles.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(79,70,229,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedQuizFiles.length > 0) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (selectedQuizFiles.length > 0) {
                      e.currentTarget.style.transform = 'translateY(1px)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (selectedQuizFiles.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                >
                  <span className="text-lg">🎯</span>
                  <span>开始考试</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isExamMode && (examStarted || examCompleted) && (
        <main 
          ref={mainRef}
          className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 touch-pan-y pt-24 sm:pt-28"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <div
                className="transition-transform duration-100"
                style={{ transform: `translateX(${swipeOffset}px)` }}
              >
                <QuestionCard
                  question={currentQuestion}
                  showResult={showResult}
                  onAnswerChange={handleAnswerChange}
                  immediateFeedback={false}
                  onAnswerConfirmed={handleAnswerConfirmed}
                  quizFile={currentQuiz}
                />
              </div>
            </div>
            
            <div className="lg:w-64 sm:w-full">
              <div className="lg:sticky lg:top-24">
                <ExplanationPanel 
                  question={currentQuestion} 
                  showResult={showResult} 
                />
                <QuestionList
                  totalQuestions={questions.length}
                  currentIndex={currentQuestionIndex}
                  answeredQuestions={answeredQuestions}
                  showResult={showResult}
                  correctAnswers={correctAnswers}
                  onSelect={handleSelectQuestion}
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {isMixedMode && (
        <main 
          className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 touch-pan-y pt-24 sm:pt-28"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <div
                className="transition-transform duration-100"
                style={{ transform: `translateX(${swipeOffset}px)` }}
              >
                <QuestionCard
                  question={currentQuestion}
                  showResult={showResult}
                  onAnswerChange={handleAnswerChange}
                  immediateFeedback={true}
                  onCorrectAnswer={() => {
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                      setShowResult(false);
                    }
                  }}
                  onAnswerConfirmed={handleAnswerConfirmed}
                  quizFile={currentQuiz}
                />
              </div>
            </div>
            
            <div className="lg:w-64 sm:w-full">
              <div className="lg:sticky lg:top-24">
                <ExplanationPanel 
                  question={currentQuestion} 
                  showResult={showResult} 
                />
                <QuestionList
                  totalQuestions={questions.length}
                  currentIndex={currentQuestionIndex}
                  answeredQuestions={answeredQuestions}
                  showResult={showResult}
                  correctAnswers={correctAnswers}
                  onSelect={handleSelectQuestion}
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {isWrongMode && (
        <main 
          className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 touch-pan-y pt-24 sm:pt-28"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">太棒了！还没有错题</h2>
              <p className="text-gray-500 mb-6">继续保持，答错的题目会自动加入错题库</p>
              <button
                onClick={() => {
                  setIsWrongMode(false);
                }}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
              >
                返回练习
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                {currentQuestion.wrongInfo && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    错题次数: <span className="font-bold">{currentQuestion.wrongInfo.wrongCount}</span>
                  </p>
                </div>
              )}
              <div
                className="transition-transform duration-100"
                style={{ transform: `translateX(${swipeOffset}px)` }}
              >
                <QuestionCard
                  question={currentQuestion}
                  showResult={showResult}
                  onAnswerChange={handleAnswerChange}
                  immediateFeedback={true}
                  onCorrectAnswer={() => {
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                      setShowResult(false);
                    }
                  }}
                  onAnswerConfirmed={handleAnswerConfirmed}
                  quizFile={currentQuiz}
                />
              </div>
            </div>
            
            <div className="lg:w-64 sm:w-full">
              <div className="lg:sticky lg:top-24">
                <ExplanationPanel 
                  question={currentQuestion} 
                  showResult={showResult} 
                />
                <QuestionList
                  totalQuestions={questions.length}
                  currentIndex={currentQuestionIndex}
                  answeredQuestions={answeredQuestions}
                  showResult={showResult}
                  correctAnswers={correctAnswers}
                  onSelect={handleSelectQuestion}
                />
              </div>
            </div>
          </div>
          )}
        </main>
      )}

      {(mode === 'practice' && !isExamMode && !isMixedMode && !isWrongMode) && (
        <main 
          className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 touch-pan-y pt-24 sm:pt-28"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {!currentQuiz ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-6xl mb-6">📚</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">请选择练习章节</h2>
              <p className="text-gray-500 mb-8">选择一个章节开始你的学习之旅</p>
              <div className="w-full max-w-md space-y-3">
                {availableQuizzes.map(quiz => (
                  <button
                    key={quiz}
                    onClick={() => handleQuizChange(quiz)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left card-hover"
                  >
                    <span className="text-gray-800 font-medium">{quiz.replace('.txt', '')}</span>
                    <span className="text-gray-400 text-sm ml-2">开始练习</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <div
                  className="transition-transform duration-100"
                  style={{ transform: `translateX(${swipeOffset}px)` }}
                >
                  <QuestionCard
                    question={currentQuestion}
                    showResult={immediateFeedback ? false : showResult}
                    onAnswerChange={handleAnswerChange}
                    immediateFeedback={immediateFeedback}
                    onCorrectAnswer={() => {
                      if (currentQuestionIndex < questions.length - 1) {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        setShowResult(false);
                      }
                    }}
                    onAnswerConfirmed={handleAnswerConfirmed}
                    quizFile={currentQuiz}
                  />
                </div>
            </div>
            
            <div className="lg:w-64 sm:w-full">
              <div className="lg:sticky lg:top-24">
                <ExplanationPanel 
                  question={currentQuestion} 
                  showResult={showResult} 
                />
                <QuestionList
                  totalQuestions={questions.length}
                  currentIndex={currentQuestionIndex}
                  answeredQuestions={answeredQuestions}
                  showResult={showResult}
                  correctAnswers={correctAnswers}
                  onSelect={handleSelectQuestion}
                />
              </div>
            </div>
          </div>
          )}
        </main>
      )}

      {currentQuiz && ((isExamMode && (examStarted || examCompleted)) || (mode === 'practice' && !isExamMode && !isMixedMode && !isWrongMode) || isMixedMode || isWrongMode) ? (
        <ProgressPanel
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          answeredCount={answeredQuestions.size}
          score={score}
          totalScore={totalScore}
          onPrev={handlePrev}
          onNext={handleNext}
          onSubmit={handleSubmit}
          showResult={showResult}
          showSubmit={!immediateFeedback || mode !== 'practice'}
        />
      ) : null}
      </div>
    </div>
  );
}