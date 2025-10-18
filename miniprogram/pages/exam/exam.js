const { addExamRecord, saveLastExamResult, upsertWrongQuestions } = require('../../utils/storage')
const { calculateScore, generateId, checkAnswer, formatTime } = require('../../utils/common')

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    answers: {},
    startTime: 0,
    elapsedSeconds: 0,
    timeText: '00:00',
    timer: null
  },

  onLoad() {
    this.loadExamData()
    this.startTimer()
  },

  onUnload() {
    this.stopTimer()
  },

  loadExamData() {
    const questions = wx.getStorageSync('tempExamQuestions') || []
    const answers = wx.getStorageSync('tempExamAnswers') || {}
    const startTime = wx.getStorageSync('tempExamStartTime') || Date.now()

    if (questions.length === 0) {
      wx.showToast({
        title: '没有可答题目',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({
      questions,
      answers,
      startTime,
      currentQuestion: questions[0]
    })
  },

  startTimer() {
    this.data.timer = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - this.data.startTime) / 1000)
      this.setData({
        elapsedSeconds: elapsed,
        timeText: formatTime(elapsed)
      })
    }, 1000)
  },

  stopTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.data.timer = null
    }
  },

  handleAnswerChange(event) {
    const { questionId, answer } = event.detail
    const answers = { ...this.data.answers }
    answers[questionId] = answer
    this.setData({ answers })
    wx.setStorageSync('tempExamAnswers', answers)
  },

  prevQuestion() {
    const { currentIndex, questions } = this.data
    if (currentIndex > 0) {
      this.setData({
        currentIndex: currentIndex - 1,
        currentQuestion: questions[currentIndex - 1]
      })
    }
  },

  nextQuestion() {
    const { currentIndex, questions } = this.data
    if (currentIndex < questions.length - 1) {
      this.setData({
        currentIndex: currentIndex + 1,
        currentQuestion: questions[currentIndex + 1]
      })
    }
  },

  submitExam() {
    const { questions, answers } = this.data
    const unansweredCount = questions.filter(q => !answers[q.id] || (Array.isArray(answers[q.id]) && answers[q.id].length === 0)).length

    if (unansweredCount > 0) {
      wx.showModal({
        title: '提示',
        content: `还有 ${unansweredCount} 道题未作答，确定要提交吗？`,
        success: (res) => {
          if (res.confirm) {
            this.finishExam()
          }
        }
      })
    } else {
      this.finishExam()
    }
  },

  finishExam() {
    this.stopTimer()
    const { questions, answers, elapsedSeconds } = this.data
    const result = calculateScore(questions, answers)

    const record = {
      id: generateId('exam_'),
      title: '答题练习',
      date: Date.now(),
      score: result.earnedScore,
      totalScore: result.totalScore,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      accuracy: result.accuracy,
      usedSeconds: elapsedSeconds,
      questions,
      answers
    }

    addExamRecord(record)

    const wrongList = questions
      .filter(q => !checkAnswer(q, answers[q.id]))
      .map(q => ({
        id: q.id,
        question: q,
        userAnswer: answers[q.id] || '',
        wrongCount: 1,
        lastWrongTime: Date.now(),
        isResolved: false
      }))

    upsertWrongQuestions(wrongList)

    saveLastExamResult({
      ...result,
      usedSeconds: elapsedSeconds,
      recordId: record.id,
      questions,
      answers,
      wrongQuestions: wrongList
    })

    wx.removeStorageSync('tempExamQuestions')
    wx.removeStorageSync('tempExamAnswers')
    wx.removeStorageSync('tempExamStartTime')

    wx.redirectTo({
      url: '/pages/result/result'
    })
  }
})
