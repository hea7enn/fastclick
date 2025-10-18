import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { DifficultyLevel, Question, QuestionType, ExamRecord, WrongQuestion, ViewMode } from '@/types/question'
import { useQuestionBankStore } from './questionBank'

export type ExamStatus = 'idle' | 'ready' | 'in-progress' | 'finished'

export interface ExamConfig {
  category: string | 'all'
  difficulty: DifficultyLevel | 'all'
  questionTypes: QuestionType[]
  totalQuestions: number
  duration: number // 单位：分钟
}

export interface ExamStatistics {
  totalQuestions: number
  answered: number
  marked: number
  correctCount: number
  totalScore: number
  obtainedScore: number
  accuracy: number
  usedSeconds: number
}

interface ExamState {
  status: ExamStatus
  config: ExamConfig | null
  questions: Question[]
  currentIndex: number
  answers: Record<string, string | string[]>
  marked: string[]
  remainingSeconds: number
  startTimestamp: number | null
  lastTickAt: number | null
  finishedAt: number | null
}

interface PrepareResult {
  success: boolean
  message?: string
  total?: number
}

const STORAGE_KEY = 'exam-progress-v1'
const HISTORY_KEY = 'exam-history-v1'
const WRONG_QUESTIONS_KEY = 'wrong-questions-v1'
const VIEW_MODE_KEY = 'view-mode-v1'
const MIN_DURATION = 5

const QUESTION_TYPES: QuestionType[] = ['single', 'multiple', 'judge', 'fill']

const createDefaultState = (): ExamState => ({
  status: 'idle',
  config: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  marked: [],
  remainingSeconds: 0,
  startTimestamp: null,
  lastTickAt: null,
  finishedAt: null
})

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage

const shuffle = <T>(list: T[]): T[] => {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]!
    arr[j] = temp!
  }
  return arr
}

const normalizeChoice = (value: string) => value.trim().toUpperCase()
const normalizeText = (value: string) => value.trim().toLowerCase()

export const useExamStore = defineStore('exam', () => {
  const questionBankStore = useQuestionBankStore()

  const loadState = (): ExamState => {
    if (!canUseStorage()) {
      return createDefaultState()
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return createDefaultState()
      }
      const parsed = JSON.parse(raw) as Partial<ExamState>
      return {
        ...createDefaultState(),
        ...parsed,
        answers: parsed.answers ?? {},
        marked: parsed.marked ?? []
      }
    } catch (error) {
      console.error('加载答题进度失败', error)
      return createDefaultState()
    }
  }

  const state = ref<ExamState>(loadState())

  const persistState = () => {
    if (!canUseStorage()) {
      return
    }

    try {
      if (state.value.status === 'idle') {
        window.localStorage.removeItem(STORAGE_KEY)
        return
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    } catch (error) {
      console.error('保存答题进度失败', error)
    }
  }

  const syncTimeDrift = () => {
    if (state.value.status !== 'in-progress' || !state.value.lastTickAt) {
      return
    }

    const now = Date.now()
    const diffSeconds = Math.floor((now - state.value.lastTickAt) / 1000)
    if (diffSeconds <= 0) {
      return
    }

    state.value.remainingSeconds = Math.max(0, state.value.remainingSeconds - diffSeconds)
    state.value.lastTickAt = now
    if (state.value.remainingSeconds === 0) {
      state.value.status = 'finished'
      state.value.finishedAt = now
    }
  }

  syncTimeDrift()

  watch(
    state,
    () => {
      persistState()
    },
    { deep: true }
  )

  const status = computed<ExamStatus>(() => state.value.status)
  const config = computed<ExamConfig | null>(() => state.value.config)
  const questionList = computed<Question[]>(() => state.value.questions)
  const totalQuestions = computed(() => state.value.questions.length)
  const currentQuestion = computed<Question | null>(() => state.value.questions[state.value.currentIndex] ?? null)
  const currentIndex = computed(() => state.value.currentIndex)
  const answeredIds = computed(() => Object.keys(state.value.answers))
  const answeredCount = computed(() => answeredIds.value.length)
  const markedCount = computed(() => state.value.marked.length)
  const progress = computed(() => {
    if (totalQuestions.value === 0) {
      return 0
    }
    return Math.round((answeredCount.value / totalQuestions.value) * 100)
  })
  const remainingSeconds = computed(() => state.value.remainingSeconds)
  const usedSeconds = computed(() => {
    if (!state.value.config) {
      return 0
    }
    const totalSeconds = state.value.config.duration * 60
    return Math.max(0, totalSeconds - state.value.remainingSeconds)
  })
  const finishedAt = computed(() => state.value.finishedAt)
  const hasSavedProgress = computed(() => state.value.status === 'in-progress' && totalQuestions.value > 0)
  const isExamActive = computed(() => state.value.status === 'in-progress')
  const isFinished = computed(() => state.value.status === 'finished')

  const sanitizeAnswer = (value: string | string[]): string | string[] | null => {
    if (Array.isArray(value)) {
      const cleaned = value.map((item) => item?.toString().trim()).filter((item) => !!item)
      return cleaned.length ? cleaned : null
    }
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed ? trimmed : null
    }
    return null
  }

  const prepareExam = (configInput: ExamConfig): PrepareResult => {
    const uniqueTypes = Array.from(new Set(configInput.questionTypes.filter((type) => QUESTION_TYPES.includes(type))))
    if (uniqueTypes.length === 0) {
      return { success: false, message: '请至少选择一个题型' }
    }

    const normalizedConfig: ExamConfig = {
      category: configInput.category,
      difficulty: configInput.difficulty,
      questionTypes: uniqueTypes,
      totalQuestions: Math.max(1, Math.round(configInput.totalQuestions)),
      duration: Math.max(MIN_DURATION, Math.round(configInput.duration))
    }

    const pool = questionBankStore.questions.filter((question: Question) => {
      const matchCategory = normalizedConfig.category === 'all' || question.category === normalizedConfig.category
      const matchDifficulty = normalizedConfig.difficulty === 'all' || question.difficulty === normalizedConfig.difficulty
      const matchType = normalizedConfig.questionTypes.includes(question.type)
      return matchCategory && matchDifficulty && matchType
    })

    if (pool.length === 0) {
      return { success: false, message: '题库中没有符合条件的题目，请调整筛选条件' }
    }

    if (pool.length < normalizedConfig.totalQuestions) {
      return {
        success: false,
        message: `符合条件的题目仅有 ${pool.length} 道，无法满足 ${normalizedConfig.totalQuestions} 道题的要求`
      }
    }

    const selected = shuffle(pool).slice(0, normalizedConfig.totalQuestions)

    state.value = {
      status: 'ready',
      config: normalizedConfig,
      questions: selected,
      currentIndex: 0,
      answers: {},
      marked: [],
      remainingSeconds: normalizedConfig.duration * 60,
      startTimestamp: null,
      lastTickAt: null,
      finishedAt: null
    }

    return { success: true, total: selected.length }
  }

  const startExam = () => {
    if (!state.value.questions.length) {
      return false
    }
    state.value.status = 'in-progress'
    if (!state.value.startTimestamp) {
      state.value.startTimestamp = Date.now()
    }
    state.value.lastTickAt = Date.now()
    return true
  }

  const finishExam = () => {
    if (state.value.status === 'finished') {
      return
    }
    state.value.status = 'finished'
    state.value.finishedAt = Date.now()
    state.value.lastTickAt = null
  }

  const clearProgress = () => {
    state.value = createDefaultState()
  }

  const decreaseRemainingSeconds = () => {
    if (state.value.status !== 'in-progress') {
      return state.value.remainingSeconds
    }

    if (state.value.remainingSeconds > 0) {
      state.value.remainingSeconds -= 1
      state.value.lastTickAt = Date.now()
    }

    if (state.value.remainingSeconds <= 0) {
      state.value.remainingSeconds = 0
      state.value.status = 'finished'
      state.value.finishedAt = Date.now()
      state.value.lastTickAt = null
    }

    return state.value.remainingSeconds
  }

  const setCurrentIndex = (index: number) => {
    if (!state.value.questions.length) {
      return
    }
    const clamped = Math.max(0, Math.min(index, state.value.questions.length - 1))
    state.value.currentIndex = clamped
  }

  const nextQuestion = () => {
    setCurrentIndex(state.value.currentIndex + 1)
  }

  const prevQuestion = () => {
    setCurrentIndex(state.value.currentIndex - 1)
  }

  const recordAnswer = (questionId: string, answer: string | string[]) => {
    if (!questionId) {
      return
    }
    const sanitized = sanitizeAnswer(answer)
    if (sanitized === null) {
      if (state.value.answers[questionId] !== undefined) {
        const { [questionId]: _removed, ...rest } = state.value.answers
        state.value.answers = rest
      }
      return
    }
    state.value.answers = {
      ...state.value.answers,
      [questionId]: Array.isArray(sanitized) ? [...sanitized] : sanitized
    }
  }

  const clearAnswer = (questionId: string) => {
    if (!questionId || state.value.answers[questionId] === undefined) {
      return
    }
    const { [questionId]: _removed, ...rest } = state.value.answers
    state.value.answers = rest
  }

  const getAnswer = (questionId: string) => state.value.answers[questionId]

  const isAnswered = (questionId: string) => Object.prototype.hasOwnProperty.call(state.value.answers, questionId)

  const toggleMark = (questionId: string) => {
    if (!questionId) {
      return
    }
    const set = new Set(state.value.marked)
    if (set.has(questionId)) {
      set.delete(questionId)
    } else {
      set.add(questionId)
    }
    state.value.marked = Array.from(set)
  }

  const isMarked = (questionId: string) => state.value.marked.includes(questionId)

  const getUnansweredIds = () => state.value.questions.filter((item) => !isAnswered(item.id)).map((item) => item.id)

  const isAnswerCorrect = (question: Question, answer: string | string[] | undefined): boolean => {
    if (answer === undefined) {
      return false
    }

    if (question.type === 'multiple') {
      if (!Array.isArray(question.answer)) {
        return false
      }
      const userAnswers = Array.isArray(answer) ? answer : [answer]
      if (userAnswers.length !== question.answer.length) {
        return false
      }
      const correct = question.answer.map((value) => normalizeChoice(String(value))).sort()
      const user = userAnswers.map((value) => normalizeChoice(String(value))).sort()
      return correct.every((item, index) => item === user[index])
    }

    const correctAnswer = Array.isArray(question.answer) ? question.answer[0] : question.answer
    const userAnswer = Array.isArray(answer) ? answer[0] : answer

    if (typeof correctAnswer !== 'string' || typeof userAnswer !== 'string') {
      return false
    }

    if (question.type === 'fill') {
      return normalizeText(correctAnswer) === normalizeText(userAnswer)
    }

    return normalizeChoice(correctAnswer) === normalizeChoice(userAnswer)
  }

  const statistics = computed<ExamStatistics>(() => {
    const summary: ExamStatistics = {
      totalQuestions: totalQuestions.value,
      answered: answeredCount.value,
      marked: markedCount.value,
      correctCount: 0,
      totalScore: 0,
      obtainedScore: 0,
      accuracy: 0,
      usedSeconds: usedSeconds.value
    }

    if (!state.value.questions.length) {
      return summary
    }

    state.value.questions.forEach((question) => {
      summary.totalScore += question.score || 0
      const answer = state.value.answers[question.id]
      if (isAnswerCorrect(question, answer)) {
        summary.correctCount += 1
        summary.obtainedScore += question.score || 0
      }
    })

    if (summary.totalQuestions > 0) {
      summary.accuracy = Math.round((summary.correctCount / summary.totalQuestions) * 100)
    }

    return summary
  })

  // 历史记录管理
  const loadHistory = (): ExamRecord[] => {
    if (!canUseStorage()) return []
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY)
      if (!raw) return []
      return JSON.parse(raw) as ExamRecord[]
    } catch (error) {
      console.error('加载历史记录失败', error)
      return []
    }
  }

  const saveHistory = (records: ExamRecord[]) => {
    if (!canUseStorage()) return
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(records))
    } catch (error) {
      console.error('保存历史记录失败', error)
    }
  }

  const history = ref<ExamRecord[]>(loadHistory())

  const addHistoryRecord = () => {
    if (state.value.status !== 'finished' || !state.value.config) return

    const record: ExamRecord = {
      id: Date.now().toString(),
      title: state.value.config.category === 'all' ? '综合练习' : state.value.config.category,
      date: state.value.finishedAt || Date.now(),
      score: statistics.value.obtainedScore,
      totalScore: statistics.value.totalScore,
      correctCount: statistics.value.correctCount,
      totalQuestions: statistics.value.totalQuestions,
      accuracy: statistics.value.accuracy,
      usedSeconds: statistics.value.usedSeconds,
      config: {
        category: state.value.config.category,
        difficulty: state.value.config.difficulty,
        questionTypes: [...state.value.config.questionTypes],
        duration: state.value.config.duration
      },
      questions: [...state.value.questions],
      answers: { ...state.value.answers }
    }

    history.value = [record, ...history.value].slice(0, 50) // 保留最近50条记录
    saveHistory(history.value)

    // 同时更新错题本
    updateWrongQuestions()
  }

  const deleteHistoryRecord = (id: string) => {
    history.value = history.value.filter((record) => record.id !== id)
    saveHistory(history.value)
  }

  const clearHistory = () => {
    history.value = []
    saveHistory([])
  }

  // 错题本管理
  const loadWrongQuestions = (): WrongQuestion[] => {
    if (!canUseStorage()) return []
    try {
      const raw = window.localStorage.getItem(WRONG_QUESTIONS_KEY)
      if (!raw) return []
      return JSON.parse(raw) as WrongQuestion[]
    } catch (error) {
      console.error('加载错题本失败', error)
      return []
    }
  }

  const saveWrongQuestions = (questions: WrongQuestion[]) => {
    if (!canUseStorage()) return
    try {
      window.localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(questions))
    } catch (error) {
      console.error('保存错题本失败', error)
    }
  }

  const wrongQuestions = ref<WrongQuestion[]>(loadWrongQuestions())

  const updateWrongQuestions = () => {
    const wrongMap = new Map<string, WrongQuestion>()
    wrongQuestions.value.forEach((wq) => wrongMap.set(wq.question.id, wq))

    state.value.questions.forEach((question) => {
      const answer = state.value.answers[question.id]
      const isCorrect = isAnswerCorrect(question, answer)

      if (!isCorrect && answer !== undefined) {
        const existing = wrongMap.get(question.id)
        if (existing) {
          existing.wrongCount += 1
          existing.lastWrongTime = Date.now()
          existing.userAnswer = answer
          existing.isResolved = false
        } else {
          wrongMap.set(question.id, {
            id: question.id,
            question: { ...question },
            userAnswer: answer,
            wrongCount: 1,
            lastWrongTime: Date.now(),
            isResolved: false
          })
        }
      } else if (isCorrect) {
        const existing = wrongMap.get(question.id)
        if (existing) {
          existing.isResolved = true
        }
      }
    })

    wrongQuestions.value = Array.from(wrongMap.values()).sort((a, b) => b.lastWrongTime - a.lastWrongTime)
    saveWrongQuestions(wrongQuestions.value)
  }

  const deleteWrongQuestion = (id: string) => {
    wrongQuestions.value = wrongQuestions.value.filter((wq) => wq.id !== id)
    saveWrongQuestions(wrongQuestions.value)
  }

  const clearWrongQuestions = () => {
    wrongQuestions.value = []
    saveWrongQuestions([])
  }

  const markWrongQuestionResolved = (id: string) => {
    const wq = wrongQuestions.value.find((item) => item.id === id)
    if (wq) {
      wq.isResolved = true
      saveWrongQuestions(wrongQuestions.value)
    }
  }

  // 答案查看模式
  const loadViewMode = (): ViewMode => {
    if (!canUseStorage()) return 'exam'
    try {
      const raw = window.localStorage.getItem(VIEW_MODE_KEY)
      if (!raw) return 'exam'
      return (raw as ViewMode) || 'exam'
    } catch (error) {
      return 'exam'
    }
  }

  const saveViewMode = (mode: ViewMode) => {
    if (!canUseStorage()) return
    try {
      window.localStorage.setItem(VIEW_MODE_KEY, mode)
    } catch (error) {
      console.error('保存查看模式失败', error)
    }
  }

  const viewMode = ref<ViewMode>(loadViewMode())

  const setViewMode = (mode: ViewMode) => {
    viewMode.value = mode
    saveViewMode(mode)
  }

  // 重写 finishExam 以自动保存历史记录
  const originalFinishExam = finishExam
  const enhancedFinishExam = () => {
    originalFinishExam()
    addHistoryRecord()
  }

  return {
    status,
    config,
    questionList,
    totalQuestions,
    currentQuestion,
    currentIndex,
    answeredCount,
    markedCount,
    progress,
    remainingSeconds,
    usedSeconds,
    finishedAt,
    hasSavedProgress,
    isExamActive,
    isFinished,
    statistics,
    prepareExam,
    startExam,
    finishExam: enhancedFinishExam,
    clearProgress,
    decreaseRemainingSeconds,
    setCurrentIndex,
    nextQuestion,
    prevQuestion,
    recordAnswer,
    clearAnswer,
    getAnswer,
    isAnswered,
    toggleMark,
    isMarked,
    getUnansweredIds,
    isAnswerCorrect,
    // 历史记录
    history,
    deleteHistoryRecord,
    clearHistory,
    // 错题本
    wrongQuestions,
    deleteWrongQuestion,
    clearWrongQuestions,
    markWrongQuestionResolved,
    // 答案查看模式
    viewMode,
    setViewMode
  }
})
