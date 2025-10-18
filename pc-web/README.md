# 智答实验室 - PC Web 端答题系统

基于 Vue 3 + Vite + Element Plus 的现代化答题系统前端项目。

## 技术栈

- **Vue 3.5+** - 使用 Composition API 和 `<script setup>` 语法
- **TypeScript** - 类型安全
- **Vite** - 快速开发服务器和构建工具
- **Element Plus** - UI 组件库
- **Vue Router 4** - 路由管理
- **Pinia** - 状态管理
- **Sass** - CSS 预处理器

## 项目结构

```
pc-web/
├── src/
│   ├── api/              # API 接口层
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   │   └── common/       # 通用组件
│   ├── layouts/          # 布局组件
│   │   └── MainLayout.vue
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── stores/           # Pinia 状态管理
│   │   ├── index.ts
│   │   └── user.ts
│   ├── styles/           # 全局样式
│   │   ├── element/      # Element Plus 自定义样式
│   │   ├── global.scss   # 全局样式
│   │   ├── variables.scss # 样式变量
│   │   └── index.scss    # 样式入口
│   ├── utils/            # 工具函数
│   │   └── index.ts
│   ├── views/            # 页面视图
│   │   ├── Home.vue      # 首页
│   │   ├── QuestionBank.vue # 题库管理
│   │   ├── Exam.vue      # 答题页面
│   │   └── Result.vue    # 成绩结果
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## 功能特性

### 1. 首页 (Home)
- 系统介绍和概览
- 快速入口（开始答题、浏览题库）
- 数据统计展示
- 核心功能介绍
- 最近答题记录

### 2. 题库管理 (QuestionBank)
- 题目列表展示
- 搜索和筛选（分类、难度）
- 题目详情查看
- 题目标签管理

### 3. 答题页面 (Exam)
- 倒计时功能
- 答题进度展示
- 答题卡快速定位
- 题目导航（上一题/下一题）
- 答案保存和提交

### 4. 成绩查询 (Result)
- 成绩总览
- 知识点分析
- 历史成绩记录
- 智能诊断建议

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认运行在 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 样式主题

项目采用现代化的蓝色渐变配色方案：

- 主色调：#409EFF（Element Plus Blue）
- 渐变色：#667eea → #764ba2
- 背景色：#f5f7fa
- 文字色：#303133、#606266、#909399

自定义主题变量在 `src/styles/variables.scss` 中配置。

## 路由配置

| 路径 | 组件 | 说明 |
|------|------|------|
| `/home` | Home.vue | 系统首页 |
| `/question-bank` | QuestionBank.vue | 题库管理 |
| `/exam` | Exam.vue | 开始答题 |
| `/result` | Result.vue | 成绩查询 |

## 状态管理

使用 Pinia 进行状态管理，目前包含：

- `useUserStore` - 用户信息管理（用户名、登录状态等）

## 待开发功能

- [ ] API 接口对接
- [ ] 用户认证和授权
- [ ] 题目编辑器
- [ ] 错题本功能
- [ ] 学习进度追踪
- [ ] 多语言支持

## 代码规范

- 使用 TypeScript 编写
- 遵循 Vue 3 Composition API 风格
- 组件使用 `<script setup>` 语法
- 样式使用 Sass 预处理器
- 遵循 Element Plus 设计规范

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## License

MIT
