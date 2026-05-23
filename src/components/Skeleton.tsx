import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | false;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
}) => {
  const baseStyle: React.CSSProperties = {
    width,
    height,
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'shimmer':
        return 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-[#e5e7eb] before:to-transparent';
      case false:
      default:
        return '';
    }
  };

  return (
    <div
      className={`bg-[#f3f4f6] ${getVariantClass()} ${getAnimationClass()} ${className}`}
      style={baseStyle}
    />
  );
};

interface QuestionCardSkeletonProps {
  count?: number;
}

export const QuestionCardSkeleton: React.FC<QuestionCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          {/* Question title skeleton */}
          <Skeleton variant="text" height={24} className="w-3/4" />
          <Skeleton variant="text" height={24} className="w-1/2" />
          
          {/* Options skeleton */}
          <div className="space-y-3 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" height={20} className="flex-1" />
              </div>
            ))}
          </div>
          
          {/* Footer skeleton */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <Skeleton variant="text" height={18} className="w-1/4" />
            <Skeleton variant="rounded" height={36} width={100} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const QuizPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header skeleton */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto pl-2 pr-3 sm:pl-2 sm:pr-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Skeleton variant="text" height={32} className="w-1/3" />
            <div className="flex items-center gap-2">
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress panel skeleton */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
            <Skeleton variant="text" height={20} className="w-1/2 mb-3" />
            <div className="flex gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="circular" width={28} height={28} />
              ))}
            </div>
          </div>

          {/* Question card skeleton */}
          <QuestionCardSkeleton />
        </div>
      </main>
    </div>
  );
};

export default Skeleton;
