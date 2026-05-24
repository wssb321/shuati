# 📚 Steam刷题管家

一个现代化的在线刷题应用，基于 React + TypeScript 构建，提供流畅的学习体验和精美的视觉效果。

## 🌐 在线访问

**官网地址**: https://www.zzrbsw.xyz/

## ✨ 功能特性

### 📝 练习模式
- 自由练习题库，支持即时反馈
- 智能答案解析，详细讲解题目要点
- 支持单选、多选等多种题型

### 🎯 模拟考试
- 随机出题，限时答题
- 自定义题库选择
- 可配置题目数量和考试时长
- 倒计时自动提交，模拟真实考试环境

### 🎲 混合题库
- 跨章节综合练习
- 智能随机抽题算法
- 全面覆盖知识点

### 📋 错题练习
- 智能错题收集与复习
- 记录错题次数和错误原因
- 答对自动移出错题本
- 支持错题专项练习

### ⭐ 收藏功能
- 收藏重要题目便于复习
- 支持批量管理收藏夹
- 快速跳转到收藏题目

### 💾 进度保存
- 自动保存答题进度
- localStorage 本地持久化
- 支持跨设备数据同步

### 🎨 视觉效果
- WebGL 极光动画背景
- 鼠标交互响应效果
- 流畅的过渡动画
- 支持夜间模式切换

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
│   ├── QuestionCard.tsx # 题目卡片组件
│   ├── QuestionList.tsx # 题目导航列表
│   ├── ProgressPanel.tsx # 进度面板
│   ├── TopBar.tsx       # 顶部导航栏
│   ├── BottomNav.tsx    # 底部导航区
│   ├── ExplanationPanel.tsx # 解析面板
│   ├── SubmitConfirmDialog.tsx # 交卷确认对话框
│   └── ...
├── pages/               # 页面组件
│   ├── QuizPage.tsx     # 主刷题页面
│   ├── BookmarkPage.tsx # 收藏页面
│   ├── WrongQuestionPage.tsx # 错题页面
│   ├── DiagnosticsPage.tsx # 诊断页面
│   └── MinimalQuizPage.tsx # 极简刷题页面
├── hooks/               # 自定义Hooks
│   ├── useSwipeGesture.ts # 滑动手势处理
│   ├── useTheme.ts      # 主题管理
│   └── ...
├── utils/               # 工具函数
│   ├── questionParser.ts # 题目解析器
│   ├── progressManager.ts # 进度管理器
│   ├── wrongQuestionManager.ts # 错题管理器
│   ├── bookmarkManager.ts # 收藏管理器
│   ├── quizLoader.ts    # 题库加载器
│   └── quizDiagnostics.ts # 题库诊断工具
├── lib/                 # 通用库
│   └── utils.ts         # 工具函数
├── App.tsx              # 应用入口组件
├── main.tsx             # 主入口文件
└── index.css            # 全局样式
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
npm run check
```

## 🎮 使用指南

### 刷题流程

1. **选择题库**: 在首页选择要练习的章节
2. **开始答题**: 阅读题目，选择正确答案
3. **查看结果**: 提交后查看答案解析
4. **复习错题**: 在错题本中复习答错的题目
5. **收藏题目**: 点击收藏按钮保存重要题目

### 快捷键支持

- `←` / `→`: 切换上下题
- `A` / `B` / `C` / `D`: 选择对应选项
- `Enter`: 确认答案
- `Space`: 切换答案显示

### 考试模式

1. 点击"模拟考试"进入考试模式
2. 配置考试参数（题库选择、题目数量、时长）
3. 开始答题，倒计时结束自动提交
4. 查看考试成绩和详细分析

## 📄 题库格式

题库文件位于 `public/tiku/` 目录，支持以下格式：

```
一、单选题（共20题，66分）
1. 题目内容，支持多行描述
A. 选项A内容
B. 选项B内容
C. 选项C内容
D. 选项D内容
答案：A

二、多选题（共10题，34分）
1. 多选题题目内容
A. 选项A
B. 选项B
C. 选项C
D. 选项D
答案：AB
解析：本题考查XXX知识点，正确答案为AB。
```

### 题目格式说明

| 标记 | 说明 |
| :--- | :--- |
| `答案：` | 指定正确答案，支持单个(A)或多个(AB) |
| `解析：` | 题目解析说明（可选） |
| `一、单选题` | 题型标题，用于分类统计 |

## 🚀 部署指南

### GitHub Pages 部署

1. 确保 `vite.config.ts` 中 `base` 配置正确：
   ```typescript
   base: '/shuati/'
   ```

2. 配置 GitHub Actions 自动部署：
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v4
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. 在 GitHub 仓库设置中开启 Pages 功能

### 自定义域名部署

1. 在 `CNAME` 文件中添加域名：
   ```
   www.zzrbsw.xyz
   ```

2. 配置 DNS 解析：
   - 添加 CNAME 记录指向 `<username>.github.io`
   - 确保 SSL 证书配置正确

## 📊 项目统计

- **代码行数**: ~10,000 行
- **组件数量**: 20+
- **页面数量**: 5+
- **题库章节**: 16+
- **题目数量**: 1000+

## 🔧 开发指南

### 添加新功能

1. 在 `src/components/` 目录创建新组件
2. 在 `src/pages/` 目录创建新页面（如果需要）
3. 在 `src/utils/` 目录添加工具函数
4. 更新路由配置

### 自定义主题

修改 `src/index.css` 中的 Tailwind 主题配置：

```css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #6366f1;
  --color-accent: #8b5cf6;
  /* ... */
}
```

## 📜 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献步骤

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

## 📞 联系方式

- **作者**: wssb321
- **邮箱**: 3067854108@qq.com
- **项目地址**: https://github.com/wssb321/shuati

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
