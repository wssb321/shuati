# 📚 Steam刷题管家

一个现代化的在线刷题应用，提供流畅的学习体验和精美的视觉效果。

## ✨ 功能特性

- **📝 练习模式** - 自由练习题库，支持即时反馈
- **🎯 模拟考试** - 随机出题，限时答题
- **🎲 混合题库** - 跨章节综合练习
- **📋 错题练习** - 智能错题收集与复习
- **⭐ 收藏功能** - 收藏重要题目便于复习
- **💾 进度保存** - 自动保存答题进度
- **🖱️ 交互背景** - 精美的极光动画效果

## 🛠️ 技术栈

| 分类 | 技术 | 版本 |
| :--- | :--- | :--- |
| 框架 | React | 18.3.1 |
| 语言 | TypeScript | ~5.8.3 |
| 构建工具 | Vite | 6.3.5 |
| 样式 | Tailwind CSS | 3.4.17 |
| 路由 | React Router DOM | 7.3.0 |
| 状态管理 | Zustand | 5.0.3 |
| WebGL | OGL | 1.0.11 |
| 图标 | Lucide React | 0.511.0 |

## 📁 项目结构

```
src/
├── components/          # UI组件
│   ├── SoftAurora.tsx   # 极光动画背景
│   ├── QuestionCard.tsx # 题目卡片
│   ├── QuestionList.tsx # 题目导航列表
│   ├── ProgressPanel.tsx # 进度面板
│   ├── FuzzyText.tsx    # 模糊文字效果
│   └── ...
├── pages/               # 页面组件
│   ├── QuizPage.tsx     # 主刷题页面
│   ├── BookmarkPage.tsx # 收藏页面
│   └── WrongQuestionPage.tsx # 错题页面
├── hooks/               # 自定义Hooks
│   ├── useSwipeGesture.ts # 滑动手势
│   ├── useTheme.ts      # 主题管理
│   └── ...
├── utils/               # 工具函数
│   ├── questionParser.ts # 题目解析
│   ├── progressManager.ts # 进度管理
│   ├── wrongQuestionManager.ts # 错题管理
│   └── bookmarkManager.ts # 收藏管理
├── lib/                 # 通用库
│   └── utils.ts         # 工具函数
├── App.tsx              # 应用入口
├── main.tsx             # 主入口文件
└── index.css            # 全局样式
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
npm run check
```

## 🎮 功能介绍

### 练习模式
- 支持单选和多选题
- 即时反馈答题结果
- 自动记录错题

### 模拟考试
- 自定义题库选择
- 可配置题目数量和时长
- 倒计时自动提交

### 错题练习
- 智能收集答错题目
- 记录错题次数
- 答对自动移出错题本

### 视觉效果
- WebGL 极光动画背景
- 鼠标交互响应
- 流畅的过渡动画

## 📄 题库格式

题库文件位于 `public/题库/` 目录，支持以下格式：

```
一、单选题（共20题，66分）
1. 题目内容
A. 选项A
B. 选项B
C. 选项C
D. 选项D
答案：A

二、多选题（共10题，34分）
1. 题目内容
A. 选项A
B. 选项B
C. 选项C
D. 选项D
答案：AB
```

## 📜 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！