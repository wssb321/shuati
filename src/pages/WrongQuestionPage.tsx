import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWrongQuestions, removeWrongQuestion, WrongQuestion } from '../utils/wrongQuestionManager';
import { Question } from '../utils/questionParser';
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
      minute: '2-digit',
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
        previousUserAnswer: wq.userAnswer,
      },
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
        question.id.includes(searchLower)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50 pb-36">
      {/* 顶部导航 */}
      <header className="glass-card border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-card hover:bg-gray-100 transition-fast active:scale-[0.98]"
              >
                <svg className="w-6 h-6 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                📋 错题库
              </h1>
              <span className="px-2.5 py-1 bg-[#ef4444] text-white rounded-full text-sm font-bold shadow-card">
                {wrongQuestions.length}
              </span>
            </div>
          </div>

          {/* 搜索/筛选区 */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索题目..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200/50 rounded-xl text-gray-800 placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-fast"
                />
              </div>
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-card focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-fast font-medium"
              >
                <option value="all">📚 全部题库</option>
                {availableQuizzes.map((quiz, idx) => (
                  <option key={idx} value={quiz}>{quiz.replace('.txt', '')}</option>
                ))}
              </select>
            </div>
            
            {/* 排序切换 */}
            <div className="flex bg-gray-100 rounded-card p-1.5">
              <button
                onClick={() => setSortType('time')}
                className={`flex-1 px-4 py-2.5 rounded-btn-sm text-sm font-bold transition-fast ${
                  sortType === 'time' 
                    ? 'bg-white shadow-card text-indigo-600 scale-[1.02]' 
                    : 'text-[#6b7280] hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                ⏰ 按时间排序
              </button>
              <button
                onClick={() => setSortType('wrongCount')}
                className={`flex-1 px-4 py-2.5 rounded-btn-sm text-sm font-bold transition-fast ${
                  sortType === 'wrongCount' 
                    ? 'bg-white shadow-card text-[#ef4444] scale-[1.02]' 
                    : 'text-[#6b7280] hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                📊 按错误次数
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 错题列表 */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-24 sm:pt-28">
        {filteredWrongQuestions.length === 0 ? (
          <Empty type="no-wrong-questions" />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredWrongQuestions.map((question, index) => (
              <div
                key={question.id}
                className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 hover:shadow-md p-4 sm:p-5 border-l-4 border-red-400 hover:border-red-500 transition-fast hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-3">
                  {/* 标签 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-card ${
                      question.type === 'single' 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-violet-500 text-white'
                    }`}>
                      {question.type === 'single' ? '单选题' : '多选题'}
                    </span>
                    <span className="px-3 py-1 bg-[#ef4444] text-white rounded-full text-xs font-bold shadow-card">
                      错误 {question.wrongCount} 次
                    </span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                      {question.sourceQuiz.replace('.txt', '')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveWrongQuestion(question.id)}
                    className="p-2 text-[#9ca3af] hover:text-[#ef4444] hover:bg-red-50 rounded-card transition-fast hover:scale-110"
                    title="移除错题"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {/* 题目内容 */}
                <p className="text-question text-gray-800 mb-4">
                  {question.question.length > 150 ? `${question.question.substring(0, 150)}...` : question.question}
                </p>
                
                {/* 答案对比 */}
                <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-card border border-[#e5e7eb]">
                  <div className="flex items-center gap-2">
                    <span className="text-tag font-bold text-[#ef4444] bg-red-100 px-2 py-1 rounded-btn-sm">
                      ❌ 上次答案
                    </span>
                    <span className="text-option text-[#ef4444] font-medium">{question.userAnswer.join('、')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-tag font-bold text-[#22c55e] bg-green-100 px-2 py-1 rounded-btn-sm">
                      ✅ 正确答案
                    </span>
                    <span className="text-option text-[#22c55e] font-medium">{question.correctAnswer.join('、')}</span>
                  </div>
                </div>
                
                {/* 底部信息 */}
                <div className="flex items-center justify-between text-tag text-[#6b7280]">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    最近错误于 {formatDate(question.lastWrongTime)}
                  </span>
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
                          previousUserAnswer: question.userAnswer,
                        },
                      }];
                      sessionStorage.setItem('practiceQuestions', JSON.stringify(questionsToPractice));
                      sessionStorage.setItem('practiceMode', 'wrong');
                      navigate('/');
                    }}
                    className="inline-flex items-center gap-1 px-4 py-2 gradient-primary text-white rounded-xl hover:opacity-90 font-bold shadow-card hover:shadow-hover transition-fast hover:scale-105 active:scale-[0.98] btn-ripple"
                  >
                    🎯 重新练习 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 底部操作栏 */}
      {filteredWrongQuestions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/30 p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={startPractice}
              className="w-full py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold shadow-hover transition-all duration-100 ease-out hover:scale-[1.02] active:scale-[0.98] btn-ripple"
            >
              🚀 开始练习 ({filteredWrongQuestions.length} 题)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
