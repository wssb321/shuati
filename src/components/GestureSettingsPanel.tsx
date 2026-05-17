import { useState } from 'react';
import { GestureSettings } from '../hooks/useGestureSettings';

interface GestureSettingsPanelProps {
  settings: GestureSettings;
  onUpdateSettings: (updates: Partial<GestureSettings>) => void;
  onClose?: () => void;
}

export function GestureSettingsPanel({ settings, onUpdateSettings, onClose }: GestureSettingsPanelProps) {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="手势设置"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
        <span className="text-sm text-gray-600 hidden sm:inline">手势</span>
      </button>

      {showPanel && (
        <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">手势设置</h3>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">启用手势</p>
                <p className="text-xs text-gray-500 mt-0.5">左右滑动切换题目</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {settings.enabled && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">灵敏度</p>
                  <span className="text-xs text-gray-500">{settings.sensitivity}px</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="5"
                  value={settings.sensitivity}
                  onChange={(e) => onUpdateSettings({ sensitivity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>灵敏</span>
                  <span>适中</span>
                  <span>迟钝</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>操作提示：</strong><br />
                  • 向左滑动：切换下一题<br />
                  • 向右滑动：切换上一题<br />
                  • 上下滑动：浏览题号列表
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
