import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question } from '@/types/question'
import { randomId, formatDate } from '@/utils'

const STORAGE_KEY = 'question-bank-data'

/**
 * 从 localStorage 加载题库数据
 */
const loadFromStorage = (): Question[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = window.localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('加载题库数据失败:', error)
    return []
  }
}

/**
 * 保存题库数据到 localStorage
 */
const saveToStorage = (questions: Question[]) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
  } catch (error) {
    console.error('保存题库数据失败:', error)
  }
}

export const useQuestionBankStore = defineStore('questionBank', () => {
  // 题目列表
  const questions = ref<Question[]>(loadFromStorage())

  // 获取所有分类
  const categories = computed(() => {
    const categorySet = new Set<string>()
    questions.value.forEach((q) => {
      if (q.category) {
        categorySet.add(q.category)
      }
    })
    return Array.from(categorySet).sort()
  })

  // 获取题目总数
  const totalCount = computed(() => questions.value.length)

  // 按题型统计
  const countByType = computed(() => {
    const result: Record<string, number> = {
      single: 0,
      multiple: 0,
      judge: 0,
      fill: 0
    }
    questions.value.forEach((q) => {
      result[q.type] = (result[q.type] || 0) + 1
    })
    return result
  })

  /**
   * 添加题目
   */
  const addQuestion = (question: Omit<Question, 'id' | 'createTime' | 'updateTime'>) => {
    const now = formatDate(new Date())
    const newQuestion: Question = {
      ...question,
      id: randomId('q'),
      createTime: now,
      updateTime: now
    }
    questions.value.push(newQuestion)
    saveToStorage(questions.value)
    return newQuestion
  }

  /**
   * 批量添加题目（用于Excel导入）
   */
  const batchAddQuestions = (newQuestions: Omit<Question, 'id' | 'createTime' | 'updateTime'>[]) => {
    const now = formatDate(new Date())
    const questionsToAdd: Question[] = newQuestions.map((q) => ({
      ...q,
      id: randomId('q'),
      createTime: now,
      updateTime: now
    }))
    questions.value.push(...questionsToAdd)
    saveToStorage(questions.value)
    return questionsToAdd
  }

  /**
   * 更新题目
   */
  const updateQuestion = (id: string, updates: Partial<Omit<Question, 'id' | 'createTime'>>) => {
    const index = questions.value.findIndex((q) => q.id === id)
    if (index !== -1) {
      const currentQuestion = questions.value[index]
      if (!currentQuestion) {
        return false
      }

      questions.value[index] = {
        id: currentQuestion.id,
        type: updates.type ?? currentQuestion.type,
        category: updates.category ?? currentQuestion.category,
        question: updates.question ?? currentQuestion.question,
        options: updates.options ?? currentQuestion.options,
        answer: updates.answer ?? currentQuestion.answer,
        analysis: updates.analysis ?? currentQuestion.analysis,
        difficulty: updates.difficulty ?? currentQuestion.difficulty,
        score: updates.score ?? currentQuestion.score,
        createTime: currentQuestion.createTime,
        updateTime: formatDate(new Date())
      }
      saveToStorage(questions.value)
      return true
    }
    return false
  }

  /**
   * 删除题目
   */
  const deleteQuestion = (id: string) => {
    const index = questions.value.findIndex((q) => q.id === id)
    if (index !== -1) {
      questions.value.splice(index, 1)
      saveToStorage(questions.value)
      return true
    }
    return false
  }

  /**
   * 批量删除题目
   */
  const batchDeleteQuestions = (ids: string[]) => {
    questions.value = questions.value.filter((q) => !ids.includes(q.id))
    saveToStorage(questions.value)
  }

  /**
   * 根据ID获取题目
   */
  const getQuestionById = (id: string) => {
    return questions.value.find((q) => q.id === id)
  }

  /**
   * 清空所有题目
   */
  const clearAll = () => {
    questions.value = []
    saveToStorage(questions.value)
  }

  /**
   * 搜索题目
   */
  const searchQuestions = (
    keyword?: string,
    category?: string,
    difficulty?: string,
    type?: string
  ) => {
    return questions.value.filter((q) => {
      const matchKeyword = !keyword || q.question.includes(keyword)
      const matchCategory = !category || q.category === category
      const matchDifficulty = !difficulty || q.difficulty === difficulty
      const matchType = !type || q.type === type
      return matchKeyword && matchCategory && matchDifficulty && matchType
    })
  }

  return {
    questions,
    categories,
    totalCount,
    countByType,
    addQuestion,
    batchAddQuestions,
    updateQuestion,
    deleteQuestion,
    batchDeleteQuestions,
    getQuestionById,
    clearAll,
    searchQuestions
  }
})
