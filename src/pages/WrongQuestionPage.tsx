import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWrongQuestions, removeWrongQuestion, WrongQuestion } from '../utils/wrongQuestionManager';
import { Question, shuffleArray } from '../utils/questionParser';
import { Empty } from '../components/Empty';

type SortType = 'time' | 'wrongCount';

export function WrongQuestionPage() {
  const navigate = useNavigate();
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<string>('all');
  const [sortType, setSortType] = useState<SortType>('time');
  const [availableQuizzes, setAvailableQuizzes] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const saved = getWrongQuestions();
    setWrongQuestions(saved);
    
    const quizFiles = Array.from(new Set(saved.map(q => q.sourceQuiz)));
    setAvailableQuizzes(quizFiles);
  };

  const handleRemoveWrongQuestion = (id: string) => {
    removeWrongQuestion(id);
    setWrongQuestions(prev => prev.filter(q => q.id !== id));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startPractice = () => {
    const questions: Question[] = filteredWrongQuestions.map(wq => ({
      id: parseInt(wq.id.split('_').pop() || '0'),
      type: wq.type,
      question: wq.question,
      options: wq.options,
      correctAnswer: wq.correctAnswer,
      score: 0,
      explanation: wq.explanation,
      knowledgePoints: wq.knowledgePoints,
      wrongInfo: {
        wrongCount: wq.wrongCount,
        lastWrongTime: wq.lastWrongTime,
        previousUserAnswer: wq.userAnswer
      }
    }));
    
    if (questions.length > 0) {
      sessionStorage.setItem('practiceQuestions', JSON.stringify(questions));
      sessionStorage.setItem('practiceMode', 'wrong');
      navigate('/');
    }
  };

  const filteredWrongQuestions = [...wrongQuestions].filter(question => {
    if (selectedQuiz !== 'all' && question.sourceQuiz !== selectedQuiz) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        question.question.toLowerCase().includes(searchLower) ||
        question.id.includes(searchTerm)
      );
    }
    
    return true;
  }).sort((a, b) => {
    if (sortType === 'time') {
      return b.lastWrongTime - a.lastWrongTime;
    } else {
      return b.wrongCount - a.wrongCount;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-36">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">📋 错题库</h1>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {wrongQuestions.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="搜索题目..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部题库</option>
                {availableQuizzes.map((quiz, idx) => (
                  <option key={idx} value={quiz}>{quiz.replace('.txt', '')}</option>
                ))}
              </select>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSortType('time')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortType === 'time' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                按时间排序
              </button>
              <button
                onClick={() => setSortType('wrongCount')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortType === 'wrongCount' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                按错误次数
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {filteredWrongQuestions.length === 0 ? (
          <Empty
            icon="🎉"
            title="太棒了，还没有错题"
            description="继续保持，你做得很好！"
          />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredWrongQuestions.map((question) => (
              <div key={question.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-l-4 border-red-400">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.type === 'single' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {question.type === 'single' ? '单选题' : '多选题'}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      错误 {question.wrongCount} 次
                    </span>
                    <span className="text-sm text-gray-400">
                      {question.sourceQuiz.replace('.txt', '')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveWrongQuestion(question.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="移除错题"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-gray-800 mb-3 leading-relaxed text-sm sm:text-base">
                  {question.question.length > 100 ? `${question.question.substring(0, 100)}...` : question.question}
                </p>
                
                <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-red-600">上次答案:</span>
                    <span className="text-xs sm:text-sm text-red-700">{question.userAnswer.join('、')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-green-600">正确答案:</span>
                    <span className="text-xs sm:text-sm text-green-700">{question.correctAnswer.join('、')}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>最近错误于 {formatDate(question.lastWrongTime)}</span>
                  <button
                    onClick={() => {
                      const questionsToPractice: Question[] = [{
                        id: parseInt(question.id.split('_').pop() || '0'),
                        type: question.type,
                        question: question.question,
                        options: question.options,
                        correctAnswer: question.correctAnswer,
                        score: 0,
                        explanation: question.explanation,
                        knowledgePoints: question.knowledgePoints,
                        wrongInfo: {
                          wrongCount: question.wrongCount,
                          lastWrongTime: question.lastWrongTime,
                          previousUserAnswer: question.userAnswer
                        }
                      }];
                      sessionStorage.setItem('practiceQuestions', JSON.stringify(questionsToPractice));
                      sessionStorage.setItem('practiceMode', 'wrong');
                      navigate('/');
                    }}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    重新练习 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {filteredWrongQuestions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={startPractice}
              className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
            >
              🚀 开始练习 ({filteredWrongQuestions.length} 题)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
