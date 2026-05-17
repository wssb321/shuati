import { useState, useEffect } from 'react';
import { SwipeQuestionContainer } from '../components/SwipeQuestionContainer';
import { MinimalQuizToolbar } from '../components/MinimalQuizToolbar';
import { ProgressDots } from '../components/ProgressDots';
import { parseQuestionFile, Question } from '../utils/questionParser';
import { toggleBookmark, isBookmarked as checkBookmarked } from '../utils/bookmarkManager';
import { getQuizSettings, saveQuizSettings } from '../utils/settingsManager';
import { Menu, X } from 'lucide-react';
import { ToggleSwitch } from '../components/ToggleSwitch';

type Mode = 'practice' | 'mixed' | 'wrong' | 'favorites';

export const MinimalQuizPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [availableQuizzes, setAvailableQuizzes] = useState<string[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState('第四章.txt');
  const [mode, setMode] = useState<Mode>('practice');
  const [immediateFeedback, setImmediateFeedback] = useState(false);
  const [autoJump, setAutoJump] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const settings = getQuizSettings();
    setImmediateFeedback(settings.immediateFeedback || false);
    setAutoJump(settings.autoJump || false);
  }, []);

  useEffect(() => {
    saveQuizSettings({ immediateFeedback, autoJump });
  }, [immediateFeedback, autoJump]);

  useEffect(() => {
    const discoverQuizzes = async () => {
      try {
        const quizzes = ['第四章.txt', '第五章.txt', '第六章.txt', '第七章.txt', '第八章.txt'];
        setAvailableQuizzes(quizzes);
        await loadQuiz('第四章.txt');
        setLoading(false);
      } catch (err) {
        setError('加载题库失败');
        setLoading(false);
      }
    };
    discoverQuizzes();
  }, []);

  useEffect(() => {
    console.log('Questions loaded:', questions.length, 'Current index:', currentQuestionIndex);
  }, [questions, currentQuestionIndex]);

  const loadQuiz = async (quizFile: string) => {
    try {
      const response = await fetch(`/题库/${quizFile}`);
      if (!response.ok) {
        throw new Error('Failed to load quiz');
      }
      const content = await response.text();
      const groups = parseQuestionFile(content);
      const allQuestions = groups.flatMap(g => g.questions);
      setQuestions(allQuestions);
      setCurrentQuestionIndex(0);
      setShowResult(false);
      setScore(0);
      setCorrectAnswers([]);
      setCurrentQuiz(quizFile);
      setMode('practice');
    } catch (err) {
      console.error('Error loading quiz:', err);
    }
  };

  const handleAnswerChange = (answer: string[]) => {
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[currentQuestionIndex] = {
        ...newQuestions[currentQuestionIndex],
        userAnswer: answer
      };
      return newQuestions;
    });
  };

  const handleCorrectAnswer = (index: number) => {
    const currentQuestion = questions[index];
    const isCorrect = currentQuestion.userAnswer?.length === currentQuestion.correctAnswer.length && 
      currentQuestion.userAnswer?.every(key => currentQuestion.correctAnswer.includes(key));
    
    if (isCorrect) {
      setScore(prev => prev + (currentQuestion.score || 0));
      setCorrectAnswers(prev => [...prev, index]);
    }

    if (autoJump && index < questions.length - 1) {
      setCurrentQuestionIndex(index + 1);
    }
  };

  const answeredQuestions = questions
    .map((q, i) => q.userAnswer && q.userAnswer.length > 0 ? i : -1)
    .filter(i => i !== -1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <style>{`
        @supports (padding-top: env(safe-area-inset-top)) {
          .pt-safe {
            padding-top: env(safe-area-inset-top);
          }
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-xl border-b border-white/40 pt-safe">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">刷题练习</h1>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-xl hover:bg-white/60 transition-colors"
          >
            {showMobileMenu ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        {showMobileMenu && (
          <div className="border-t border-white/30 bg-white/70 backdrop-blur-xl">
            <div className="max-w-md mx-auto px-4 py-4 space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-600">模式选择</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'practice', label: '练习模式', color: 'blue' },
                    { id: 'mixed', label: '混合题库', color: 'green' },
                    { id: 'wrong', label: '错题练习', color: 'red' },
                    { id: 'favorites', label: '收藏练习', color: 'amber' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMode(item.id as Mode);
                        setShowMobileMenu(false);
                      }}
                      className={`
                        px-3 py-2 rounded-xl text-sm font-medium
                        ${mode === item.id 
                          ? `bg-${item.color}-500 text-white shadow-lg shadow-${item.color}-500/30` 
                          : 'bg-white/60 text-gray-700'}
                      `}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/40">
                <div className="text-sm font-semibold text-gray-600">设置</div>
                <div className="space-y-2">
                  <ToggleSwitch
                    label="即时反馈"
                    checked={immediateFeedback}
                    onChange={setImmediateFeedback}
                  />
                  <ToggleSwitch
                    label="自动跳转"
                    checked={autoJump}
                    onChange={setAutoJump}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/40">
                <div className="text-sm font-semibold text-gray-600">题库选择</div>
                <div className="flex flex-wrap gap-2">
                  {availableQuizzes.map((quiz) => (
                    <button
                      key={quiz}
                      onClick={() => {
                        loadQuiz(quiz);
                        setShowMobileMenu(false);
                      }}
                      className={`
                        px-3 py-1.5 rounded-xl text-xs font-medium
                        ${currentQuiz === quiz ? 'bg-blue-500 text-white' : 'bg-white/60 text-gray-700'}
                      `}
                    >
                      {quiz.replace('.txt', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="pt-20 pb-40 min-h-screen">
        {questions.length > 0 ? (
          <>
            <SwipeQuestionContainer
              questions={questions}
              currentIndex={currentQuestionIndex}
              onIndexChange={setCurrentQuestionIndex}
              showResult={showResult}
              onAnswerChange={handleAnswerChange}
              immediateFeedback={immediateFeedback}
              autoJump={autoJump}
              onCorrectAnswer={handleCorrectAnswer}
              isBookmarked={(questionId: number, quizFile?: string) => 
                checkBookmarked(questionId, quizFile || currentQuiz)
              }
              onToggleBookmark={(questionId: number, quizFile?: string) => 
                toggleBookmark(questionId, quizFile || currentQuiz)
              }
              currentQuiz={currentQuiz}
            />
            <ProgressDots
              total={questions.length}
              current={currentQuestionIndex}
              answered={answeredQuestions}
              correct={correctAnswers}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-4">📝</div>
              <div>暂无题目</div>
            </div>
          </div>
        )}
      </main>

      {questions.length > 0 && (
        <MinimalQuizToolbar
          isBookmarked={checkBookmarked(questions[currentQuestionIndex]?.id, currentQuiz)}
          isFlagged={false}
          onToggleBookmark={() => 
            toggleBookmark(questions[currentQuestionIndex]?.id, currentQuiz)
          }
          onToggleFlag={() => {}}
          onShowWrongNotes={() => setMode('wrong')}
          onShowAnalysis={() => {}}
        />
      )}
    </div>
  );
};
