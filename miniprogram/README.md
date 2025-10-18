# 微信小程序答题系统

## 📱 项目介绍

这是一个微信小程序端的答题系统，实现了与 PC 端相同的核心功能，支持单选题、多选题、判断题和填空题等多种题型，提供完整的答题、成绩统计、错题本等功能。

## ✨ 核心功能

### 1. 首页
- 欢迎界面与快速开始
- 学习数据总览（题库数量、考试次数、正确率、错题数）
- 热门功能快捷入口

### 2. 题库管理
- 按分类、难度、题型筛选题目
- 题目列表浏览与预览
- 快速开始练习

### 3. 答题功能
- 流畅的答题交互体验
- 实时计时与进度显示
- 支持上一题/下一题导航
- 自动保存答题状态

### 4. 成绩展示
- 可视化成绩统计
- 详细的答案解析
- 支持重新测验

### 5. 个人中心
- 学习数据概览
- 历史成绩查看
- 错题本管理
- 错题标记已掌握

## 🗂️ 项目结构

```
miniprogram/
├── app.js                  # 小程序入口
├── app.json                # 全局配置
├── app.wxss                # 全局样式
├── project.config.json     # 项目配置
├── sitemap.json            # 站点地图
├── pages/                  # 页面
│   ├── index/             # 首页
│   ├── question-bank/     # 题库页
│   ├── exam/              # 答题页
│   ├── result/            # 成绩页
│   └── profile/           # 个人中心
├── components/            # 自定义组件
│   ├── question-card/    # 题目卡片组件
│   ├── option-item/      # 选项组件
│   └── progress-bar/     # 进度条组件
├── utils/                # 工具函数
│   ├── storage.js       # 本地存储管理
│   ├── common.js        # 通用工具函数
│   └── questionData.js  # 题库数据
└── styles/              # 全局样式
    └── common.wxss     # 公共样式
```

## 🚀 快速开始

### 1. 导入项目

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 选择「导入项目」
4. 选择 `miniprogram` 目录
5. 填写 AppID（可使用测试号）
6. 点击「确定」

### 2. 运行预览

- 在微信开发者工具中点击「编译」
- 点击「预览」扫码在真机上查看
- 或直接在模拟器中预览

## 📊 数据管理

### 本地存储

系统使用微信小程序的本地存储 API 管理数据：

- `questionBank` - 题库数据
- `examRecords` - 答题记录
- `wrongQuestions` - 错题本
- `lastExamResult` - 最近一次考试结果

### 默认题库

系统内置 8 道示例题目，涵盖基础知识、操作实践和高阶挑战三个分类。

### 添加题目

在 `utils/questionData.js` 中的 `defaultQuestions` 数组添加题目：

```javascript
{
  id: 'single-003',
  type: 'single',
  category: '基础知识',
  question: '你的题目内容',
  options: [
    { key: 'A', value: '选项A' },
    { key: 'B', value: '选项B' },
    { key: 'C', value: '选项C' },
    { key: 'D', value: '选项D' }
  ],
  answer: 'A',
  analysis: '答案解析',
  difficulty: 'easy',
  score: 2
}
```

## 🎨 UI 设计

### 设计风格

- 使用微信小程序原生组件
- 采用现代化的渐变配色（紫色系主题）
- 圆角卡片式布局
- 柔和的阴影效果

### 配色方案

- 主色调：`#4F46E5` (Indigo)
- 成功色：`#10B981` (Green)
- 错误色：`#EF4444` (Red)
- 警告色：`#F59E0B` (Amber)

## 🔧 技术要点

### 组件化开发

- `question-card` - 智能题目卡片，支持所有题型
- `option-item` - 可复用的选项组件，支持结果展示
- `progress-bar` - 可配置的进度条组件

### 数据流管理

- 使用 `wx.setStorageSync` / `wx.getStorageSync` 进行数据持久化
- 临时答题数据使用 `tempExamQuestions` 等临时存储
- 页面间通过存储或路由参数传递数据

### 计时功能

- 使用 `setInterval` 实现秒表计时
- 页面卸载时自动清理定时器
- 支持暂停和继续

## 📝 数据结构

### Question（题目）

```typescript
{
  id: string
  type: 'single' | 'multiple' | 'judge' | 'fill'
  category: string
  question: string
  options: Array<{ key: string, value: string }>
  answer: string | string[]
  analysis: string
  difficulty: 'easy' | 'medium' | 'hard'
  score: number
}
```

### ExamRecord（答题记录）

```typescript
{
  id: string
  title: string
  date: number
  score: number
  totalScore: number
  correctCount: number
  totalQuestions: number
  accuracy: number
  usedSeconds: number
  questions: Question[]
  answers: Record<string, string | string[]>
}
```

### WrongQuestion（错题）

```typescript
{
  id: string
  question: Question
  userAnswer: string | string[]
  wrongCount: number
  lastWrongTime: number
  isResolved: boolean
}
```

## 🔄 与 PC 端的兼容性

### 数据结构兼容

小程序端的数据结构与 PC 端完全兼容，支持：

- 相同的题目格式
- 相同的答题记录格式
- 相同的错题本格式

### 未来扩展

可以通过云开发实现 PC 端和小程序端的数据同步：

1. 接入微信云开发
2. 将本地存储迁移到云数据库
3. 实现跨端数据同步

## 🎯 验收标准

✅ 小程序能正常运行和预览  
✅ 核心答题功能完整（单选、多选、判断、填空）  
✅ UI 美观符合小程序设计规范  
✅ 交互流畅自然  
✅ 数据结构与 PC 端兼容  
✅ 本地存储功能正常  
✅ 错题本功能完整  
✅ 历史成绩查看正常  

## 📄 许可

本项目遵循 MIT 许可协议。
