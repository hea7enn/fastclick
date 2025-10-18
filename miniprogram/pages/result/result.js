const { getLastExamResult } = require('../../utils/storage')
const { formatTime } = require('../../utils/common')

Page({
  data: {
    result: {
      earnedScore: 0,
      accuracy: 0,
      correctCount: 0,
      totalQuestions: 0
    },
    questions: [],
    answers: {},
    timeText: '00:00',
    showAnalysis: false
  },

  onShow() {
    this.loadResult()
  },

  loadResult() {
    const lastResult = getLastExamResult()
    if (!lastResult) {
      wx.showToast({
        title: '暂无成绩',
        icon: 'none'
      })
      return
    }

    const timeText = formatTime(lastResult.usedSeconds || 0)

    this.setData({
      result: {
        earnedScore: lastResult.earnedScore ?? lastResult.score ?? 0,
        accuracy: lastResult.accuracy ?? 0,
        correctCount: lastResult.correctCount ?? 0,
        totalQuestions: lastResult.totalQuestions ?? (lastResult.questions ? lastResult.questions.length : 0)
      },
      questions: lastResult.questions || [],
      answers: lastResult.answers || {},
      timeText
    })
  },

  handleRestart() {
    const { questions } = this.data
    if (!questions.length) {
      wx.switchTab({
        url: '/pages/index/index'
      })
      return
    }

    wx.setStorageSync('tempExamQuestions', questions)
    wx.setStorageSync('tempExamAnswers', {})
    wx.setStorageSync('tempExamStartTime', Date.now())

    wx.redirectTo({
      url: '/pages/exam/exam'
    })
  },

  handleViewAnalysis() {
    this.setData({
      showAnalysis: !this.data.showAnalysis
    })
  },

  handleGoHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
