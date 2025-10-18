const questionTypeNameMap = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题'
}

const difficultyNameMap = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

const difficultyColorMap = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444'
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

function generateId(prefix = '') {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function shuffleArray(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function checkAnswer(question, userAnswer) {
  if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
    return false
  }

  const correctAnswer = question.answer

  if (question.type === 'multiple') {
    if (!Array.isArray(userAnswer)) return false
    if (userAnswer.length !== correctAnswer.length) return false
    const sortedUser = [...userAnswer].sort()
    const sortedCorrect = [...correctAnswer].sort()
    return sortedUser.every((ans, idx) => ans === sortedCorrect[idx])
  }

  if (question.type === 'fill') {
    const normalizedUser = String(userAnswer).trim().toLowerCase()
    const normalizedCorrect = String(correctAnswer).trim().toLowerCase()
    return normalizedUser === normalizedCorrect
  }

  return String(userAnswer) === String(correctAnswer)
}

function calculateScore(questions, answers) {
  let correctCount = 0
  let totalScore = 0
  let earnedScore = 0

  questions.forEach(question => {
    const userAnswer = answers[question.id]
    totalScore += question.score
    if (checkAnswer(question, userAnswer)) {
      correctCount++
      earnedScore += question.score
    }
  })

  const accuracy = questions.length > 0 
    ? Math.round((correctCount / questions.length) * 100) 
    : 0

  return {
    correctCount,
    totalQuestions: questions.length,
    earnedScore,
    totalScore,
    accuracy
  }
}

function filterQuestions(questions, filters) {
  return questions.filter(q => {
    if (filters.category && filters.category !== '全部' && q.category !== filters.category) {
      return false
    }
    if (filters.difficulty && filters.difficulty !== '全部' && q.difficulty !== filters.difficulty) {
      return false
    }
    if (filters.type && filters.type !== '全部' && q.type !== filters.type) {
      return false
    }
    return true
  })
}

function getCategories(questions) {
  const categories = new Set()
  questions.forEach(q => categories.add(q.category))
  return ['全部', ...Array.from(categories)]
}

function showToast(title, icon = 'none') {
  wx.showToast({
    title,
    icon,
    duration: 2000
  })
}

function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  })
}

function hideLoading() {
  wx.hideLoading()
}

function confirm(options) {
  return new Promise((resolve) => {
    wx.showModal({
      title: options.title || '提示',
      content: options.content || '',
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

module.exports = {
  questionTypeNameMap,
  difficultyNameMap,
  difficultyColorMap,
  formatTime,
  formatDate,
  generateId,
  shuffleArray,
  checkAnswer,
  calculateScore,
  filterQuestions,
  getCategories,
  showToast,
  showLoading,
  hideLoading,
  confirm
}
