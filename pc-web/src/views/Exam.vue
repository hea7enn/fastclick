<template>
  <div class="page-container exam-page">
    <div class="page-title">
      <el-icon><Edit /></el-icon>
      智能答题中心
    </div>

    <transition name="fade" mode="out-in">
      <div v-if="showExamContent" key="exam" class="exam-content">
        <div class="exam-main">
          <el-card class="content-card status-card" shadow="hover">
            <div class="status-left">
              <div class="status-title">答题进度</div>
              <div class="status-progress">
                <span class="status-count">{{ answeredCount }} / {{ totalQuestions }}</span>
                <el-progress :percentage="progress" :stroke-width="12" />
              </div>
            </div>
            <div class="status-right">
              <div class="timer" :class="{ danger: remainingSeconds <= 60 }">
                <el-icon><Clock /></el-icon>
                <span>剩余时间：{{ formattedRemainingTime }}</span>
              </div>
              <el-tag type="warning" effect="plain">已标记 {{ markedCount }}</el-tag>
            </div>
          </el-card>

          <el-card v-if="currentQuestion" class="content-card question-card" shadow="hover">
            <template #header>
              <div class="question-header">
                <div class="question-meta">
                  <el-tag type="primary">{{ getTypeLabel(currentQuestion.type) }}</el-tag>
                  <el-tag :type="getDifficultyType(currentQuestion.difficulty)" effect="plain">
                    {{ getDifficultyLabel(currentQuestion.difficulty) }}
                  </el-tag>
                  <el-tag type="info" effect="plain">{{ currentQuestion.score }} 分</el-tag>
                </div>
                <div class="question-actions">
                  <el-button text size="small" :type="isCurrentMarked ? 'warning' : 'info'" @click="handleToggleMark">
                    <el-icon><Flag /></el-icon>
                    {{ isCurrentMarked ? '取消标记' : '标记此题' }}
                  </el-button>
                </div>
              </div>
            </template>

            <div class="question-body">
              <div class="question-title">
                <span class="question-index">第 {{ currentIndex + 1 }} 题</span>
                <span v-if="currentQuestion.category" class="question-category">分类：{{ currentQuestion.category }}</span>
              </div>
              <p class="question-text">{{ currentQuestion.question }}</p>

              <component
                v-if="currentComponent"
                :is="currentComponent"
                v-model="currentAnswer"
                :question="currentQuestion"
                :key="currentQuestion.id"
              />
              <el-empty v-else description="暂不支持该题型" />
            </div>

            <template #footer>
              <div class="question-footer">
                <div class="footer-left">
                  <el-tag effect="plain">已作答 {{ answeredCount }}/{{ totalQuestions }}</el-tag>
                  <el-tag v-if="isCurrentMarked" type="warning" effect="dark">已标记</el-tag>
                </div>
                <div class="footer-right">
                  <el-button @click="handlePrev" :disabled="currentIndex === 0">上一题</el-button>
                  <el-button @click="handleNext" :disabled="currentIndex >= totalQuestions - 1">下一题</el-button>
                  <el-button type="success" @click="handleSubmit">
                    <el-icon><CircleCheck /></el-icon>
                    提交答卷
                  </el-button>
                </div>
              </div>
            </template>
          </el-card>

          <el-alert v-else title="题目数据缺失，请返回重新开始考试" type="warning" show-icon />
        </div>

        <div class="exam-sidebar">
          <el-card class="content-card sheet-card" shadow="hover">
            <template #header>
              <div class="sheet-header">
                <span>答题卡</span>
                <div class="sheet-legend">
                  <span class="legend-item">
                    <span class="dot answered" />
                    已作答
                  </span>
                  <span class="legend-item">
                    <span class="dot marked" />
                    已标记
                  </span>
                </div>
              </div>
            </template>

            <div class="sheet-grid">
              <div
                v-for="(question, index) in questionList"
                :key="question.id"
                class="sheet-item"
                :class="{
                  active: index === currentIndex,
                  answered: examStore.isAnswered(question.id),
                  marked: examStore.isMarked(question.id)
                }"
                @click="handleJump(index)"
              >
                {{ index + 1 }}
              </div>
            </div>

            <div class="sheet-actions">
              <el-button text @click="handleClearAnswer" :disabled="!currentQuestion">清除当前答案</el-button>
              <el-button text type="danger" @click="handleSubmit">提交答卷</el-button>
            </div>
          </el-card>

          <el-card class="content-card summary-card" shadow="hover">
            <template #header>答题概览</template>
            <div class="summary-info">
              <div class="summary-item">
                <span class="label">题目数量</span>
                <span class="value">{{ totalQuestions }}</span>
              </div>
              <div class="summary-item">
                <span class="label">已作答</span>
                <span class="value">{{ answeredCount }}</span>
              </div>
              <div class="summary-item">
                <span class="label">已标记</span>
                <span class="value">{{ markedCount }}</span>
              </div>
              <div class="summary-item">
                <span class="label">已用时</span>
                <span class="value">{{ usedTimeText }}</span>
              </div>
              <div class="summary-item">
                <span class="label">剩余时间</span>
                <span class="value" :class="{ danger: remainingSeconds <= 60 }">{{ formattedRemainingTime }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div v-else-if="showFinishedPanel" key="finished" class="exam-finished">
        <el-result
          icon="success"
          title="答题已完成"
          sub-title="成绩已保存，快去看看自己的表现吧！"
        >
          <template #extra>
            <div class="finished-actions">
              <el-button type="primary" round @click="goResult">
                <el-icon><TrendCharts /></el-icon>
                查看成绩
              </el-button>
              <el-button round @click="handleStartNew">
                <el-icon><Refresh /></el-icon>
                重新组卷
              </el-button>
            </div>
          </template>
        </el-result>

        <el-card class="content-card finished-summary" shadow="hover">
          <div class="summary-grid">
            <div class="summary-block">
              <span class="label">总题数</span>
              <span class="value">{{ statistics.totalQuestions }}</span>
            </div>
            <div class="summary-block">
              <span class="label">已作答</span>
              <span class="value">{{ statistics.answered }}</span>
            </div>
            <div class="summary-block">
              <span class="label">正确题数</span>
              <span class="value">{{ statistics.correctCount }}</span>
            </div>
            <div class="summary-block">
              <span class="label">得分</span>
              <span class="value highlight">{{ statistics.obtainedScore }} / {{ statistics.totalScore }}</span>
            </div>
            <div class="summary-block">
              <span class="label">正确率</span>
              <span class="value">{{ statistics.accuracy }}%</span>
            </div>
            <div class="summary-block">
              <span class="label">用时</span>
              <span class="value">{{ usedTimeText }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <div v-else key="start" class="exam-start">
        <el-row :gutter="24">
          <el-col :xs="24" :lg="14">
            <el-card class="content-card start-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Filter /></el-icon>
                  设置答题条件
                </div>
              </template>

              <el-form ref="formRef" :model="formState" :rules="formRules" label-width="96px" label-position="left">
                <el-form-item label="题目分类">
                  <el-select v-model="formState.category" placeholder="请选择分类">
                    <el-option label="全部分类" value="all" />
                    <el-option
                      v-for="category in categories"
                      :key="category"
                      :label="category"
                      :value="category"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="难度级别">
                  <el-select v-model="formState.difficulty" placeholder="请选择难度">
                    <el-option label="不限难度" value="all" />
                    <el-option label="简单" value="easy" />
                    <el-option label="中等" value="medium" />
                    <el-option label="困难" value="hard" />
                  </el-select>
                </el-form-item>

                <el-form-item label="题型选择" prop="questionTypes">
                  <el-checkbox-group v-model="formState.questionTypes" class="type-group">
                    <el-checkbox v-for="option in questionTypeOptions" :key="option.value" :label="option.value">
                      <span class="checkbox-label">{{ option.label }}</span>
                      <el-tag size="small" effect="plain" type="info">
                        {{ questionTypeStats[option.value] ?? 0 }}
                      </el-tag>
                    </el-checkbox>
                  </el-checkbox-group>
                  <p class="form-hint">勾选希望出现的题型，默认包含全部题型。</p>
                </el-form-item>

                <el-form-item label="题目数量" prop="totalQuestions">
                  <div class="question-count-control">
                    <el-slider
                      v-model="formState.totalQuestions"
                      :min="1"
                      :max="questionCountMax"
                      :disabled="availableCount === 0"
                      show-stops
                    />
                    <el-input-number
                      v-model="formState.totalQuestions"
                      :min="1"
                      :max="questionCountMax"
                      :disabled="availableCount === 0"
                    />
                  </div>
                  <p class="form-hint">
                    当前条件下共 {{ availableCount }} 道题，可选择 1~{{ availableCount || 1 }} 道。
                  </p>
                </el-form-item>

                <el-form-item label="考试时长（分钟）" prop="duration">
                  <el-input-number v-model="formState.duration" :min="5" :max="240" :step="5" />
                  <p class="form-hint">建议每道题预留 1~2 分钟，默认 30 分钟。</p>
                </el-form-item>

                <el-form-item>
                  <div class="start-actions">
                    <el-button
                      type="primary"
                      size="large"
                      round
                      :disabled="startDisabled"
                      @click="handleStart"
                    >
                      <el-icon><Check /></el-icon>
                      开始答题
                    </el-button>
                    <el-button size="large" round @click="handleResetForm">重置条件</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>

          <el-col :xs="24" :lg="10">
            <el-card class="content-card info-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><List /></el-icon>
                  题库概况
                </div>
              </template>

              <div class="info-body">
                <el-alert
                  v-if="availableCount === 0"
                  type="warning"
                  title="没有找到符合条件的题目，请调整筛选条件或补充题库。"
                  show-icon
                  :closable="false"
                />
                <div v-else class="info-stats">
                  <div class="info-stat">
                    <span class="label">可用题目</span>
                    <span class="value">{{ availableCount }}</span>
                  </div>
                  <div class="info-stat" v-for="option in questionTypeOptions" :key="option.value">
                    <span class="label">{{ option.label }}</span>
                    <span class="value">{{ questionTypeStats[option.value] ?? 0 }}</span>
                  </div>
                </div>
              </div>
            </el-card>

            <el-card v-if="canResume" class="content-card resume-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Timer /></el-icon>
                  发现未完成的答题
                  <el-tag type="warning" size="small" effect="light">待继续</el-tag>
                </div>
              </template>

              <div class="resume-content">
                <div class="resume-stats">
                  <div class="resume-item">
                    <span class="label">题目总数</span>
                    <span class="value">{{ totalQuestions }}</span>
                  </div>
                  <div class="resume-item">
                    <span class="label">已作答</span>
                    <span class="value">{{ answeredCount }}</span>
                  </div>
                  <div class="resume-item">
                    <span class="label">剩余时间</span>
                    <span class="value">{{ formattedRemainingTime }}</span>
                  </div>
                </div>

                <el-progress :percentage="progress" :stroke-width="10" />

                <div class="resume-actions">
                  <el-button type="primary" round @click="handleResume">
                    <el-icon><Refresh /></el-icon>
                    继续答题
                  </el-button>
                  <el-button text type="danger" @click="handleResetProgress">清除进度</el-button>
                </div>
              </div>
            </el-card>

            <el-card v-else-if="questionBankEmpty" class="content-card empty-card" shadow="hover">
              <p>当前题库为空，请先前往题库管理页面添加题目。</p>
              <el-button type="primary" text @click="goQuestionBank">
                <el-icon><Document /></el-icon>
                前往题库管理
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onBeforeUnmount } from 'vue'
import type { Component } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { storeToRefs } from 'pinia'
import SingleChoice from '@/components/exam/SingleChoice.vue'
import MultipleChoice from '@/components/exam/MultipleChoice.vue'
import JudgeQuestion from '@/components/exam/JudgeQuestion.vue'
import FillQuestion from '@/components/exam/FillQuestion.vue'
import { useExamStore, useQuestionBankStore } from '@/stores'
import {
  questionTypeNameMap,
  difficultyNameMap,
  type QuestionType,
  type DifficultyLevel
} from '@/types/question'

const router = useRouter()
const examStore = useExamStore()
const questionBankStore = useQuestionBankStore()

const { categories, questions } = storeToRefs(questionBankStore)
const {
  status,
  config,
  questionList,
  currentQuestion,
  currentIndex,
  totalQuestions,
  answeredCount,
  markedCount,
  progress,
  remainingSeconds,
  usedSeconds,
  statistics
} = storeToRefs(examStore)

const questionTypeOptions: Array<{ label: string; value: QuestionType }> = [
  { label: questionTypeNameMap.single, value: 'single' },
  { label: questionTypeNameMap.multiple, value: 'multiple' },
  { label: questionTypeNameMap.judge, value: 'judge' },
  { label: questionTypeNameMap.fill, value: 'fill' }
]

const formRef = ref<FormInstance>()
const formState = reactive({
  category: 'all' as string | 'all',
  difficulty: 'all' as DifficultyLevel | 'all',
  questionTypes: questionTypeOptions.map((item) => item.value) as QuestionType[],
  totalQuestions: 10,
  duration: 30
})

const availableQuestions = computed(() => {
  const list = questions.value ?? []
  return list.filter((question) => {
    const matchCategory = formState.category === 'all' || question.category === formState.category
    const matchDifficulty = formState.difficulty === 'all' || question.difficulty === formState.difficulty
    const matchType = formState.questionTypes.includes(question.type)
    return matchCategory && matchDifficulty && matchType
  })
})

const availableCount = computed(() => availableQuestions.value.length)

const questionTypeStats = computed<Record<QuestionType, number>>(() => {
  return availableQuestions.value.reduce(
    (acc, question) => {
      acc[question.type] = (acc[question.type] || 0) + 1
      return acc
    },
    { single: 0, multiple: 0, judge: 0, fill: 0 } as Record<QuestionType, number>
  )
})

const questionCountMax = computed(() => Math.max(availableCount.value, 1))
const questionBankEmpty = computed(() => questions.value.length === 0)
const canResume = computed(() => status.value === 'ready' && questionList.value.length > 0)
const showExamContent = computed(() => status.value === 'in-progress')
const showFinishedPanel = computed(() => status.value === 'finished')

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const formattedRemainingTime = computed(() => formatTime(remainingSeconds.value))
const usedTimeText = computed(() => formatTime(usedSeconds.value))

const questionComponentMap: Record<QuestionType, Component> = {
  single: SingleChoice,
  multiple: MultipleChoice,
  judge: JudgeQuestion,
  fill: FillQuestion
}

const currentComponent = computed<Component | null>(() => {
  const question = currentQuestion.value
  if (!question) {
    return null
  }
  return questionComponentMap[question.type] ?? null
})

const currentAnswer = computed<string | string[]>({
  get: () => {
    const question = currentQuestion.value
    if (!question) {
      return ''
    }
    const stored = examStore.getAnswer(question.id)
    if (question.type === 'multiple') {
      return Array.isArray(stored) ? [...stored] : []
    }
    if (typeof stored === 'string') {
      return stored
    }
    if (Array.isArray(stored)) {
      return stored[0] ?? ''
    }
    return ''
  },
  set: (value) => {
    const question = currentQuestion.value
    if (!question) {
      return
    }
    if (question.type === 'multiple') {
      const payload = Array.isArray(value) ? value : value ? [value as string] : []
      examStore.recordAnswer(question.id, payload)
    } else {
      const payload = Array.isArray(value) ? value[0] ?? '' : value
      examStore.recordAnswer(question.id, payload as string)
    }
  }
})

const isCurrentMarked = computed(() => {
  const question = currentQuestion.value
  if (!question) {
    return false
  }
  return examStore.isMarked(question.id)
})

const unansweredQuestions = computed(() => questionList.value.filter((question) => !examStore.isAnswered(question.id)))
const unansweredCount = computed(() => unansweredQuestions.value.length)

const startDisabled = computed(() => {
  if (!formState.questionTypes.length) {
    return true
  }
  if (availableCount.value === 0) {
    return true
  }
  if (formState.totalQuestions < 1 || formState.totalQuestions > availableCount.value) {
    return true
  }
  if (formState.duration < 5) {
    return true
  }
  return false
})

const formRules: FormRules = {
  questionTypes: [
    {
      validator: (_rule, value, callback) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          callback(new Error('请至少选择一个题型'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  totalQuestions: [
    {
      validator: (_rule, value, callback) => {
        if (!value || value < 1) {
          callback(new Error('题目数量至少为 1'))
          return
        }
        if (availableCount.value === 0) {
          callback(new Error('当前条件下没有可用题目'))
          return
        }
        if (value > availableCount.value) {
          callback(new Error(`最多只能选择 ${availableCount.value} 道题`))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  duration: [
    {
      validator: (_rule, value, callback) => {
        if (!value || value < 5) {
          callback(new Error('考试时长至少 5 分钟'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ]
}

const getTypeLabel = (type: QuestionType) => questionTypeNameMap[type] ?? type

const getDifficultyLabel = (difficulty: DifficultyLevel) => difficultyNameMap[difficulty] ?? difficulty

const getDifficultyType = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'danger'
    default:
      return 'info'
  }
}

let timer: number | null = null
let submitting = false

const stopTimer = () => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

const handleAutoSubmit = () => {
  if (submitting) {
    return
  }
  submitting = true
  finishExamState()
  ElMessageBox.alert('考试时间到啦，系统已经自动提交答卷。', '时间到', {
    confirmButtonText: '查看成绩',
    type: 'warning'
  }).then(() => {
    goResult().finally(() => {
      submitting = false
    })
  })
}

const startTimer = () => {
  stopTimer()
  if (remainingSeconds.value <= 0) {
    handleAutoSubmit()
    return
  }
  timer = window.setInterval(() => {
    const remain = examStore.decreaseRemainingSeconds()
    if (remain <= 0) {
      stopTimer()
      handleAutoSubmit()
    }
  }, 1000)
}

const finishExamState = () => {
  examStore.finishExam()
  stopTimer()
}

const handleStart = async () => {
  if (!formRef.value) {
    return
  }
  try {
    const valid = await formRef.value.validate()
    if (!valid) {
      return
    }
  } catch (error) {
    return
  }
  const result = examStore.prepareExam({
    category: formState.category,
    difficulty: formState.difficulty,
    questionTypes: [...formState.questionTypes],
    totalQuestions: formState.totalQuestions,
    duration: formState.duration
  })
  if (!result.success) {
    ElMessage.warning(result.message ?? '题目准备失败，请稍后再试')
    return
  }
  examStore.startExam()
  startTimer()
  ElMessage.success('考试开始啦，祝你旗开得胜！')
}

const handleResume = () => {
  if (submitting) {
    return
  }
  if (examStore.startExam()) {
    startTimer()
    ElMessage.success('已恢复答题进度，继续冲刺！')
  }
}

const handleResetProgress = () => {
  ElMessageBox.confirm('确定要清除当前保存的答题进度吗？', '清除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '再想想',
    type: 'warning'
  })
    .then(() => {
      examStore.clearProgress()
      stopTimer()
      handleResetForm()
      ElMessage.success('已清空历史答题进度')
    })
    .catch(() => undefined)
}

const handleResetForm = () => {
  formState.category = 'all'
  formState.difficulty = 'all'
  formState.questionTypes = questionTypeOptions.map((item) => item.value)
  formState.totalQuestions = availableCount.value > 0 ? Math.min(availableCount.value, 10) : 1
  formState.duration = 30
}

const handlePrev = () => {
  examStore.prevQuestion()
}

const handleNext = () => {
  examStore.nextQuestion()
}

const handleToggleMark = () => {
  const question = currentQuestion.value
  if (!question) {
    return
  }
  examStore.toggleMark(question.id)
}

const handleJump = (index: number) => {
  examStore.setCurrentIndex(index)
}

const handleSubmit = () => {
  if (submitting) {
    return
  }
  const message =
    unansweredCount.value > 0
      ? `还有 ${unansweredCount.value} 道题未作答，确认直接提交吗？`
      : '确认提交本次答卷吗？'
  ElMessageBox.confirm(message, '提交确认', {
    confirmButtonText: '确认提交',
    cancelButtonText: '再检查一下',
    type: 'warning'
  })
    .then(() => {
      submitting = true
      finishExamState()
      ElMessage.success('提交成功，准备查看成绩吧～')
      goResult().finally(() => {
        submitting = false
      })
    })
    .catch(() => undefined)
}

const handleClearAnswer = () => {
  const question = currentQuestion.value
  if (!question) {
    return
  }
  if (!examStore.isAnswered(question.id)) {
    ElMessage.info('本题还没有作答哦～')
    return
  }
  examStore.clearAnswer(question.id)
  ElMessage.success('已清除该题的答案')
}

const handleStartNew = () => {
  examStore.clearProgress()
  stopTimer()
  handleResetForm()
  ElMessage.success('旧卷已清空，重新设置条件再出发吧！')
}

const goResult = () => router.push('/result')
const goQuestionBank = () => router.push('/question-bank')

watch(
  () => status.value,
  (value) => {
    if (value === 'in-progress') {
      if (remainingSeconds.value > 0) {
        startTimer()
      }
    } else {
      stopTimer()
      submitting = false
    }
  },
  { immediate: true }
)

watch(
  () => config.value,
  (val) => {
    if (!val) {
      return
    }
    formState.category = val.category
    formState.difficulty = val.difficulty
    formState.questionTypes = [...val.questionTypes]
    formState.totalQuestions = val.totalQuestions
    formState.duration = val.duration
  },
  { immediate: true }
)

watch(availableCount, (count) => {
  if (count > 0 && formState.totalQuestions > count) {
    formState.totalQuestions = count
  }
})

onBeforeUnmount(() => {
  stopTimer()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.exam-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.exam-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: $spacing-lg;
}

.exam-main,
.exam-sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.exam-sidebar {
  position: sticky;
  top: $spacing-lg;
  align-self: flex-start;
}

.status-card {
  display: flex;
  justify-content: space-between;
  gap: $spacing-lg;

  :deep(.el-card__body) {
    display: flex;
    justify-content: space-between;
    gap: $spacing-lg;
    align-items: center;
    width: 100%;
  }

  .status-left {
    flex: 1;

    .status-title {
      font-size: 16px;
      color: $text-secondary;
      margin-bottom: $spacing-sm;
    }

    .status-progress {
      display: flex;
      align-items: center;
      gap: $spacing-md;

      .status-count {
        font-size: 24px;
        font-weight: 700;
        color: $text-primary;
      }

      :deep(.el-progress) {
        flex: 1;
      }
    }
  }

  .status-right {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .timer {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-weight: 600;
      color: $primary-color;

      &.danger {
        color: $danger-color;
      }
    }
  }
}

.question-card {
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $spacing-md;

    .question-meta {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;
    }

    .question-actions {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }
  }

  .question-body {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;

    .question-title {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;

      .question-index {
        color: $primary-color;
      }

      .question-category {
        font-size: 14px;
        color: $text-secondary;
      }
    }

    .question-text {
      font-size: 18px;
      line-height: 1.8;
      color: $text-regular;
      margin: 0;
      white-space: pre-wrap;
    }
  }

  .question-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $spacing-md;
    flex-wrap: wrap;

    .footer-left {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      flex-wrap: wrap;
    }
  }
}

.sheet-card {
  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .sheet-legend {
      display: flex;
      gap: $spacing-sm;
      font-size: 12px;
      color: $text-secondary;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: $border-color;

          &.answered {
            background-color: $success-color;
          }

          &.marked {
            background-color: $warning-color;
          }
        }
      }
    }
  }

  .sheet-grid {
    margin-top: $spacing-md;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: $spacing-sm;
  }

  .sheet-item {
    height: 48px;
    border-radius: $border-radius-base;
    border: 2px solid $border-base;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    cursor: pointer;
    transition: $transition-base;
    color: $text-secondary;

    &.active {
      border-color: $primary-color;
      color: $primary-color;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
    }

    &.answered {
      border-color: $success-color;
      background: rgba($success-color, 0.15);
      color: $success-color;
    }

    &.marked {
      position: relative;
      border-color: $warning-color;

      &::after {
        content: '';
        position: absolute;
        top: 6px;
        right: 6px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: $warning-color;
      }
    }

    &.answered.marked {
      border-color: $primary-color;
      background: $primary-gradient;
      color: #ffffff;
    }
  }

  .sheet-actions {
    margin-top: $spacing-md;
    display: flex;
    justify-content: space-between;
  }
}

.summary-card {
  .summary-info {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $spacing-md;

    .summary-item {
      background: $bg-lighter;
      border-radius: $border-radius-base;
      padding: $spacing-md;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .label {
        font-size: 12px;
        color: $text-secondary;
      }

      .value {
        font-size: 18px;
        font-weight: 700;
        color: $text-primary;

        &.danger {
          color: $danger-color;
        }
      }
    }
  }
}

.exam-start {
  .start-card {
    .type-group {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;

      :deep(.el-checkbox) {
        min-width: 48%;
      }

      :deep(.el-checkbox__label) {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
      }
    }

    .question-count-control {
      display: grid;
      grid-template-columns: 1fr 140px;
      gap: $spacing-md;
      align-items: center;
    }

    .form-hint {
      margin-top: 6px;
      font-size: 12px;
      color: $text-secondary;
    }

    .start-actions {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-md;
    }
  }

  .info-card {
    .info-body {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
    }

    .info-stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: $spacing-md;
    }

    .info-stat {
      background: $bg-lighter;
      border-radius: $border-radius-base;
      padding: $spacing-md;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .label {
        font-size: 12px;
        color: $text-secondary;
      }

      .value {
        font-size: 20px;
        font-weight: 700;
        color: $text-primary;
      }
    }
  }

  .resume-card {
    .resume-content {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
    }

    .resume-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: $spacing-sm;
    }

    .resume-item {
      background: $bg-lighter;
      border-radius: $border-radius-base;
      padding: $spacing-sm;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .label {
        font-size: 12px;
        color: $text-secondary;
      }

      .value {
        font-weight: 600;
        color: $text-primary;
      }
    }

    .resume-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: $spacing-sm;
      flex-wrap: wrap;
    }
  }

  .empty-card {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    font-size: 14px;
    color: $text-secondary;
  }
}

.exam-finished {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  align-items: center;
  text-align: center;

  .finished-actions {
    display: flex;
    justify-content: center;
    gap: $spacing-md;
  }

  .finished-summary {
    width: 100%;
    max-width: 720px;

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: $spacing-md;
    }

    .summary-block {
      background: $bg-lighter;
      border-radius: $border-radius-base;
      padding: $spacing-md;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .label {
        font-size: 12px;
        color: $text-secondary;
      }

      .value {
        font-size: 20px;
        font-weight: 700;
        color: $text-primary;

        &.highlight {
          color: $primary-color;
        }
      }
    }
  }
}

@media (max-width: 1280px) {
  .exam-content {
    grid-template-columns: 1fr;
  }

  .exam-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .status-card {
    :deep(.el-card__body) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .question-card .question-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .sheet-card .sheet-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .summary-card .summary-info {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .exam-start .start-card .question-count-control {
    grid-template-columns: 1fr;
  }

  .exam-start .start-card .type-group {
    :deep(.el-checkbox) {
      min-width: 100%;
    }
  }

  .exam-start .resume-card .resume-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
