const { defaultQuestions } = require('./questionData')

const STORAGE_KEYS = {
  QUESTION_BANK: 'questionBank',
  EXAM_RECORDS: 'examRecords',
  WRONG_QUESTIONS: 'wrongQuestions',
  LAST_EXAM_RESULT: 'lastExamResult'
}

function ensureQuestionBankInitialized() {
  try {
    const questions = wx.getStorageSync(STORAGE_KEYS.QUESTION_BANK)
    if (!questions || questions.length === 0) {
      wx.setStorageSync(STORAGE_KEYS.QUESTION_BANK, defaultQuestions)
    }
  } catch (error) {
    console.error('初始化题库失败', error)
    wx.setStorageSync(STORAGE_KEYS.QUESTION_BANK, defaultQuestions)
  }
}

function getQuestionBank() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.QUESTION_BANK) || []
  } catch (error) {
    console.error('获取题库失败', error)
    return []
  }
}

function saveQuestionBank(questions) {
  try {
    wx.setStorageSync(STORAGE_KEYS.QUESTION_BANK, questions)
    return true
  } catch (error) {
    console.error('保存题库失败', error)
    return false
  }
}

function getExamRecords() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.EXAM_RECORDS) || []
  } catch (error) {
    console.error('获取答题记录失败', error)
    return []
  }
}

function addExamRecord(record) {
  const records = getExamRecords()
  records.unshift(record)
  const limited = records.slice(0, 50)
  try {
    wx.setStorageSync(STORAGE_KEYS.EXAM_RECORDS, limited)
    return true
  } catch (error) {
    console.error('保存答题记录失败', error)
    return false
  }
}

function getWrongQuestions() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.WRONG_QUESTIONS) || []
  } catch (error) {
    console.error('获取错题本失败', error)
    return []
  }
}

function upsertWrongQuestions(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return
  }
  const wrongQuestions = getWrongQuestions()
  list.forEach(item => {
    const index = wrongQuestions.findIndex(w => w.id === item.id)
    if (index >= 0) {
      wrongQuestions[index].wrongCount += 1
      wrongQuestions[index].lastWrongTime = item.lastWrongTime
      wrongQuestions[index].userAnswer = item.userAnswer
      wrongQuestions[index].isResolved = false
    } else {
      wrongQuestions.push(item)
    }
  })

  try {
    wx.setStorageSync(STORAGE_KEYS.WRONG_QUESTIONS, wrongQuestions)
  } catch (error) {
    console.error('保存错题失败', error)
  }
}

function markWrongQuestionResolved(questionId) {
  const wrongQuestions = getWrongQuestions()
  const target = wrongQuestions.find(item => item.id === questionId)
  if (target) {
    target.isResolved = true
    try {
      wx.setStorageSync(STORAGE_KEYS.WRONG_QUESTIONS, wrongQuestions)
      return true
    } catch (error) {
      console.error('更新错题状态失败', error)
    }
  }
  return false
}

function clearWrongQuestions() {
  try {
    wx.setStorageSync(STORAGE_KEYS.WRONG_QUESTIONS, [])
    return true
  } catch (error) {
    console.error('清空错题本失败', error)
    return false
  }
}

function saveLastExamResult(result) {
  try {
    wx.setStorageSync(STORAGE_KEYS.LAST_EXAM_RESULT, result)
    return true
  } catch (error) {
    console.error('保存考试结果失败', error)
    return false
  }
}

function getLastExamResult() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.LAST_EXAM_RESULT) || null
  } catch (error) {
    console.error('获取考试结果失败', error)
    return null
  }
}

module.exports = {
  STORAGE_KEYS,
  ensureQuestionBankInitialized,
  getQuestionBank,
  saveQuestionBank,
  getExamRecords,
  addExamRecord,
  getWrongQuestions,
  upsertWrongQuestions,
  markWrongQuestionResolved,
  clearWrongQuestions,
  saveLastExamResult,
  getLastExamResult
}
