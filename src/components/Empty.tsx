import React from 'react';

export type EmptyStateType = 'no-data' | 'no-network' | 'load-error' | 'no-bookmarks' | 'no-wrong-questions';

interface EmptyProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Empty: React.FC<EmptyProps> = ({ 
  type = 'no-data',
  title,
  description,
  action
}) => {
  const getStateConfig = () => {
    switch (type) {
      case 'no-network':
        return {
          icon: (
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8l6 6m0 0l6-6m-6 6v-9" />
              </svg>
            </div>
          ),
          defaultTitle: '网络开小差了',
          defaultDescription: '请检查您的网络连接',
          defaultAction: { label: '重试', onClick: () => window.location.reload() }
        };
      case 'load-error':
        return {
          icon: (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ),
          defaultTitle: '加载失败',
          defaultDescription: '数据加载出现问题，请稍后再试',
          defaultAction: { label: '重试', onClick: () => window.location.reload() }
        };
      case 'no-bookmarks':
        return {
          icon: (
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          ),
          defaultTitle: '暂无收藏',
          defaultDescription: '收藏的题目会显示在这里',
          defaultAction: undefined
        };
      case 'no-wrong-questions':
        return {
          icon: (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ),
          defaultTitle: '错题本是空的',
          defaultDescription: '答错的题目会自动收录在这里',
          defaultAction: undefined
        };
      case 'no-data':
      default:
        return {
          icon: (
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          ),
          defaultTitle: '暂无数据',
          defaultDescription: '',
          defaultAction: undefined
        };
    }
  };

  const config = getStateConfig();
  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;
  const displayAction = action || config.defaultAction;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fadeIn">
      {config.icon}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>
      {displayDescription && (
        <p className="text-gray-600 text-center mb-6 max-w-xs">
          {displayDescription}
        </p>
      )}
      {displayAction && (
        <button
          onClick={displayAction.onClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors btn-ripple"
        >
          {displayAction.label}
        </button>
      )}
    </div>
  );
};

export default Empty;
