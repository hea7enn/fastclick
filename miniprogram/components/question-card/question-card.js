const { questionTypeNameMap, difficultyNameMap, difficultyColorMap } = require('../../utils/common')

Component({
  properties: {
    question: {
      type: Object,
      value: {}
    },
    userAnswer: {
      type: null,
      value: null
    },
    disabled: {
      type: Boolean,
      value: false
    },
    showResult: {
      type: Boolean,
      value: false
    },
    showAnalysis: {
      type: Boolean,
      value: false
    }
  },
  data: {
    typeText: '',
    difficultyText: '',
    difficultyColor: '',
    optionsWithState: [],
    correctAnswerText: '',
    fillValue: ''
  },
  observers: {
    'question, userAnswer, showResult': function(question, userAnswer, showResult) {
      if (question && question.id) {
        this.updateDisplay()
      }
    }
  },
  attached() {
    this.updateDisplay()
  },
  methods: {
    updateDisplay() {
      const { question, userAnswer, showResult } = this.data
      if (!question || !question.id) return

      const typeText = questionTypeNameMap[question.type] || question.type
      const difficultyText = difficultyNameMap[question.difficulty] || question.difficulty
      const difficultyColor = difficultyColorMap[question.difficulty] || '#6B7280'

      let optionsWithState = []
      if (question.type !== 'fill' && question.options && question.options.length > 0) {
        optionsWithState = question.options.map(opt => {
          let selected = false
          if (question.type === 'multiple') {
            selected = Array.isArray(userAnswer) && userAnswer.includes(opt.key)
          } else {
            selected = userAnswer === opt.key
          }

          const isCorrect = Array.isArray(question.answer)
            ? question.answer.includes(opt.key)
            : question.answer === opt.key

          return {
            ...opt,
            selected,
            isCorrect
          }
        })
      }

      let fillValue = ''
      if (question.type === 'fill') {
        if (Array.isArray(userAnswer)) {
          fillValue = userAnswer.join('、')
        } else if (userAnswer) {
          fillValue = String(userAnswer)
        }
      }

      let correctAnswerText = ''
      if (showResult) {
        if (Array.isArray(question.answer)) {
          correctAnswerText = question.answer.join('、')
        } else {
          correctAnswerText = question.answer
        }
      }

      this.setData({
        typeText,
        difficultyText,
        difficultyColor,
        optionsWithState,
        correctAnswerText,
        fillValue
      })
    },

    handleOptionSelect(e) {
      const selectedOption = e.detail.option
      const { question, userAnswer } = this.data

      let newAnswer = null
      if (question.type === 'multiple') {
        let currentAnswers = Array.isArray(userAnswer) ? [...userAnswer] : []
        const index = currentAnswers.indexOf(selectedOption.key)
        if (index >= 0) {
          currentAnswers.splice(index, 1)
        } else {
          currentAnswers.push(selectedOption.key)
        }
        newAnswer = currentAnswers
      } else {
        newAnswer = selectedOption.key
      }

      this.triggerEvent('answerchange', {
        questionId: question.id,
        answer: newAnswer
      })
    },

    handleFillInput(e) {
      const value = e.detail.value
      this.triggerEvent('answerchange', {
        questionId: this.data.question.id,
        answer: value
      })
    }
  }
})
