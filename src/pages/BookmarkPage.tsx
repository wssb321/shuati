import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarks, removeBookmark, BookmarkItem } from '../utils/bookmarkManager';
import { parseQuestionFile, Question, shuffleArray } from '../utils/questionParser';
import { Empty } from '../components/Empty';

export function BookmarkPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [questionData, setQuestionData] = useState<{ [key: string]: Question[] }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<string>('all');
  const [availableQuizzes, setAvailableQuizzes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedBookmarks = getBookmarks();
      setBookmarks(savedBookmarks);

      const quizFiles = Array.from(new Set(savedBookmarks.map(b => b.quizFile)));
      setAvailableQuizzes(quizFiles);

      const data: { [key: string]: Question[] } = {};
      for (const quizFile of quizFiles) {
        try {
          const response = await fetch(`/shuati/tiku/${quizFile}`);
          if (response.ok) {
            const content = await response.text();
            const groups = parseQuestionFile(content);
            const questions = groups.flatMap(g => g.questions);
            data[quizFile] = questions;
          }
        } catch (err) {
          console.error(`Failed to load ${quizFile}:`, err);
        }
      }
      setQuestionData(data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = (questionId: number, quizFile: string) => {
    removeBookmark(questionId, quizFile);
    setBookmarks(prev => prev.filter(b => !(b.questionId === questionId && b.quizFile === quizFile)));
  };

  const getQuestionById = (questionId: number, quizFile: string): Question | null => {
    const questions = questionData[quizFile];
    if (!questions) return null;
    return questions.find(q => q.id === questionId) || null;
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
    const questions: Question[] = [];
    bookmarks.forEach(bookmark => {
      const question = getQuestionById(bookmark.questionId, bookmark.quizFile);
      if (question) {
        questions.push({ ...question });
      }
    });
    
    if (questions.length > 0) {
      sessionStorage.setItem('practiceQuestions', JSON.stringify(questions));
      sessionStorage.setItem('practiceMode', 'bookmark');
      navigate('/');
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (selectedQuiz !== 'all' && bookmark.quizFile !== selectedQuiz) return false;
    
    const question = getQuestionById(bookmark.questionId, bookmark.quizFile);
    if (!question) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        question.question.toLowerCase().includes(searchLower) ||
        question.id.toString().includes(searchTerm)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">⭐ 收藏夹</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {bookmarks.length}
              </span>
            </div>
          </div>

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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-24 sm:pt-28">
        {filteredBookmarks.length === 0 ? (
          <Empty type="no-bookmarks" />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredBookmarks.map((bookmark, idx) => {
              const question = getQuestionById(bookmark.questionId, bookmark.quizFile);
              if (!question) return null;
              
              return (
                <div key={`${bookmark.quizFile}-${bookmark.questionId}`} className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.type === 'single' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {question.type === 'single' ? '单选题' : '多选题'}
                      </span>
                      <span className="text-sm text-gray-500">第 {question.id} 题</span>
                      <span className="text-sm text-gray-400">
                        {bookmark.quizFile.replace('.txt', '')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.questionId, bookmark.quizFile)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="取消收藏"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-gray-800 mb-3 leading-relaxed text-sm sm:text-base">
                    {question.question.length > 80 ? `${question.question.substring(0, 80)}...` : question.question}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>收藏于 {formatDate(bookmark.timestamp)}</span>
                    <button
                      onClick={() => {
                        sessionStorage.setItem('selectedQuiz', bookmark.quizFile);
                        sessionStorage.setItem('selectedQuestionId', question.id.toString());
                        navigate('/');
                      }}
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      开始练习 →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {filteredBookmarks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={startPractice}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              🚀 开始练习 ({filteredBookmarks.length} 题)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
