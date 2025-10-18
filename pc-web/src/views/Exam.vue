<template>
  <div class="page-container exam-page">
    <div v-if="!examStarted" class="exam-start">
      <el-card class="content-card start-card">
        <div class="start-content">
          <div class="start-icon">
            <el-icon :size="80" color="#409EFF"><Edit /></el-icon>
          </div>
          <h2 class="start-title">准备开始答题</h2>
          <p class="start-desc">本次测试共 {{ totalQuestions }} 道题，限时 {{ timeLimit }} 分钟</p>

          <el-divider />

          <div class="exam-rules">
            <h3 class="rules-title">考试规则</h3>
            <ul class="rules-list">
              <li>请在规定时间内完成所有题目</li>
              <li>答题过程中请保持网络连接</li>
              <li>可以随时保存答题进度</li>
              <li>提交后将无法修改答案</li>
            </ul>
          </div>

          <div class="start-actions">
            <el-button type="primary" size="large" round @click="startExam">
              <el-icon><Check /></el-icon>
              确认并开始
            </el-button>
            <el-button size="large" round @click="goBack">取消</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div v-else class="exam-content">
      <div class="exam-header">
        <el-card class="header-card">
          <div class="exam-progress">
            <span class="progress-text">进度：{{ currentQuestion }}/{{ totalQuestions }}</span>
            <el-progress
              :percentage="(currentQuestion / totalQuestions) * 100"
              :stroke-width="12"
              :text-inside="true"
            />
          </div>
          <div class="exam-timer">
            <el-icon><Clock /></el-icon>
            <span class="timer-text">剩余时间：{{ formatTime(timeRemaining) }}</span>
          </div>
        </el-card>
      </div>

      <div class="question-area">
        <el-card class="content-card question-card">
          <template #header>
            <div class="question-header">
              <span class="question-number">第 {{ currentQuestion }} 题</span>
              <el-tag :type="getDifficultyType(currentQuestionData.difficulty)">
                {{ getDifficultyLabel(currentQuestionData.difficulty) }}
              </el-tag>
            </div>
          </template>

          <div class="question-content">
            <h3 class="question-title">{{ currentQuestionData.title }}</h3>
            <el-radio-group v-model="currentAnswer" class="options-group">
              <el-radio
                v-for="(option, index) in currentQuestionData.options"
                :key="index"
                :label="option.value"
                class="option-item"
                border
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>
          </div>

          <template #footer>
            <div class="question-actions">
              <el-button :disabled="currentQuestion === 1" @click="prevQuestion">上一题</el-button>
              <el-button type="primary" v-if="currentQuestion < totalQuestions" @click="nextQuestion">
                下一题
              </el-button>
              <el-button type="success" v-else @click="submitExam">提交答卷</el-button>
            </div>
          </template>
        </el-card>

        <el-card class="content-card sheet-card">
          <template #header>答题卡</template>
          <div class="answer-sheet">
            <div
              v-for="index in totalQuestions"
              :key="index"
              class="sheet-item"
              :class="{ active: index === currentQuestion, answered: answers[index] }"
              @click="jumpToQuestion(index)"
            >
              {{ index }}
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const examStarted = ref(false)
const totalQuestions = ref(10)
const timeLimit = ref(30)
const timeRemaining = ref(1800)
const currentQuestion = ref(1)
const currentAnswer = ref('')
const answers = ref<Record<number, string>>({})

let timer: ReturnType<typeof setInterval> | null = null

const currentQuestionData = computed(() => {
  return {
    title: `示例题目 ${currentQuestion.value}：这是一道测试题目？`,
    difficulty: currentQuestion.value % 3 === 0 ? 'hard' : currentQuestion.value % 2 === 0 ? 'medium' : 'easy',
    options: [
      { value: 'A', label: 'A. 选项 A' },
      { value: 'B', label: 'B. 选项 B' },
      { value: 'C', label: 'C. 选项 C' },
      { value: 'D', label: 'D. 选项 D' }
    ]
  }
})

const startExam = () => {
  examStarted.value = true
  startTimer()
}

const stopTimer = () => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

const startTimer = () => {
  stopTimer()
  timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      stopTimer()
      submitExam()
    }
  }, 1000)
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const getDifficultyLabel = (level: string) => {
  switch (level) {
    case 'easy':
      return '简单'
    case 'medium':
      return '中等'
    case 'hard':
      return '困难'
    default:
      return '-'
  }
}

const getDifficultyType = (level: string) => {
  switch (level) {
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

const saveCurrentAnswer = () => {
  if (currentAnswer.value) {
    answers.value[currentQuestion.value] = currentAnswer.value
  }
}

const loadAnswer = () => {
  currentAnswer.value = answers.value[currentQuestion.value] || ''
}

const prevQuestion = () => {
  if (currentQuestion.value > 1) {
    saveCurrentAnswer()
    currentQuestion.value--
    loadAnswer()
  }
}

const nextQuestion = () => {
  if (currentQuestion.value < totalQuestions.value) {
    saveCurrentAnswer()
    currentQuestion.value++
    loadAnswer()
  }
}

const jumpToQuestion = (index: number) => {
  saveCurrentAnswer()
  currentQuestion.value = index
  loadAnswer()
}

const submitExam = () => {
  saveCurrentAnswer()
  const answeredCount = Object.keys(answers.value).length

  ElMessageBox.confirm(`已完成 ${answeredCount}/${totalQuestions.value} 题，确认提交？`, '提交答卷', {
    confirmButtonText: '确认提交',
    cancelButtonText: '继续答题',
    type: 'warning'
  }).then(() => {
    stopTimer()
    ElMessage.success('提交成功！正在跳转到成绩页面...')
    setTimeout(() => {
      router.push('/result')
    }, 1000)
  })
}

const goBack = () => {
  router.push('/home')
}

onMounted(() => {
  loadAnswer()
})

onBeforeUnmount(() => {
  stopTimer()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.exam-start {
  max-width: 700px;
  margin: 40px auto;
}

.start-card {
  padding: $spacing-xl;
}

.start-content {
  text-align: center;
}

.start-icon {
  margin-bottom: $spacing-lg;
}

.start-title {
  font-size: 28px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.start-desc {
  font-size: 16px;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.exam-rules {
  text-align: left;
  margin-bottom: $spacing-xl;
}

.rules-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.rules-list {
  padding-left: $spacing-lg;
  color: $text-regular;
  line-height: 2;
}

.start-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
}

.exam-header {
  margin-bottom: $spacing-lg;
}

.header-card {
  display: flex;
  gap: $spacing-xl;
  align-items: center;
  padding: $spacing-lg;

  :deep(.el-card__body) {
    width: 100%;
    display: flex;
    gap: $spacing-xl;
    align-items: center;
  }
}

.exam-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.progress-text {
  font-weight: 600;
  color: $text-primary;
}

.exam-timer {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 18px;
  font-weight: 600;
  color: $primary-color;
}

.question-area {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: $spacing-lg;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-number {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
}

.question-content {
  padding: $spacing-lg 0;
}

.question-title {
  font-size: 20px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-lg;
  line-height: 1.8;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.option-item {
  width: 100%;
  padding: $spacing-md;
  margin: 0;
}

.question-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
}

.sheet-card {
  height: fit-content;
  position: sticky;
  top: $spacing-lg;
}

.answer-sheet {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $spacing-sm;
}

.sheet-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 2px solid $border-base;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: $transition-base;
  font-weight: 600;
  color: $text-secondary;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
    background: rgba(64, 158, 255, 0.1);
  }

  &.active {
    border-color: $primary-color;
    background: $primary-color;
    color: white;
  }

  &.answered {
    background: $success-color;
    border-color: $success-color;
    color: white;

    &:hover {
      opacity: 0.8;
    }
  }

  &.answered.active {
    background: $primary-color;
    border-color: $primary-color;
  }
}

@media (max-width: 1024px) {
  .question-area {
    grid-template-columns: 1fr;
  }

  .sheet-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .header-card {
    flex-direction: column;
    align-items: stretch;

    :deep(.el-card__body) {
      flex-direction: column;
    }
  }

  .answer-sheet {
    grid-template-columns: repeat(5, 1fr);
  }

  .start-actions {
    flex-direction: column;
  }
}
</style>
