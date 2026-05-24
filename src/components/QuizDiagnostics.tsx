import { useState, useEffect } from 'react';
import { diagnoseQuizFiles } from '../utils/quizDiagnostics';

interface DiagnosisResult {
  file: string;
  status: 'success' | 'error';
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

export function QuizDiagnostics() {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const runDiagnosis = async () => {
    setIsDiagnosing(true);
    console.log('🔍 开始诊断题库文件...');
    
    try {
      const diagnosisResults = await diagnoseQuizFiles();
      setResults(diagnosisResults);
    } catch (error) {
      console.error('诊断失败:', error);
    } finally {
      setIsDiagnosing(false);
    }
  };

  useEffect(() => {
    // 页面加载时自动运行诊断
    const timer = setTimeout(() => {
      runDiagnosis();
    }, 2000); // 延迟2秒，确保页面加载完成
    
    return () => clearTimeout(timer);
  }, []);

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalCount = results.length;

  if (totalCount === 0 && !isDiagnosing) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-md">
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-12'}`}>
        <div 
          className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <span className="font-medium">题库诊断</span>
          </div>
          <div className="flex items-center gap-3">
            {isDiagnosing ? (
              <span className="text-sm">诊断中...</span>
            ) : (
              <span className="text-sm bg-white/20 px-2 py-1 rounded">
                {successCount}/{totalCount}
              </span>
            )}
            <button className="hover:bg-white/20 p-1 rounded transition-colors">
              {isExpanded ? '▼' : '▲'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 max-h-80 overflow-y-auto">
            {isDiagnosing ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">正在检查题库文件...</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">检查结果</span>
                    <span className="font-medium">
                      <span className="text-green-600">{successCount} 成功</span>
                      {errorCount > 0 && (
                        <span className="text-red-600 ml-2">{errorCount} 失败</span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalCount > 0 ? (successCount / totalCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded-lg flex items-center justify-between ${
                        result.status === 'success' 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={result.status === 'success' ? 'text-green-500' : 'text-red-500'}>
                          {result.status === 'success' ? '✅' : '❌'}
                        </span>
                        <span className="text-sm text-gray-700">{result.file}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.status === 'success' ? (
                          <span>{result.responseTime}ms</span>
                        ) : (
                          <span className="text-red-600">{result.error || `HTTP ${result.statusCode}`}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {errorCount > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ 有 {errorCount} 个题库文件无法访问。请检查：
                    </p>
                    <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
                      <li>文件是否已上传到服务器的 /tiku/ 目录</li>
                      <li>文件名是否完全匹配（包括大小写）</li>
                      <li>服务器是否正确配置了静态文件服务</li>
                    </ul>
                  </div>
                )}

                <button
                  onClick={runDiagnosis}
                  className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  重新诊断
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
