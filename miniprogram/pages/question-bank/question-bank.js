const { getQuestionBank } = require('../../utils/storage')
const { questionTypeNameMap, difficultyNameMap, shuffleArray } = require('../../utils/common')

Page({
  data: {
    categories: [],
    difficulties: [
      { name: '全部', value: '全部' },
      { name: '简单', value: 'easy' },
      { name: '中等', value: 'medium' },
      { name: '困难', value: 'hard' }
    ],
    types: [
      { name: '全部', value: '全部' },
      { name: '单选题', value: 'single' },
      { name: '多选题', value: 'multiple' },
      { name: '判断题', value: 'judge' },
      { name: '填空题', value: 'fill' }
    ],
    selectedCategory: '全部',
    selectedDifficulty: '全部',
    selectedType: '全部',
    questions: [],
    filteredQuestions: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const questionBank = getQuestionBank()
    const categories = ['全部', ...new Set(questionBank.map(q => q.category))]
    const questions = questionBank.map(item => ({
      ...item,
      typeText: questionTypeNameMap[item.type] || item.type,
      difficultyText: difficultyNameMap[item.difficulty] || item.difficulty
    }))

    this.setData({
      categories,
      questions
    }, () => {
      this.applyFilters()
    })
  },

  applyFilters() {
    const { questions, selectedCategory, selectedDifficulty, selectedType } = this.data
    const filtered = questions.filter(question => {
      if (selectedCategory !== '全部' && question.category !== selectedCategory) {
        return false
      }
      if (selectedDifficulty !== '全部' && question.difficulty !== selectedDifficulty) {
        return false
      }
      if (selectedType !== '全部' && question.type !== selectedType) {
        return false
      }
      return true
    })

    this.setData({
      filteredQuestions: filtered
    })
  },

  selectCategory(event) {
    const category = event.currentTarget.dataset.category
    this.setData({ selectedCategory: category }, () => this.applyFilters())
  },

  selectDifficulty(event) {
    const difficulty = event.currentTarget.dataset.difficulty
    this.setData({ selectedDifficulty: difficulty }, () => this.applyFilters())
  },

  selectType(event) {
    const type = event.currentTarget.dataset.type
    this.setData({ selectedType: type }, () => this.applyFilters())
  },

  startExamWithFiltered() {
    const { filteredQuestions } = this.data
    if (!filteredQuestions.length) {
      wx.showToast({
        title: '请先选择题目',
        icon: 'none'
      })
      return
    }

    const selected = shuffleArray(filteredQuestions).slice(0, Math.min(20, filteredQuestions.length))
    wx.setStorageSync('tempExamQuestions', selected)
    wx.setStorageSync('tempExamAnswers', {})
    wx.setStorageSync('tempExamStartTime', Date.now())

    wx.navigateTo({
      url: '/pages/exam/exam'
    })
  },

  previewQuestion(event) {
    const questionId = event.currentTarget.dataset.questionId
    const target = this.data.questions.find(item => item.id === questionId)
    if (!target) return

    wx.showModal({
      title: target.typeText,
      content: `${target.question}\n\n答案：${Array.isArray(target.answer) ? target.answer.join('、') : target.answer}`,
      showCancel: false
    })
  }
})
