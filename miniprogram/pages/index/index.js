const { getQuestionBank, getExamRecords, getWrongQuestions } = require('../../utils/storage')
const { shuffleArray } = require('../../utils/common')

Page({
  data: {
    stat: {
      totalQuestions: 0,
      totalRecords: 0,
      accuracy: 0,
      wrongCount: 0
    }
  },
  onShow() {
    this.loadStatistics()
  },
  loadStatistics() {
    const questions = getQuestionBank()
    const records = getExamRecords()
    const wrongQuestions = getWrongQuestions()

    let totalAccuracy = 0
    if (records.length > 0) {
      totalAccuracy = records.reduce((sum, r) => sum + r.accuracy, 0)
      totalAccuracy = Math.round(totalAccuracy / records.length)
    }

    this.setData({
      stat: {
        totalQuestions: questions.length,
        totalRecords: records.length,
        accuracy: totalAccuracy,
        wrongCount: wrongQuestions.filter(w => !w.isResolved).length
      }
    })
  },
  handleStartExam() {
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
  goExam() {
    this.handleStartExam()
  },
  goHistory() {
    wx.setStorageSync('profileActiveTab', 'history')
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },
  goWrong() {
    wx.setStorageSync('profileActiveTab', 'wrong')
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  }
})
