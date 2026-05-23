import React from 'react';

// ==================== Button 按钮组件 ====================
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  disabled = false,
}) => {
  const baseClasses = 'font-medium transition-fast active:scale-[0.98] btn-ripple';
  
  const variantClasses = {
    primary: 'bg-[#3b82f6] text-white hover:bg-[#2563eb]',
    secondary: 'bg-gray-100 text-[#1f2937] hover:bg-gray-200',
    success: 'bg-[#22c55e] text-white hover:bg-[#16a34a]',
    danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 rounded-btn-sm text-sm',
    md: 'px-4 py-2.5 rounded-card text-sm',
    lg: 'px-6 py-4 rounded-card text-base',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// ==================== Card 卡片组件 ====================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
}) => {
  const baseClasses = 'bg-white rounded-card p-4 sm:p-5 shadow-card';
  const hoverClasses = hoverable 
    ? 'transition-fast hover:shadow-hover hover:-translate-y-0.5' 
    : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

// ==================== Input 输入框组件 ====================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-2.5 bg-white border-2 border-[#e5e7eb] rounded-card text-[#1f2937] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-fast';
  
  return (
    <input
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

// ==================== Tag 标签组件 ====================
interface TagProps {
  variant?: 'primary' | 'success' | 'danger' | 'default' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-[#3b82f6] text-white',
    success: 'bg-[#22c55e] text-white',
    danger: 'bg-[#ef4444] text-white',
    purple: 'bg-[#8b5cf6] text-white',
    default: 'bg-gray-100 text-gray-700',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-tag font-bold shadow-card ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ==================== Select 选择组件 ====================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  className = '',
  ...props
}) => {
  const baseClasses = 'px-4 py-2.5 bg-[#3b82f6] bg-opacity-10 border-2 border-[#3b82f6] border-opacity-30 text-[#3b82f6] rounded-card focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-fast font-medium';
  
  return (
    <select
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

// ==================== Badge 角标组件 ====================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-[#3b82f6] text-white',
    success: 'bg-[#22c55e] text-white',
    danger: 'bg-[#ef4444] text-white',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-sm font-bold shadow-card ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ==================== AnswerBox 答案展示组件 ====================
interface AnswerBoxProps {
  type: 'wrong' | 'correct';
  label: string;
  answer: string[];
  className?: string;
}

export const AnswerBox: React.FC<AnswerBoxProps> = ({
  type,
  label,
  answer,
  className = '',
}) => {
  const isWrong = type === 'wrong';
  const bgColor = isWrong ? 'bg-red-100' : 'bg-green-100';
  const textColor = isWrong ? 'text-[#ef4444]' : 'text-[#22c55e]';
  const icon = isWrong ? '❌' : '✅';
  
  return (
    <div className="flex items-center gap-2">
      <span className={`text-tag font-bold ${textColor} ${bgColor} px-2 py-1 rounded-btn-sm`}>
        {icon} {label}
      </span>
      <span className={`text-option font-medium ${textColor} ${className}`}>
        {answer.join('、')}
      </span>
    </div>
  );
};

// ==================== IconButton 图标按钮组件 ====================
interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  title?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  className = '',
  title,
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 text-[#9ca3af] hover:text-[#1f2937] hover:bg-gray-100 rounded-card transition-fast hover:scale-110 active:scale-[0.98] ${className}`}
    >
      {icon}
    </button>
  );
};

// ==================== Section 分组组件 ====================
interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {title && <h3 className="text-lg font-bold text-[#1f2937]">{title}</h3>}
      {children}
    </div>
  );
};

// ==================== Container 容器组件 ====================
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`max-w-6xl mx-auto px-3 sm:px-4 ${className}`}>
      {children}
    </div>
  );
};

// ==================== ProgressBar 进度条组件 ====================
interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full bg-[#3b82f6] rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// ==================== Toast 提示组件（简化版） ====================
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  className = '',
}) => {
  const bgColor = {
    success: 'bg-[#22c55e]',
    error: 'bg-[#ef4444]',
    info: 'bg-[#3b82f6]',
  };
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor[type]} text-white px-6 py-3 rounded-card shadow-hover animate-fadeIn z-50 ${className}`}>
      {message}
    </div>
  );
};
