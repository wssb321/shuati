import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Question } from '../utils/questionParser';
import { AnswerRecord, getQuizProgress, QuizProgress } from '../utils/progressManager';
import { saveWrongQuestion, clearWrongQuestions, getWrongQuestions } from '../utils/wrongQuestionManager';

interface ChapterAccuracy {
  chapter: string;
  total: number;
  correct: number;
  accuracy: number;
}

export const ExamResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [wrongQuestions, setWrongQuestions] = useState<{ question: Question; record: AnswerRecord }[]>([]);
  const [chapterAccuracies, setChapterAccuracies] = useState<ChapterAccuracy[]>([]);

  useEffect(() => {
    if (!quizId) return;
    const data = getQuizProgress(quizId);
    if (data) {
      setProgress(data);
      
      // 整理错题
      const wrongs: { question: Question; record: AnswerRecord }[] = [];
      data.answerRecords.forEach(record => {
        if (!record.isCorrect) {
          wrongs.push({
            question: data.questions[record.questionIndex],
            record
          });
        }
      });
      setWrongQuestions(wrongs);
      
      // 按章节统计正确率
      const chapterMap = new Map<string, { total: number; correct: number }>();
      data.answerRecords.forEach(record => {
        const question = data.questions[record.questionIndex];
        const chapter = question.chapter || '未知章节';
        const current = chapterMap.get(chapter) || { total: 0, correct: 0 };
        chapterMap.set(chapter, {
          total: current.total + 1,
          correct: current.correct + (record.isCorrect ? 1 : 0)
        });
      });
      
      const accuracies: ChapterAccuracy[] = [];
      chapterMap.forEach((value, chapter) => {
        accuracies.push({
          chapter,
          total: value.total,
          correct: value.correct,
          accuracy: value.total > 0 ? (value.correct / value.total) * 100 : 0
        });
      });
      setChapterAccuracies(accuracies.sort((a, b) => b.accuracy - a.accuracy));
    }
  }, [quizId]);

  if (!progress) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center px-4">
        <div className="text-center w-full max-w-sm animate-fadeIn">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😵</span>
          </div>
          <p className="text-gray-600 text-base font-medium mb-2">找不到考试记录</p>
          <p className="text-gray-400 text-sm mb-6">请返回首页重新开始</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#3b82f6] text-white rounded-xl hover:bg-[#2563eb] text-base font-medium transition-all duration-100 ease-out active:scale-[0.98]"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = progress.questions.length;
  const correctCount = progress.answerRecords.filter(r => r.isCorrect).length;
  const wrongCount = totalQuestions - correctCount;
  const totalScore = progress.questions.reduce((sum, q) => sum + q.score, 0);
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const duration = Math.floor((progress.lastUpdateTime - progress.startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  // 确定分数颜色和等级
  let scoreColor = '#ef4444'; // 红色 - 不及格
  let grade = '不及格';
  let gradeColor = '#ef4444';
  
  if (progress.score >= 90) {
    scoreColor = '#22c55e'; // 绿色 - 优秀
    grade = '优秀';
    gradeColor = '#22c55e';
  } else if (progress.score >= 80) {
    scoreColor = '#22c55e';
    grade = '良好';
    gradeColor = '#22c55e';
  } else if (progress.score >= 60) {
    scoreColor = '#3b82f6'; // 蓝色 - 及格
    grade = '及格';
    gradeColor = '#3b82f6';
  }

  // 计算环形进度条
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  const handleRetake = () => {
    navigate('/');
  };

  const handleShare = async () => {
    // 简单的分享功能 - 可以后续扩展为生成图片
    const text = `我在 Steam刷题管家考了 ${progress.score} 分！正确率 ${accuracy.toFixed(1)}%`;
    try {
      await navigator.clipboard.writeText(text);
      alert('分享内容已复制到剪贴板！');
    } catch {
      alert('分享失败，请手动复制');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20">
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* 成绩总览区 */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] p-6 mb-6">
          <div className="text-center mb-6">
            <div style={{ fontSize: '72px', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
              {progress.score}
              <span style={{ fontSize: '24px', fontWeight: 500 }}>分</span>
            </div>
            <div 
              style={{ 
                display: 'inline-block', 
                marginTop: '12px', 
                padding: '4px 16px', 
                backgroundColor: gradeColor.replace(')', ', 0.1)').replace('rgb', 'rgba'),
                color: gradeColor,
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {grade}
            </div>
          </div>

          {/* 环形进度图 */}
          <div className="flex justify-center mb-6">
            <div className="relative" style={{ width: '160px', height: '160px' }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
                />
              </svg>
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  color: scoreColor 
                }}
              >
                {accuracy.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#1f2937]">{totalQuestions}</div>
              <div className="text-sm text-[#6b7280]">总题数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#22c55e]">{correctCount}</div>
              <div className="text-sm text-[#6b7280]">正确</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#ef4444]">{wrongCount}</div>
              <div className="text-sm text-[#6b7280]">错误</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#3b82f6]">{`${minutes}:${seconds.toString().padStart(2, '0')}`}</div>
              <div className="text-sm text-[#6b7280]">用时</div>
            </div>
          </div>
        </div>

        {/* 章节掌握情况 */}
        {chapterAccuracies.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] p-6 mb-6">
            <h3 className="text-lg font-bold text-[#1f2937] mb-4">章节掌握情况</h3>
            <div className="space-y-4">
              {chapterAccuracies.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[#1f2937]">{item.chapter}</span>
                    <span className={`text-sm font-bold ${item.accuracy < 60 ? 'text-[#ef4444]' : item.accuracy >= 90 ? 'text-[#22c55e]' : 'text-[#3b82f6]'}`}>
                      {item.accuracy.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${item.accuracy < 60 ? 'bg-[#ef4444]' : item.accuracy >= 90 ? 'bg-[#22c55e]' : 'bg-[#3b82f6]'}`}
                      style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-[#6b7280] mt-1">{item.correct}/{item.total} 题正确</div>
                  {item.accuracy < 60 && (
                    <div className="text-xs text-[#ef4444] mt-1">⚠️ 建议重点复习</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 本次错题 */}
        {wrongQuestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1f2937]">本次错题 ({wrongQuestions.length} 题)</h3>
              <button 
                onClick={() => navigate('/wrong-questions')}
                className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
              >
                查看全部错题 →
              </button>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-2 px-2">
              {wrongQuestions.map(({ question, record }, idx) => (
                <div 
                  key={idx}
                  className="flex-shrink-0 w-64 bg-gray-50 rounded-xl p-4 border border-gray-200 cursor-pointer hover:border-[#3b82f6] transition-colors"
                  onClick={() => navigate('/wrong-questions')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">
                      第 {record.questionIndex + 1} 题
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                      {question.type === 'single' ? '单选' : '多选'}
                    </span>
                  </div>
                  <div className="text-sm text-[#1f2937] line-clamp-2 mb-2">
                    {question.text}
                  </div>
                  {question.chapter && (
                    <div className="text-xs text-[#6b7280]">
                      📚 {question.chapter}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮区 */}
        <div className="space-y-3">
          <button
            onClick={handleRetake}
            className="w-full py-4 bg-[#3b82f6] text-white rounded-xl hover:bg-[#2563eb] text-lg font-medium transition-all duration-100 ease-out active:scale-[0.98]"
          >
            再考一次
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              className="py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-base font-medium transition-all duration-100 ease-out active:scale-[0.98]"
            >
              分享成绩
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-base font-medium transition-all duration-100 ease-out active:scale-[0.98]"
            >
              返回首页
            </button>
          </div>
        </div>

        {/* 历史记录入口 */}
        <div className="text-center mt-8">
          <button className="text-sm text-[#6b7280] hover:text-[#3b82f6]">
            查看历史成绩趋势 →
          </button>
        </div>
      </div>
    </div>
  );
};
