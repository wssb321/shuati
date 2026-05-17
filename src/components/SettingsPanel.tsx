import { useState } from 'react';
import { GestureSettings } from '../hooks/useGestureSettings';
import { AnswerMode } from '../hooks/useAnswerModeSettings';
import { clearAllProgress, getIncompleteProgressList } from '../utils/progressManager';

interface SettingsPanelProps {
  gestureSettings: GestureSettings;
  onUpdateGestureSettings: (updates: Partial<GestureSettings>) => void;
  answerMode: AnswerMode;
  onChangeAnswerMode: (mode: AnswerMode) => void;
  onOpenModeModal: () => void;
  onClose?: () => void;
}

export function SettingsPanel({
  gestureSettings,
  onUpdateGestureSettings,
  answerMode,
  onChangeAnswerMode,
  onOpenModeModal,
  onClose,
}: SettingsPanelProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleVibrate = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch (e) {
        console.log('Vibration not supported');
      }
    }
  };

  const handleClearProgress = () => {
    if (confirm('确定要清除所有答题进度吗？此操作不可恢复。')) {
      clearAllProgress();
      alert('答题进度已清除！');
      setShowClearConfirm(false);
    }
  };

  const incompleteProgressCount = getIncompleteProgressList().length;

  return (
    <div className="relative">
      <button
        onClick={() => {
          handleVibrate();
          setShowPanel(!showPanel);
        }}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="设置"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm text-gray-600 hidden sm:inline">设置</span>
      </button>

      {showPanel && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 animate-fadeIn max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">设置</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* 答题模式 */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">答题模式</h4>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleVibrate();
                    onChangeAnswerMode('classic');
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    answerMode === 'classic' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">📋</div>
                    <div>
                      <p className="font-medium text-gray-800">经典模式</p>
                      <p className="text-xs text-gray-500">列表式布局，适合系统学习</p>
                    </div>
                    {answerMode === 'classic' && (
                      <div className="ml-auto">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    handleVibrate();
                    onChangeAnswerMode('card');
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    answerMode === 'card' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">📱</div>
                    <div>
                      <p className="font-medium text-gray-800">卡片模式</p>
                      <p className="text-xs text-gray-500">抖音式滑动，适合移动端</p>
                    </div>
                    {answerMode === 'card' && (
                      <div className="ml-auto">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => {
                  handleVibrate();
                  onOpenModeModal();
                  setShowPanel(false);
                }}
                className="w-full py-2 text-blue-500 text-sm hover:text-blue-600 transition-colors"
              >
                查看模式介绍
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">手势设置</h4>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">启用手势</p>
                  <p className="text-xs text-gray-500">滑动切换题目</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gestureSettings.enabled}
                    onChange={(e) => {
                      handleVibrate();
                      onUpdateGestureSettings({ enabled: e.target.checked });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              {gestureSettings.enabled && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">灵敏度</p>
                    <span className="text-xs text-gray-500">{gestureSettings.sensitivity}px</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={gestureSettings.sensitivity}
                    onChange={(e) => onUpdateGestureSettings({ sensitivity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>灵敏</span>
                    <span>适中</span>
                    <span>迟钝</span>
                  </div>
                </div>
              )}

              <div className="mt-4 bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>操作提示：</strong><br />
                  • 向左滑动：切换下一题<br />
                  • 向右滑动：切换上一题
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">数据管理</h4>
              
              <div className="bg-amber-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-amber-800">
                  <strong>答题进度：</strong>
                  {incompleteProgressCount > 0 ? (
                    <span>有 {incompleteProgressCount} 份未完成的答题记录</span>
                  ) : (
                    <span>暂无未完成的答题记录</span>
                  )}
                </p>
              </div>

              <button
                onClick={() => {
                  handleVibrate();
                  setShowClearConfirm(true);
                }}
                className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium text-sm transition-colors"
              >
                🗑️ 清除所有答题进度
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-2">
                已完成答卷保留7天，未完成保留30天
              </p>
            </div>
          </div>

          {showClearConfirm && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
              <div className="bg-white rounded-xl p-4 mx-2 max-w-xs w-full">
                <h4 className="text-base font-semibold text-gray-800 mb-2">确认清除</h4>
                <p className="text-sm text-gray-600 mb-4">
                  确定要清除所有答题进度吗？此操作将删除所有未完成的答题记录，且不可恢复。
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleVibrate();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleClearProgress}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm transition-colors"
                  >
                    确认清除
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}