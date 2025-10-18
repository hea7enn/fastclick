<template>
  <div class="page-container result-page">
    <div class="page-title">
      <el-icon><Medal /></el-icon>
      成绩查询
    </div>

    <el-alert
      v-if="!hasResult"
      class="notice-alert"
      type="info"
      show-icon
      :closable="false"
      title="暂未检测到最新成绩，完成一次答题后即可查看统计信息。"
    />

    <el-row :gutter="24">
      <el-col :xs="24" :md="8">
        <el-card class="score-card modern-card" shadow="hover">
          <div class="score-wrapper">
            <div class="score-circle">
              <span class="score">{{ scoreDisplay }}</span>
              <span class="score-label">综合得分</span>
            </div>
            <div class="score-info">
              <div class="score-info-item">
                <span class="label">正确率</span>
                <span class="value">{{ accuracyDisplay }}</span>
              </div>
              <div class="score-info-item">
                <span class="label">用时</span>
                <span class="value">{{ timeUsedDisplay }}</span>
              </div>
              <div class="score-info-item">
                <span class="label">排名</span>
                <span class="value">{{ rankDisplay }}</span>
              </div>
            </div>
            <div v-if="hasResult" class="score-meta">
              <span>{{ examTitle }}</span>
              <span>{{ finishedAtDisplay }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <el-card class="analysis-card modern-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>知识点表现</span>
              <el-tag type="success" effect="dark">智能诊断</el-tag>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="item in analysis"
              :key="item.topic"
              :type="item.type"
              :timestamp="item.lastReview"
            >
              <div class="analysis-item">
                <div class="item-header">
                  <h3 class="item-title">{{ item.topic }}</h3>
                  <el-tag :type="item.type">{{ item.level }}</el-tag>
                </div>
                <p class="item-desc">{{ item.suggestion }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <span class="section-title">历史成绩</span>
          <el-switch v-model="showOnlyHighScore" active-text="只看高分" />
        </div>
      </template>

      <el-table v-if="hasFilteredHistory" :data="filteredHistory" style="width: 100%">
        <el-table-column prop="title" label="考试名称" min-width="200" />
        <el-table-column prop="date" label="日期" width="180" align="center" />
        <el-table-column prop="score" label="成绩" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.score >= 90 ? 'success' : scope.row.score >= 75 ? 'warning' : 'danger'">
              {{ scope.row.score }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="用时" width="120" align="center" />
        <el-table-column prop="accuracy" label="正确率" width="120" align="center" />
      </el-table>
      <el-empty
        v-else
        :description="hasHistory ? '暂无符合筛选条件的记录' : '暂无成绩记录，快去开启一次新的挑战吧～'"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useExamStore } from '@/stores'
import { formatDate } from '@/utils'

type TimelineType = 'primary' | 'success' | 'warning' | 'danger'

interface AnalysisItem {
  topic: string
  level: string
  type: TimelineType
  suggestion: string
  lastReview: string
}

interface HistoryItem {
  title: string
  date: string
  score: number
  time: string
  accuracy: string
}

const examStore = useExamStore()
const { statistics, questionList, finishedAt, status, config } = storeToRefs(examStore)

const analysis = ref<AnalysisItem[]>([
  {
    topic: '函数与导数',
    level: '优秀',
    type: 'success',
    suggestion: '表现稳定，继续保持巩固练习基础题目。',
    lastReview: '2024-10-10'
  },
  {
    topic: '立体几何',
    level: '良好',
    type: 'primary',
    suggestion: '建议复习空间向量知识点，巩固空间想象能力。',
    lastReview: '2024-10-07'
  },
  {
    topic: '概率统计',
    level: '一般',
    type: 'warning',
    suggestion: '需要加强排列组合与概率计算题目的练习。',
    lastReview: '2024-10-05'
  }
])

const showOnlyHighScore = ref(false)

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) {
    return `${secs} 秒`
  }
  if (secs === 0) {
    return `${mins} 分`
  }
  return `${mins} 分 ${secs} 秒`
}

const hasResult = computed(() => status.value === 'finished' && statistics.value.totalQuestions > 0 && questionList.value.length > 0)

const scoreDisplay = computed(() => (hasResult.value ? statistics.value.obtainedScore.toString() : '--'))
const accuracyDisplay = computed(() => (hasResult.value ? `${statistics.value.accuracy}%` : '--'))
const timeUsedDisplay = computed(() => (hasResult.value ? formatDuration(statistics.value.usedSeconds) : '--'))
const rankDisplay = computed(() => '--')

const examTitle = computed(() => {
  if (!hasResult.value || !config.value) {
    return '暂无成绩'
  }
  const parts: string[] = []
  const categoryLabel = config.value.category === 'all' ? '综合练习' : config.value.category
  parts.push(categoryLabel)
  parts.push(`${statistics.value.totalQuestions} 题`)
  parts.push(`${config.value.duration} 分钟`)
  return parts.join(' · ')
})

const finishedAtDisplay = computed(() => {
  if (!hasResult.value || !finishedAt.value) {
    return '--'
  }
  return formatDate(finishedAt.value)
})

const historyList = computed<HistoryItem[]>(() => {
  if (!hasResult.value) {
    return []
  }
  return [
    {
      title: examTitle.value || '本次练习',
      date: finishedAtDisplay.value,
      score: statistics.value.obtainedScore,
      time: timeUsedDisplay.value,
      accuracy: accuracyDisplay.value
    }
  ]
})

const filteredHistory = computed(() => {
  if (!showOnlyHighScore.value) {
    return historyList.value
  }
  return historyList.value.filter((item) => item.score >= 85)
})

const hasHistory = computed(() => historyList.value.length > 0)
const hasFilteredHistory = computed(() => filteredHistory.value.length > 0)
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

.score-card {
  text-align: center;
}

.score-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: $text-secondary;
}

.score-wrapper {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  align-items: center;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.25) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  color: $primary-color;
  box-shadow: inset 0 0 0 6px rgba(64, 158, 255, 0.2);
}

.score {
  font-size: 56px;
  font-weight: 700;
}

.score-label {
  font-size: 16px;
  letter-spacing: 2px;
}

.score-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.score-info-item {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: $text-regular;

  .label {
    color: $text-secondary;
  }

  .value {
    font-weight: 600;
    color: $text-primary;
  }
}

.analysis-card {
  height: 100%;
}

.analysis-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: $border-radius-base;
  padding: $spacing-md;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
}

.item-desc {
  color: $text-regular;
  line-height: 1.6;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .score-circle {
    width: 160px;
    height: 160px;
  }

  .score {
    font-size: 44px;
  }
}
</style>
