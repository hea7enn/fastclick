<template>
  <div class="page-container result-page">
    <div class="page-title">
      <el-icon><Medal /></el-icon>
      成绩分析报告
    </div>

    <el-alert
      v-if="!hasResult"
      class="notice-alert"
      type="info"
      show-icon
      :closable="false"
      title="暂无成绩数据，完成一次答题后即可查看详细统计分析！🎯"
    />

    <template v-if="hasResult">
      <!-- 第一行：总分、评级、成绩环形图 -->
      <el-row :gutter="24" class="top-row">
        <el-col :xs="24" :md="8">
          <el-card class="score-card modern-card" shadow="hover">
            <div class="score-wrapper">
              <div class="score-circle" :class="gradeClass">
                <span class="score">{{ statistics.obtainedScore }}</span>
                <span class="score-total">/ {{ statistics.totalScore }}</span>
              </div>
              <div class="grade-badge" :class="gradeClass">
                <el-icon><Trophy /></el-icon>
                <span>{{ gradeName }}</span>
              </div>
              <div class="score-rate">得分率：{{ scoreRate }}%</div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="8">
          <el-card class="chart-card modern-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><PieChart /></el-icon>
                答题分布
              </div>
            </template>
            <ScoreChart 
              :correct-count="statistics.correctCount" 
              :wrong-count="wrongCount"
              :unanswered-count="unansweredCount"
            />
          </el-card>
        </el-col>

        <el-col :xs="24" :md="8">
          <el-card class="stats-card modern-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                详细统计
              </div>
            </template>
            <div class="stats-list">
              <div class="stat-item">
                <span class="label">正确率</span>
                <span class="value correct">{{ statistics.accuracy }}%</span>
              </div>
              <div class="stat-item">
                <span class="label">答题时间</span>
                <span class="value">{{ timeUsedDisplay }}</span>
              </div>
              <div class="stat-item">
                <span class="label">正确题数</span>
                <span class="value">{{ statistics.correctCount }}/{{ statistics.totalQuestions }}</span>
              </div>
              <div class="stat-item">
                <span class="label">错误题数</span>
                <span class="value wrong">{{ wrongCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">已标记</span>
                <span class="value">{{ statistics.marked }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 第二行：题型分析图 -->
      <el-row :gutter="24">
        <el-col :xs="24">
          <el-card class="chart-card modern-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Histogram /></el-icon>
                题型正确率分析
              </div>
            </template>
            <QuestionTypeChart :stats="questionTypeStats" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 第三行：操作按钮 -->
      <el-row :gutter="24">
        <el-col :xs="24">
          <el-card class="action-card modern-card" shadow="hover">
            <div class="action-buttons">
              <el-button type="primary" size="large" @click="goToAnalysis">
                <el-icon><Document /></el-icon>
                查看答案解析
              </el-button>
              <el-button type="warning" size="large" @click="goToWrongQuestions" v-if="wrongCount > 0">
                <el-icon><Warning /></el-icon>
                查看错题本 ({{ wrongCount }})
              </el-button>
              <el-button type="success" size="large" @click="goToHistory">
                <el-icon><Clock /></el-icon>
                历史记录
              </el-button>
              <el-button size="large" @click="startNewExam">
                <el-icon><RefreshRight /></el-icon>
                重新组卷
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useExamStore } from '@/stores'
import { questionTypeNameMap, type QuestionType } from '@/types/question'
import ScoreChart from '@/components/ScoreChart.vue'
import QuestionTypeChart from '@/components/QuestionTypeChart.vue'

const router = useRouter()
const examStore = useExamStore()
const { statistics, questionList, status } = storeToRefs(examStore)

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) {
    return `${secs} 秒`
  }
  if (secs === 0) {
    return `${mins} 分钟`
  }
  return `${mins} 分 ${secs} 秒`
}

const hasResult = computed(() => 
  status.value === 'finished' && 
  statistics.value.totalQuestions > 0 && 
  questionList.value.length > 0
)

const wrongCount = computed(() => 
  statistics.value.totalQuestions - statistics.value.correctCount - unansweredCount.value
)

const unansweredCount = computed(() => 
  statistics.value.totalQuestions - statistics.value.answered
)

const timeUsedDisplay = computed(() => 
  hasResult.value ? formatDuration(statistics.value.usedSeconds) : '--'
)

const scoreRate = computed(() => {
  if (!hasResult.value || statistics.value.totalScore === 0) return 0
  return Math.round((statistics.value.obtainedScore / statistics.value.totalScore) * 100)
})

// 评级系统
const getGrade = (rate: number) => {
  if (rate >= 90) return { name: '优秀', class: 'excellent' }
  if (rate >= 80) return { name: '良好', class: 'good' }
  if (rate >= 60) return { name: '及格', class: 'pass' }
  return { name: '不及格', class: 'fail' }
}

const grade = computed(() => getGrade(scoreRate.value))
const gradeName = computed(() => grade.value.name)
const gradeClass = computed(() => grade.value.class)

// 题型统计
const questionTypeStats = computed(() => {
  if (!hasResult.value) return []

  const typeMap = new Map<QuestionType, { correct: number; total: number }>()

  questionList.value.forEach((question) => {
    if (!typeMap.has(question.type)) {
      typeMap.set(question.type, { correct: 0, total: 0 })
    }
    const stat = typeMap.get(question.type)!
    stat.total += 1

    const answer = examStore.getAnswer(question.id)
    if (examStore.isAnswerCorrect(question, answer)) {
      stat.correct += 1
    }
  })

  return Array.from(typeMap.entries()).map(([type, stat]) => ({
    type: questionTypeNameMap[type],
    correct: stat.correct,
    total: stat.total
  }))
})

const goToAnalysis = () => {
  router.push('/answer-analysis')
}

const goToWrongQuestions = () => {
  router.push('/wrong-questions')
}

const goToHistory = () => {
  router.push('/history')
}

const startNewExam = () => {
  router.push('/exam')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.result-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.notice-alert {
  margin-bottom: $spacing-md;
}

.top-row {
  margin-bottom: $spacing-lg;
}

.score-card {
  height: 100%;
  
  .score-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-lg;
  }

  .score-circle {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);

    &.excellent {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 0 30px rgba(118, 75, 162, 0.5);
    }

    &.good {
      background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
      box-shadow: 0 0 30px rgba(103, 194, 58, 0.5);
    }

    &.pass {
      background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
      box-shadow: 0 0 30px rgba(64, 158, 255, 0.5);
    }

    &.fail {
      background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
      box-shadow: 0 0 30px rgba(245, 108, 108, 0.5);
    }

    .score {
      font-size: 56px;
      font-weight: 700;
      color: white;
      line-height: 1;
    }

    .score-total {
      font-size: 24px;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .grade-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: 600;
    color: white;

    &.excellent {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.good {
      background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
    }

    &.pass {
      background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
    }

    &.fail {
      background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
    }
  }

  .score-rate {
    font-size: 16px;
    color: $text-secondary;
    font-weight: 500;
  }
}

.chart-card {
  height: 100%;
}

.stats-card {
  height: 100%;

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(64, 158, 255, 0.05);
    border-radius: $border-radius-base;

    .label {
      color: $text-secondary;
      font-size: 14px;
    }

    .value {
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;

      &.correct {
        color: #67C23A;
      }

      &.wrong {
        color: #F56C6C;
      }
    }
  }
}

.action-card {
  .action-buttons {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: $spacing-md;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: $text-primary;
}

@media (max-width: 768px) {
  .score-circle {
    width: 140px !important;
    height: 140px !important;

    .score {
      font-size: 42px !important;
    }

    .score-total {
      font-size: 18px !important;
    }
  }

  .action-buttons {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
