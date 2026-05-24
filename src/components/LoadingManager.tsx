import { useState, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  message: string;
  error: string | null;
  timeout: boolean;
}

interface LoadingManagerProps {
  timeout?: number; // 超时时间（毫秒）
  onTimeout?: () => void;
  children: (state: LoadingState) => React.ReactNode;
}

export function LoadingManager({ 
  timeout = 15000, // 默认15秒超时
  onTimeout,
  children 
}: LoadingManagerProps) {
  const [state, setState] = useState<LoadingState>({
    isLoading: true,
    message: '正在加载...',
    error: null,
    timeout: false,
  });

  useEffect(() => {
    if (!state.isLoading) return;

    const timer = setTimeout(() => {
      setState(prev => ({
        ...prev,
        timeout: true,
        isLoading: false,
        error: '加载超时，请检查网络连接或刷新页面重试',
      }));
      
      if (onTimeout) {
        onTimeout();
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [state.isLoading, timeout, onTimeout]);

  return <>{children(state)}</>;
}

// 自动隐藏的提示组件
export function LoadingTips() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 z-50 max-w-md mx-auto shadow-lg">
      <div className="flex items-start gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mt-0.5"></div>
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-1">加载较慢？</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 请按 F12 打开开发者工具</li>
            <li>• 切换到 Console 标签查看详细错误</li>
            <li>• 切换到 Network 标签检查网络请求</li>
            <li>• 尝试刷新页面或清除浏览器缓存</li>
          </ul>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="text-blue-400 hover:text-blue-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
