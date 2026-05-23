# Steam刷题管家 - 设计系统

## 项目概述

面向计算机课程（小程序开发等）的在线刷题平台，包含模拟考试、错题复习、即时练习等场景。

## 设计原则

### 🎯 清晰
信息层级明确，用户 3 秒内定位当前位置和下一步操作

### ⚡ 高效
减少不必要的点击和页面跳转，核心操作一键直达

### 💬 反馈
每个操作都有即时、明确的视觉反馈

### 😊 舒适
充足的留白、合适的字号、柔和的配色，长时间刷题不疲劳

---

## 色彩规范

### 主色调
| 用途 | 颜色 | HEX |
|------|------|-----|
| 主色 | 蓝色 | `#3b82f6` |
| 成功 | 绿色 | `#22c55e` |
| 错误 | 红色 | `#ef4444` |

### 背景色
| 用途 | 颜色 | HEX |
|------|------|-----|
| 页面底色 | 浅灰 | `#f1f5f9` |
| 卡片背景 | 白色 | `#ffffff` |

### 文字色
| 用途 | 颜色 | HEX |
|------|------|-----|
| 主文字 | 深灰 | `#1f2937` |
| 次要文字 | 中灰 | `#6b7280` |
| 禁用/提示 | 浅灰 | `#9ca3af` |

### 边框色
| 用途 | 颜色 | HEX |
|------|------|-----|
| 默认边框 | 浅灰 | `#e5e7eb` |
| 选中/聚焦 | 蓝色 | `#3b82f6` |

---

## 字体规范

### 字号与行高
| 元素 | 字号 | 行高 | 字重 |
|------|------|------|------|
| 题目文字 | 16-18px | 1.6 | 400 |
| 选项文字 | 15px | 1.5 | 400 |
| 标签/辅助文字 | 13px | 1.4 | 500 |

### 代码/API 高亮
- 字体：等宽字体（Menlo / Monaco）
- 字号：13px
- 背景：`#f3f4f6`
- 圆角：4px
- 内边距：2px 4px

---

## 圆角与阴影

### 圆角
| 元素 | 圆角值 |
|------|--------|
| 卡片 | 12px |
| 小按钮 | 8px |
| 大按钮 | 12px |

### 阴影
| 状态 | 阴影值 |
|------|--------|
| 卡片阴影 | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` |
| 悬浮阴影 | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` |

---

## 动画规范

| 类型 | 时长 | 缓动函数 |
|------|------|----------|
| 微交互（按钮点击、状态切换） | 100ms | `ease-out` |
| 展开/折叠 | 200ms | `ease-in-out` |
| 面板滑入 | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 页面转场 | 250ms | `ease-in-out` |

---

## 组件库

### Button 按钮

```tsx
import React from 'react';

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
  const baseClasses = 'font-medium transition-all duration-100 ease-out active:scale-[0.98]';
  
  const variantClasses = {
    primary: 'bg-[#3b82f6] text-white hover:bg-[#2563eb]',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-[#22c55e] text-white hover:bg-[#16a34a]',
    danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 rounded-lg text-sm',
    md: 'px-4 py-2.5 rounded-xl text-sm',
    lg: 'px-6 py-4 rounded-xl text-base',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
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
```

### Card 卡片

```tsx
import React from 'react';

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
  const baseClasses = 'bg-white rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]';
  const hoverClasses = hoverable ? 'transition-all duration-100 ease-out hover:shadow-[0_4px_6px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};
```

### Input 输入框

```tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-2.5 bg-white border-2 border-[#e5e7eb] rounded-xl text-[#1f2937] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-100 ease-out';
  
  return (
    <input
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};
```

### Tag 标签

```tsx
import React from 'react';

interface TagProps {
  variant?: 'primary' | 'success' | 'danger' | 'default';
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
    default: 'bg-gray-100 text-gray-700',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
```

---

## 使用示例

### 页面布局

```tsx
import { Card, Button, Input, Tag } from '@/components/DesignSystem';

const ExamplePage = () => {
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <Card hoverable>
        <div className="space-y-4">
          <Tag variant="primary">单选题</Tag>
          <p className="text-[16px] leading-[1.6] text-[#1f2937]">
            题目内容示例...
          </p>
          <Input placeholder="输入答案..." />
          <div className="flex gap-3">
            <Button variant="primary" size="lg">
              确认
            </Button>
            <Button variant="secondary" size="lg">
              跳过
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
```
