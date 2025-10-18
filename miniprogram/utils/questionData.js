const defaultQuestions = [
  {
    id: 'single-001',
    type: 'single',
    category: '基础知识',
    question: 'HTTP 状态码 200 表示以下哪种含义？',
    options: [
      { key: 'A', value: '请求成功' },
      { key: 'B', value: '资源不存在' },
      { key: 'C', value: '服务器内部错误' },
      { key: 'D', value: '需要重定向' }
    ],
    answer: 'A',
    analysis: '200 OK 是最常见的成功状态码，表示请求已经成功处理并返回预期结果。',
    difficulty: 'easy',
    score: 2,
    createTime: '2024-01-12 10:09:00',
    updateTime: '2024-03-01 09:28:00'
  },
  {
    id: 'multiple-001',
    type: 'multiple',
    category: '基础知识',
    question: '关于 CSS Flex 布局，以下说法正确的是？',
    options: [
      { key: 'A', value: 'flex-direction 用于设置主轴方向' },
      { key: 'B', value: 'justify-content 控制交叉轴上的对齐方式' },
      { key: 'C', value: 'align-items 控制主轴上的对齐方式' },
      { key: 'D', value: 'flex-wrap 决定是否换行' }
    ],
    answer: ['A', 'D'],
    analysis: 'flex-direction 定义主轴方向；flex-wrap 控制是否换行；justify-content 控制主轴对齐；align-items 控制交叉轴对齐。',
    difficulty: 'medium',
    score: 3,
    createTime: '2024-02-18 15:20:00',
    updateTime: '2024-05-02 12:11:00'
  },
  {
    id: 'judge-001',
    type: 'judge',
    category: '操作实践',
    question: '在 Git 中，git merge 和 git rebase 的效果完全一致。',
    options: [
      { key: 'A', value: '正确' },
      { key: 'B', value: '错误' }
    ],
    answer: 'B',
    analysis: 'merge 用于合并提交保留历史分叉，rebase 会重新应用提交，二者存在明显差异。',
    difficulty: 'medium',
    score: 2,
    createTime: '2024-04-03 09:00:00',
    updateTime: '2024-06-10 08:00:00'
  },
  {
    id: 'fill-001',
    type: 'fill',
    category: '操作实践',
    question: '请填写常用的包管理器命令：在 npm 中安装依赖使用 npm ______ install。',
    options: [],
    answer: 'npm',
    analysis: 'npm install 命令无需额外前缀，但如果需要全局安装则使用 npm install -g。',
    difficulty: 'easy',
    score: 2,
    createTime: '2024-05-18 11:45:00',
    updateTime: '2024-05-18 11:45:00'
  },
  {
    id: 'single-002',
    type: 'single',
    category: '高阶挑战',
    question: '以下哪项技术可以显著减少移动端首屏渲染时间？',
    options: [
      { key: 'A', value: '增加图片分辨率' },
      { key: 'B', value: '使用懒加载技术' },
      { key: 'C', value: '引入更多字体文件' },
      { key: 'D', value: '在 CSS 中增加大量动画' }
    ],
    answer: 'B',
    analysis: '懒加载可以推迟非首屏资源加载，减少首屏渲染压力，从而提升体验。',
    difficulty: 'medium',
    score: 3,
    createTime: '2024-06-01 20:00:00',
    updateTime: '2024-07-12 13:40:00'
  },
  {
    id: 'multiple-002',
    type: 'multiple',
    category: '高阶挑战',
    question: '为了提升 Web 安全性，以下策略可以考虑采用？',
    options: [
      { key: 'A', value: '开启 Content Security Policy（CSP）' },
      { key: 'B', value: '所有请求使用明文 HTTP 传输' },
      { key: 'C', value: '对输入数据进行严格校验和转义' },
      { key: 'D', value: '启用 HTTPS 并正确配置证书' }
    ],
    answer: ['A', 'C', 'D'],
    analysis: 'CSP、输入校验和 HTTPS 都是保障 Web 安全的重要手段，明文 HTTP 会带来风险。',
    difficulty: 'hard',
    score: 4,
    createTime: '2024-06-15 07:32:00',
    updateTime: '2024-08-01 07:32:00'
  },
  {
    id: 'judge-002',
    type: 'judge',
    category: '基础知识',
    question: 'LocalStorage 相比 SessionStorage 具有更长的生命周期。',
    options: [
      { key: 'A', value: '正确' },
      { key: 'B', value: '错误' }
    ],
    answer: 'A',
    analysis: 'LocalStorage 没有过期时间，而 SessionStorage 在会话结束后失效。',
    difficulty: 'easy',
    score: 2,
    createTime: '2024-02-01 12:00:00',
    updateTime: '2024-02-01 12:00:00'
  },
  {
    id: 'fill-002',
    type: 'fill',
    category: '基础知识',
    question: '在 JavaScript 中，使用 ______ 关键字可以声明一个块级作用域的常量。',
    options: [],
    answer: 'const',
    analysis: 'const 用于声明常量，并且具备块级作用域的特性。',
    difficulty: 'easy',
    score: 2,
    createTime: '2024-03-08 08:30:00',
    updateTime: '2024-03-09 09:00:00'
  }
]

module.exports = {
  defaultQuestions
}
