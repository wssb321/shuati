import { AnswerMode } from '../hooks/useAnswerModeSettings';

interface ModeSelectionModalProps {
  isOpen: boolean;
  currentMode: AnswerMode;
  onSelect: (mode: AnswerMode) => void;
  onClose: () => void;
}

export function ModeSelectionModal({
  isOpen,
  currentMode,
  onSelect,
  onClose,
}: ModeSelectionModalProps) {
  if (!isOpen) return null;
  
  const handleVibrate = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch (e) {
        console.log('Vibration not supported');
      }
    }
  };
  
  const handleSelect = (mode: AnswerMode) => {
    handleVibrate();
    onSelect(mode);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-6 animate-slideInUp">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden" />
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📚 选择答题模式
          </h2>
          <p className="text-gray-600">
            选择适合你的刷题方式，可随时在设置中切换
          </p>
        </div>
        
        <div className="space-y-4">
          {/* 经典模式 */}
          <button
            onClick={() => handleSelect('classic')}
            className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
              currentMode === 'classic' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-300">
                <div className="w-12 h-16 bg-white rounded-lg shadow-sm p-1">
                  <div className="h-1 bg-blue-500 rounded-full mb-1" />
                  <div className="h-1 bg-gray-300 rounded-full mb-1" />
                  <div className="h-1 bg-gray-300 rounded-full mb-3" />
                  <div className="flex gap-1">
                    <div className="flex-1 h-2 bg-gray-300 rounded-full" />
                    <div className="flex-1 h-2 bg-gray-300 rounded-full" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  📋 经典模式
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  传统列表式布局，题目导航清晰，适合系统学习和回顾
                </p>
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  <li>✓ 完整题号列表</li>
                  <li>✓ 底部导航按钮</li>
                  <li>✓ 适合桌面和大屏</li>
                </ul>
              </div>
            </div>
          </button>
          
          {/* 卡片模式 */}
          <button
            onClick={() => handleSelect('card')}
            className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
              currentMode === 'card' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-200">
                <div className="w-10 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center">
                  <div className="text-2xl">📱</div>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  📱 卡片模式
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  抖音式滑动切题，全屏沉浸式体验，适合移动端快速刷题
                </p>
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  <li>✓ 左右滑动切换</li>
                  <li>✓ 全屏卡片展示</li>
                  <li>✓ 进度圆点导航</li>
                  <li>✓ 仅在移动端启用</li>
                </ul>
              </div>
            </div>
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          稍后再说
        </button>
      </div>
      
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
