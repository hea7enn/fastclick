<template>
  <div class="page-container answer-analysis-page">
    <div class="page-title">
      <el-icon><Document /></el-icon>
      答案解析
    </div>

    <el-alert
      v-if="!hasData"
      type="warning"
      show-icon
      :closable="false"
      title="暂无答题数据，请先完成一次答题！"
    />

    <template v-if="hasData">
      <!-- 概况统计 -->
      <el-card class="summary-card modern-card" shadow="hover">
        <div class="summary-row">
          <div class="summary-item">
            <el-icon class="icon" color="#409EFF"><DocumentChecked /></el-icon>
            <div class="info">
              <span class="label">总题数</span>
              <span class="value">{{ questionList.length }}</span>
            </div>
          </div>
          <div class="summary-item correct">
            <el-icon class="icon" color="#67C23A"><CircleCheck /></el-icon>
            <div class="info">
              <span class="label">正确</span>
              <span class="value">{{ correctCount }}</span>
            </div>
          </div>
          <div class="summary-item wrong">
            <el-icon class="icon" color="#F56C6C"><CircleClose /></el-icon>
            <div class="info">
              <span class="label">错误</span>
              <span class="value">{{ wrongCount }}</span>
            </div>
          </div>
          <div class="summary-item">
            <el-icon class="icon" color="#E6A23C"><Warning /></el-icon>
            <div class="info">
              <span class="label">未作答</span>
              <span class="value">{{ unansweredCount }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 筛选选项 -->
      <el-card class="filter-card modern-card" shadow="hover">
        <el-radio-group v-model="filterType" size="large">
          <el-radio-button value="all">全部题目</el-radio-button>
          <el-radio-button value="correct">正确题目</el-radio-button>
          <el-radio-button value="wrong">错误题目</el-radio-button>
          <el-radio-button value="unanswered">未作答</el-radio-button>
        </el-radio-group>
      </el-card>

      <!-- 题目列表 -->
      <el-card v-if="filteredQuestions.length > 0" class="questions-card modern-card" shadow="hover">
        <el-collapse v-model="activeNames" accordion>
          <el-collapse-item
            v-for="(item, index) in filteredQuestions"
            :key="item.question.id"
            :name="item.question.id"
            :class="['question-item', item.status]"
          >
            <template #title>
              <div class="question-title-row">
                <div class="title-left">
                  <el-tag
                    :type="item.status === 'correct' ? 'success' : item.status === 'wrong' ? 'danger' : 'info'"
                    size="large"
                    effect="dark"
                  >
                    {{ index + 1 }}
                  </el-tag>
                  <el-tag type="primary">{{ item.typeName }}</el-tag>
                  <el-tag :type="item.difficultyType">{{ item.difficultyName }}</el-tag>
                  <el-tag type="info">{{ item.question.score }} 分</el-tag>
                </div>
                <div class="title-right">
                  <el-icon v-if="item.status === 'correct'" color="#67C23A" :size="24">
                    <CircleCheck />
                  </el-icon>
                  <el-icon v-else-if="item.status === 'wrong'" color="#F56C6C" :size="24">
                    <CircleClose />
                  </el-icon>
                  <el-icon v-else color="#E6A23C" :size="24">
                    <Warning />
                  </el-icon>
                </div>
              </div>
            </template>

            <div class="question-content">
              <!-- 题目 -->
              <div class="question-text-section">
                <h3 class="section-title">题目</h3>
                <p class="question-text">{{ item.question.question }}</p>
                <div v-if="item.question.category" class="question-meta">
                  <el-tag size="small" effect="plain">分类：{{ item.question.category }}</el-tag>
                </div>
              </div>

              <!-- 选项（如果有） -->
              <div v-if="item.question.options.length > 0" class="options-section">
                <h3 class="section-title">选项</h3>
                <div class="options-list">
                  <div
                    v-for="option in item.question.options"
                    :key="option.key"
                    class="option-item"
                    :class="{
                      correct: isCorrectOption(item.question, option.key),
                      wrong: isWrongOption(item, option.key)
                    }"
                  >
                    <span class="option-key">{{ option.key }}.</span>
                    <span class="option-value">{{ option.value }}</span>
                    <el-icon v-if="isCorrectOption(item.question, option.key)" color="#67C23A">
                      <CircleCheck />
                    </el-icon>
                    <el-icon v-if="isWrongOption(item, option.key)" color="#F56C6C">
                      <CircleClose />
                    </el-icon>
                  </div>
                </div>
              </div>

              <!-- 答案对比 -->
              <div class="answer-section">
                <el-row :gutter="16">
                  <el-col :xs="24" :sm="12">
                    <div class="answer-box user-answer">
                      <h3 class="section-title">
                        <el-icon><User /></el-icon>
                        你的答案
                      </h3>
                      <div class="answer-content">
                        {{ item.userAnswerText || '未作答' }}
                      </div>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <div class="answer-box correct-answer">
                      <h3 class="section-title">
                        <el-icon><Check /></el-icon>
                        正确答案
                      </h3>
                      <div class="answer-content">
                        {{ item.correctAnswerText }}
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <!-- 解析 -->
              <div v-if="item.question.analysis" class="analysis-section">
                <h3 class="section-title">
                  <el-icon><Notebook /></el-icon>
                  答案解析
                </h3>
                <div class="analysis-content">
                  {{ item.question.analysis }}
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-empty v-else description="没有符合条件的题目" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useExamStore } from '@/stores'
import { questionTypeNameMap, difficultyNameMap, type Question } from '@/types/question'

const examStore = useExamStore()
const { questionList, statistics, status } = storeToRefs(examStore)

const filterType = ref<'all' | 'correct' | 'wrong' | 'unanswered'>('all')
const activeNames = ref<string[]>([])

const hasData = computed(() => 
  status.value === 'finished' && questionList.value.length > 0
)

const correctCount = computed(() => statistics.value.correctCount)
const wrongCount = computed(() => 
  statistics.value.totalQuestions - statistics.value.correctCount - unansweredCount.value
)
const unansweredCount = computed(() => 
  statistics.value.totalQuestions - statistics.value.answered
)

interface QuestionItem {
  question: Question
  status: 'correct' | 'wrong' | 'unanswered'
  userAnswer?: string | string[]
  userAnswerText: string
  correctAnswerText: string
  typeName: string
  difficultyName: string
  difficultyType: 'success' | 'warning' | 'danger'
}

const getDifficultyType = (difficulty: string) => {
  if (difficulty === 'easy') return 'success'
  if (difficulty === 'medium') return 'warning'
  return 'danger'
}

const formatAnswer = (answer: string | string[]): string => {
  if (Array.isArray(answer)) {
    return answer.join('、')
  }
  return answer
}

const questionItems = computed<QuestionItem[]>(() => {
  return questionList.value.map((question) => {
    const userAnswer = examStore.getAnswer(question.id)
    const isCorrect = examStore.isAnswerCorrect(question, userAnswer)
    const isAnswered = userAnswer !== undefined

    let status: 'correct' | 'wrong' | 'unanswered'
    if (!isAnswered) {
      status = 'unanswered'
    } else if (isCorrect) {
      status = 'correct'
    } else {
      status = 'wrong'
    }

    return {
      question,
      status,
      userAnswer,
      userAnswerText: userAnswer ? formatAnswer(userAnswer) : '未作答',
      correctAnswerText: formatAnswer(question.answer),
      typeName: questionTypeNameMap[question.type],
      difficultyName: difficultyNameMap[question.difficulty],
      difficultyType: getDifficultyType(question.difficulty)
    }
  })
})

const filteredQuestions = computed(() => {
  if (filterType.value === 'all') {
    return questionItems.value
  }
  return questionItems.value.filter((item) => item.status === filterType.value)
})

const isCorrectOption = (question: Question, optionKey: string): boolean => {
  const correctAnswer = question.answer
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some((ans) => ans.toString().toUpperCase() === optionKey.toUpperCase())
  }
  return correctAnswer.toString().toUpperCase() === optionKey.toUpperCase()
}

const isWrongOption = (item: QuestionItem, optionKey: string): boolean => {
  if (item.status !== 'wrong' || !item.userAnswer) return false
  
  const userAnswer = item.userAnswer
  if (Array.isArray(userAnswer)) {
    return userAnswer.some((ans) => ans.toString().toUpperCase() === optionKey.toUpperCase())
  }
  return userAnswer.toString().toUpperCase() === optionKey.toUpperCase()
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.answer-analysis-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.summary-card {
  .summary-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-lg;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    background: rgba(64, 158, 255, 0.05);
    border-radius: $border-radius-base;

    &.correct {
      background: rgba(103, 194, 58, 0.05);
    }

    &.wrong {
      background: rgba(245, 108, 108, 0.05);
    }

    .icon {
      font-size: 32px;
    }

    .info {
      display: flex;
      flex-direction: column;

      .label {
        font-size: 14px;
        color: $text-secondary;
      }

      .value {
        font-size: 24px;
        font-weight: 700;
        color: $text-primary;
      }
    }
  }
}

.filter-card {
  text-align: center;
}

.questions-card {
  .question-item {
    &.correct {
      border-left: 4px solid #67C23A;
    }

    &.wrong {
      border-left: 4px solid #F56C6C;
    }

    &.unanswered {
      border-left: 4px solid #E6A23C;
    }
  }

  .question-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-right: $spacing-md;

    .title-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .title-right {
      flex-shrink: 0;
    }
  }

  .question-content {
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-md;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .question-text-section {
    .question-text {
      font-size: 16px;
      line-height: 1.8;
      color: $text-primary;
      margin-bottom: $spacing-sm;
    }

    .question-meta {
      margin-top: $spacing-sm;
    }
  }

  .options-section {
    .options-list {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: $border-radius-base;
      border: 2px solid transparent;

      &.correct {
        background: rgba(103, 194, 58, 0.1);
        border-color: #67C23A;
      }

      &.wrong {
        background: rgba(245, 108, 108, 0.1);
        border-color: #F56C6C;
      }

      .option-key {
        font-weight: 600;
        color: $text-primary;
        min-width: 24px;
      }

      .option-value {
        flex: 1;
        color: $text-regular;
      }
    }
  }

  .answer-section {
    .answer-box {
      padding: $spacing-md;
      border-radius: $border-radius-base;
      height: 100%;

      &.user-answer {
        background: rgba(64, 158, 255, 0.05);
        border: 2px solid rgba(64, 158, 255, 0.3);
      }

      &.correct-answer {
        background: rgba(103, 194, 58, 0.05);
        border: 2px solid rgba(103, 194, 58, 0.3);
      }

      .answer-content {
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
        padding: $spacing-sm 0;
      }
    }
  }

  .analysis-section {
    .analysis-content {
      padding: $spacing-md;
      background: rgba(103, 194, 58, 0.05);
      border-left: 4px solid #67C23A;
      border-radius: $border-radius-base;
      font-size: 15px;
      line-height: 1.8;
      color: $text-regular;
    }
  }
}

@media (max-width: 768px) {
  .summary-row {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .question-title-row {
    flex-direction: column;
    align-items: flex-start !important;
    gap: $spacing-sm;
  }
}
</style>
