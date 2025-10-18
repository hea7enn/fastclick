const { getQuestionBank, getExamRecords, getWrongQuestions, markWrongQuestionResolved } = require('../../utils/storage')
const { formatDate, formatTime, shuffleArray } = require('../../utils/common')

function formatAnswerDisplay(question, answer) {
  if (answer === undefined || answer === null) {
    return '未作答'
  }
  if (Array.isArray(answer)) {
    if (answer.length === 0) {
      return '未作答'
    }
    return answer.join('、')
  }
  return String(answer)
}

Page({
  data: {
    activeTab: 'overview',
    summary: {
      totalQuestions: 0,
      totalRecords: 0,
      avgScore: 0,
      avgAccuracy: 0,
      wrongPending: 0
    },
    records: [],
    wrongQuestions: []
  },

  onShow() {
    const savedTab = wx.getStorageSync('profileActiveTab')
    if (savedTab) {
      this.setData({ activeTab: savedTab })
      wx.removeStorageSync('profileActiveTab')
    }
    this.loadData()
  },

  changeTab(event) {
    const tab = event.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.loadData()
  },

  loadData() {
    const questions = getQuestionBank()
    const records = getExamRecords()
    const wrongQuestions = getWrongQuestions().filter(w => !w.isResolved)

    let avgScore = 0
    let avgAccuracy = 0
    if (records.length > 0) {
      const totalScore = records.reduce((sum, r) => sum + (r.score || 0), 0)
      const totalAccuracy = records.reduce((sum, r) => sum + (r.accuracy || 0), 0)
      avgScore = Math.round(totalScore / records.length)
      avgAccuracy = Math.round(totalAccuracy / records.length)
    }

    const processedRecords = records.map(r => ({
      ...r,
      dateText: formatDate(r.date),
      durationText: formatTime(r.usedSeconds || 0)
    }))

    const processedWrong = wrongQuestions.map(w => ({
      ...w,
      userAnswerText: formatAnswerDisplay(w.question, w.userAnswer),
      correctAnswerText: formatAnswerDisplay(w.question, w.question.answer),
      timeText: formatDate(w.lastWrongTime)
    }))

    this.setData({
      summary: {
        totalQuestions: questions.length,
        totalRecords: records.length,
        avgScore,
        avgAccuracy,
        wrongPending: wrongQuestions.length
      },
      records: processedRecords,
      wrongQuestions: processedWrong
    })
  },

  startQuickExam() {
    const questions = getQuestionBank()
    if (questions.length === 0) {
      wx.showToast({
        title: '题库为空',
        icon: 'none'
      })
      return
    }
    const shuffled = shuffleArray(questions)
    const selected = shuffled.slice(0, Math.min(10, questions.length))

    wx.setStorageSync('tempExamQuestions', selected)
    wx.setStorageSync('tempExamAnswers', {})
    wx.setStorageSync('tempExamStartTime', Date.now())

    wx.navigateTo({
      url: '/pages/exam/exam'
    })
  },

  goQuestionBank() {
    wx.switchTab({
      url: '/pages/question-bank/question-bank'
    })
  },

  markResolved(event) {
    const id = event.currentTarget.dataset.id
    const success = markWrongQuestionResolved(id)
    if (success) {
      wx.showToast({
        title: '标记成功',
        icon: 'success'
      })
      this.loadData()
    }
  }
})
