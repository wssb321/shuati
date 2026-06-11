import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithTimeout } from '../utils/networkUtils';
import { verifyAllQuizFiles } from '../utils/quizLoader';
import { QUIZ_FILES } from '../utils/quizConfig';

interface DiagnosticResults {
  exists: string[];
  missing: string[];
}

interface DiagnosticStatus {
  checking: boolean;
  step: string;
  results: DiagnosticResults;
  progress: number;
  total: number;
  network: string;
  errors: string[];
}

export function DiagnosticsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<DiagnosticStatus>({
    checking: true,
    step: '检查中...',
    results: { exists: [], missing: [] },
    progress: 0,
    total: 16,
    network: '检查中...',
    errors: [],
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    try {
      setStatus(s => ({ ...s, step: '检查网络连接...', network: '检查中' }));
      
      // 1. 检查网络
      const online = navigator.onLine;
      setStatus(s => ({ 
        ...s, 
        network: online ? '✅ 在线' : '❌ 离线',
        errors: online ? [] : [...s.errors, '网络连接失败']
      }));

      if (!online) {
        setStatus(s => ({ ...s, checking: false, step: '网络检查完成' }));
        return;
      }

      setStatus(s => ({ ...s, step: '检查题库文件...' }));
      
      // 2. 检查题库文件
      const quizFiles = [...QUIZ_FILES];
      
      const results = await verifyAllQuizFiles(quizFiles, (current, total) => {
        setStatus(s => ({ 
          ...s, 
          progress: (current / total) * 100,
          step: `检查题库文件... (${current}/${total})`
        }));
      });
      
      setStatus(s => ({ 
        ...s, 
        checking: false, 
        step: '诊断完成',
        results: results,
        errors: [
          ...(results.missing.length > 0 
            ? [`❌ 缺失 ${results.missing.length} 个题库文件: ${results.missing.join(', ')}`] 
            : []),
        ]
      }));

    } catch (error) {
      setStatus(s => ({ 
        ...s, 
        checking: false, 
        step: '诊断出错',
        errors: [`❌ 诊断过程出错: ${error instanceof Error ? error.message : '未知错误'}`]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🔍 题库诊断工具</h1>
          <p className="text-gray-600">自动检测题库文件访问状态和网络连接</p>
        </div>

        {/* 状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌐</span>
              <h3 className="font-semibold text-gray-800">网络状态</h3>
            </div>
            <p className={`text-lg font-medium ${
              status.network.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}>
              {status.network}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📁</span>
              <h3 className="font-semibold text-gray-800">题库文件</h3>
            </div>
            <p className="text-lg font-medium text-gray-700">
              {status.checking ? (
                <span className="text-blue-600">检查中...</span>
              ) : (
                `${status.results.exists.length}/${status.total}`
              )}
            </p>
            {status.checking && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-semibold text-gray-800">问题数量</h3>
            </div>
            <p className={`text-lg font-medium ${
              status.errors.length > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {status.errors.length === 0 ? '无问题' : `${status.errors.length} 个问题`}
            </p>
          </div>
        </div>

        {/* 当前步骤 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            {status.checking ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            ) : (
              <span className="text-2xl">📋</span>
            )}
            <span className="text-blue-900 font-medium">{status.step}</span>
          </div>
        </div>

        {/* 错误列表 */}
        {status.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <span>❌</span>
              发现的问题
            </h3>
            <ul className="space-y-2">
              {status.errors.map((error, index) => (
                <li key={index} className="text-red-800 text-sm">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 题库文件列表 */}
        {!status.checking && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">📋 题库文件状态</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ...status.results.exists.map(file => (
                  <div key={file} className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <span className="text-green-600">✅</span>
                    <p className="text-sm text-green-800 mt-1">{file}</p>
                  </div>
                )),
                ...status.results.missing.map(file => (
                  <div key={file} className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <span className="text-red-600">❌</span>
                    <p className="text-sm text-red-800 mt-1">{file}</p>
                  </div>
                ))
              ]}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={runDiagnostics}
            disabled={status.checking}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {status.checking ? '诊断中...' : '重新诊断'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            返回首页
          </button>
        </div>

        {/* 帮助信息 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 如果发现问题</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>1. 检查服务器上是否正确上传了 /tiku/ 目录</li>
            <li>2. 确认文件名完全匹配（包括扩展名 .txt）</li>
            <li>3. 检查服务器配置是否允许访问 .txt 文件</li>
            <li>4. 如果使用 GitHub Pages，检查 Actions 日志</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
