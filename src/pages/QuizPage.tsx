import { useState, useEffect } from 'react';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressPanel } from '../components/ProgressPanel';
import { QuestionList } from '../components/QuestionList';
import { parseQuestionFile, Question, QuestionGroup, shuffleArray } from '../utils/questionParser';
import { saveWrongQuestion, getWrongQuestions, removeWrongQuestion, clearWrongQuestions, convertToQuestion } from '../utils/wrongQuestionManager';

type Mode = 'practice' | 'exam' | 'mixed' | 'wrong';

export function QuizPage() {
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
  const [currentQuiz, setCurrentQuiz] = useState('第四章.txt');
  const [mode, setMode] = useState<Mode>('practice');
  const [immediateFeedback, setImmediateFeedback] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [isExamMode, setIsExamMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [selectedQuizFiles, setSelectedQuizFiles] = useState<string[]>([]);
  const [examConfig, setExamConfig] = useState({
    singleCount: 10,
    multipleCount: 5,
    duration: 30
  });
  const [mixedQuestions, setMixedQuestions] = useState<Question[]>([]);
  const [isMixedMode, setIsMixedMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [wrongQuestionsCount, setWrongQuestionsCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [isWrongMode, setIsWrongMode] = useState(false);

  useEffect(() => {
    const discoverQuizzes = async () => {
      try {
        const quizzes = ['第四章.txt', '第五章.txt', '第六章.txt', '第七章.txt', '第八章.txt', '第八章2.txt', '第八章3.txt', '第八章4.txt', '第八章5.txt', '第九章.txt', '第九章1.txt', '第九章2.txt', '第九章3.txt', '第九章4.txt'];
        setAvailableQuizzes(quizzes);
        setSelectedQuizFiles(quizzes);
        await loadQuiz('第四章.txt');
        await loadWrongQuestions();
        setLoading(false);
      } catch (err) {
        setError('加载题库失败，请检查文件路径');
        setLoading(false);
      }
    };
    discoverQuizzes();
  }, []);

  const updateWrongQuestionsCount = () => {
    const wrongQs = getWrongQuestions();
    setWrongQuestionsCount(wrongQs.length);
  };

  useEffect(() => {
    let timer: number | undefined;
    if (examStarted && timeLeft > 0 && !examCompleted) {
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
  }, [examStarted, timeLeft, examCompleted]);

  const loadQuiz = async (quizFile: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/题库/${quizFile}`);
      if (!response.ok) {;
      }
      const content = await response.text();
      const groups = parseQuestionFile(content);
      setQuestionGroups(groups);
      if (groups.length > 0) {
        const allQuestions = groups.flatMap(g => g.questions);
        setQuestions(allQuestions);
      }
      setCurrentQuestionIndex(0);
      setCurrentGroupIndex(0);
      setShowResult(false);
      setScore(0);
      setCorrectAnswers(new Set());
      setError('');
      setLoading(false);
    } catch (err) {
      setError('加载题库失败，请检查文件路径');
      setLoading(false);
    }
  };

  const loadAllQuizzes = async (quizFiles: string[]) => {
    const allQuestions: Question[] = [];
    for (const file of quizFiles) {
      try {
        const response = await fetch(`/题库/${file}`);
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
    const allQuestions = await loadAllQuizzes(selectedQuizFiles);
    const singleQuestions = allQuestions.filter(q => q.type === 'single');
    const multipleQuestions = allQuestions.filter(q => q.type === 'multiple');

    const shuffledSingle = shuffleArray(singleQuestions);
    const shuffledMultiple = shuffleArray(multipleQuestions);

    const selectedSingle = shuffledSingle.slice(0, examConfig.singleCount);
    const selectedMultiple = shuffledMultiple.slice(0, examConfig.multipleCount);

    const examQuestionsList = shuffleArray([...selectedSingle, ...selectedMultiple]);
    setExamQuestions(examQuestionsList);
    setQuestions(examQuestionsList);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setScore(0);
    setCorrectAnswers(new Set());
    setExamStarted(true);
    setExamCompleted(false);
    setTimeLeft(examConfig.duration * 60);
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
    setIsWrongMode(true);
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
    } else if (isAnswerCorrect && isWrongMode) {
      const wrongQuestionId = `${currentQuiz}_${question.id}`;
      removeWrongQuestion(wrongQuestionId);
      updateWrongQuestionsCount();
    }
  };

  const handleAnswerConfirmed = (answers: string[]) => {
    checkAndSaveWrongQuestion(currentQuestion, answers);
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

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowMobileMenu(false);
  };

  const handleSubmit = () => {
    if (showResult) {
      setQuestions(questions.map(q => ({ ...q, userAnswer: undefined })));
      setShowResult(false);
      setScore(0);
      setCorrectAnswers(new Set());
      setCurrentQuestionIndex(0);
      setExamCompleted(false);
      setExamStarted(false);
      setTimeLeft(0);
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

    questions.forEach((q, idx) => {
      totalScore += q.score;
      if (q.userAnswer && 
          q.userAnswer.length === q.correctAnswer.length &&
          q.userAnswer.every(a => q.correctAnswer.includes(a))) {
        earnedScore += q.score;
        correct.add(idx);
      }
    });

    setScore(earnedScore);
    setCorrectAnswers(correct);
    setShowResult(true);
    if (isExamMode) {
      setExamCompleted(true);
      setExamStarted(false);
    }
  };

  const startExam = () => {
    setIsExamMode(true);
    generateExam();
  };

  const exitExam = () => {
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center w-full max-w-xs">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-base">正在加载题库...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center w-full max-w-xs">
          <p className="text-red-500 mb-4 text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-base"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <p className="text-gray-600 text-base">暂无题目</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-36">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                📚 {isExamMode ? '模拟考试' : isMixedMode ? '混合题库' : '刷题练习'}
              </h1>
              {isExamMode && examStarted && (
                <span className={`text-base sm:text-xl font-mono font-bold flex-shrink-0 ${timeLeft <= 300 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                  ⏱️ {formatTime(timeLeft)}
                </span>
              )}
            </div>
            
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="菜单"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <div className="hidden lg:flex items-center gap-3 sm:gap-4 flex-wrap">
              {!isExamMode && !isMixedMode && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600">模式:</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => {
                          setMode('practice');
                          setIsExamMode(false);
                          setIsMixedMode(false);
                          setIsWrongMode(false);
                          setShowResult(false);
                        }}
                        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          mode === 'practice' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        练习模式
                      </button>
                      <button
                        onClick={() => setMode('exam')}
                        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          mode === 'exam' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        模拟考试
                      </button>
                      <button
                        onClick={() => setMode('mixed')}
                        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          mode === 'mixed' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        混合题库
                      </button>
                      <button
                        onClick={() => setMode('wrong')}
                        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          mode === 'wrong' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
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
                  {(mode === 'practice' || mode === 'mixed' || mode === 'wrong') && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={immediateFeedback}
                        onChange={(e) => setImmediateFeedback(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-600">即时反馈</span>
                    </label>
                  )}
                </>
              )}
              {mode === 'exam' && !isExamMode && (
                <button
                  onClick={() => setIsExamMode(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-xs sm:text-sm"
                >
                  🎯 开始模拟考试
                </button>
              )}
              {mode === 'mixed' && !isMixedMode && (
                <button
                  onClick={startMixedMode}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-xs sm:text-sm"
                >
                  🎲 开始混合题库
                </button>
              )}
              {mode === 'wrong' && !isWrongMode && (
                <button
                  onClick={startWrongMode}
                  disabled={wrongQuestionsCount === 0}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  📝 开始错题练习
                </button>
              )}
              {isExamMode && !examCompleted && (
                <button
                  onClick={exitExam}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-xs sm:text-sm"
                >
                  退出考试
                </button>
              )}
              {isMixedMode && (
                <button
                  onClick={exitMixedMode}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-xs sm:text-sm"
                >
                  退出混合题库
                </button>
              )}
              {isWrongMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={exitWrongMode}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-xs sm:text-sm"
                  >
                    退出错题练习
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要清空所有错题吗？')) {
                        clearWrongQuestions();
                        loadWrongQuestions();
                        alert('错题已清空！');
                      }
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-xs sm:text-sm"
                  >
                    清空错题
                  </button>
                </div>
              )}
              {!isExamMode && availableQuizzes.length > 0 && (
                <select
                  value={currentQuiz}
                  onChange={(e) => {
                    setCurrentQuiz(e.target.value);
                    loadQuiz(e.target.value);
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                >
                  {availableQuizzes.map((quiz, idx) => (
                    <option key={idx} value={quiz}>{quiz.replace('.txt', '')}</option>
                  ))}
                </select>
              )}
              {!isExamMode && questionGroups.length > 0 && (
                <select
                  value={currentGroupIndex}
                  onChange={(e) => {
                    setCurrentGroupIndex(parseInt(e.target.value));
                    const group = questionGroups[parseInt(e.target.value)];
                    setQuestions(group.questions);
                    setCurrentQuestionIndex(0);
                    setShowResult(false);
                    setScore(0);
                    setCorrectAnswers(new Set());
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                >
                  {questionGroups.map((group, idx) => (
                    <option key={idx} value={idx}>{group.title}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {showMobileMenu && (
            <div className="lg:hidden mt-4 pb-2 animate-fadeIn border-t border-gray-100 pt-4 space-y-3">
              {!isExamMode && !isMixedMode && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">模式:</span>
                    <div className="flex bg-gray-100 rounded-lg p-1 flex-wrap gap-1">
                      <button
                        onClick={() => {
                          setMode('practice');
                          setShowMobileMenu(false);
                        }}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          mode === 'practice' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        练习模式
                      </button>
                      <button
                        onClick={() => {
                          setMode('exam');
                          setShowMobileMenu(false);
                        }}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          mode === 'exam' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        模拟考试
                      </button>
                      <button
                        onClick={() => {
                          setMode('mixed');
                          setShowMobileMenu(false);
                        }}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          mode === 'mixed' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        混合题库
                      </button>
                    </div>
                  </div>
                  {(mode === 'practice' || mode === 'mixed') && (
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
                </>
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
              {!isExamMode && availableQuizzes.length > 0 && (
                <select
                  value={currentQuiz}
                  onChange={(e) => {
                    setCurrentQuiz(e.target.value);
                    loadQuiz(e.target.value);
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableQuizzes.map((quiz, idx) => (
                    <option key={idx} value={quiz}>{quiz.replace('.txt', '')}</option>
                  ))}
                </select>
              )}
              {!isExamMode && questionGroups.length > 0 && (
                <select
                  value={currentGroupIndex}
                  onChange={(e) => {
                    setCurrentGroupIndex(parseInt(e.target.value));
                    const group = questionGroups[parseInt(e.target.value)];
                    setQuestions(group.questions);
                    setCurrentQuestionIndex(0);
                    setShowResult(false);
                    setScore(0);
                    setCorrectAnswers(new Set());
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

      {mode === 'exam' && !isExamMode && (
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">📝 模拟考试配置</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择题库</label>
                <div className="flex flex-wrap gap-2">
                  {availableQuizzes.map((quiz, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors text-sm ${
                        selectedQuizFiles.includes(quiz) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
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
                        className="w-4 h-4 rounded text-blue-500"
                      />
                      <span>{quiz.replace('.txt', '')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单选题数量</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={examConfig.singleCount}
                    onChange={(e) => setExamConfig({ ...examConfig, singleCount: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">多选题数量</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={examConfig.multipleCount}
                    onChange={(e) => setExamConfig({ ...examConfig, multipleCount: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">考试时长(分钟)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={examConfig.duration}
                    onChange={(e) => setExamConfig({ ...examConfig, duration: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <strong>考试说明：</strong>考试开始后将从所选题库中随机抽取题目，答题完成后点击提交查看成绩。
                  考试时间结束将自动提交。
                </p>
              </div>

              <button
                onClick={startExam}
                disabled={selectedQuizFiles.length === 0}
                className="w-full mt-4 sm:mt-6 py-3 sm:py-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
              >
                🎯 开始考试
              </button>
            </div>
          </div>
        </div>
      )}

      {isExamMode && (examStarted || examCompleted) && (
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <QuestionCard
                question={currentQuestion}
                showResult={showResult}
                onAnswerChange={handleAnswerChange}
                immediateFeedback={false}
                onAnswerConfirmed={handleAnswerConfirmed}
              />
            </div>
            
            <div className="lg:w-64 sm:w-full">
              <div className="lg:sticky lg:top-24">
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
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <QuestionCard
                question={currentQuestion}
                showResult={showResult}
                onAnswerChange={handleAnswerChange}
                immediateFeedback={true}
                onCorrectAnswer={() => {
                  if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                  }
                }}
                onAnswerConfirmed={handleAnswerConfirmed}
              />
            </div>
            
            <div className="lg:w-64 sm:w-full">
              <div className="lg:sticky lg:top-24">
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
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              {currentQuestion.wrongInfo && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    错题次数: <span className="font-bold">{currentQuestion.wrongInfo.wrongCount}</span>
                  </p>
                </div>
              )}
              <QuestionCard
                question={currentQuestion}
                showResult={showResult}
                onAnswerChange={handleAnswerChange}
                immediateFeedback={true}
                onCorrectAnswer={() => {
                  if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                  }
                }}
                onAnswerConfirmed={handleAnswerConfirmed}
              />
            </div>
            
            <div className="lg:w-64 sm:w-full">
              <div className="lg:sticky lg:top-24">
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

      {mode === 'practice' && !isExamMode && !isMixedMode && !isWrongMode && (
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <QuestionCard
                question={currentQuestion}
                showResult={showResult}
                onAnswerChange={handleAnswerChange}
                immediateFeedback={immediateFeedback}
                onAnswerConfirmed={handleAnswerConfirmed}
              />
            </div>
            
            <div className="lg:w-64 sm:w-full">
              <div className="lg:sticky lg:top-24">
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

      {(isExamMode && (examStarted || examCompleted)) || (mode === 'practice' && !isExamMode && !isMixedMode && !isWrongMode) || isMixedMode || isWrongMode ? (
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
        />
      ) : null}
    </div>
  );
}
