<template>
  <div class="page-container result-page">
    <div class="page-title">
      <el-icon><Medal /></el-icon>
      成绩查询
    </div>

    <el-row :gutter="24">
      <el-col :xs="24" :md="8">
        <el-card class="score-card modern-card" shadow="hover">
          <div class="score-wrapper">
            <div class="score-circle">
              <span class="score">{{ result.score }}</span>
              <span class="score-label">综合得分</span>
            </div>
            <div class="score-info">
              <div class="score-info-item">
                <span class="label">正确率</span>
                <span class="value">{{ result.accuracy }}%</span>
              </div>
              <div class="score-info-item">
                <span class="label">用时</span>
                <span class="value">{{ result.timeUsed }}</span>
              </div>
              <div class="score-info-item">
                <span class="label">排名</span>
                <span class="value">TOP {{ result.rank }}%</span>
              </div>
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

      <el-table :data="filteredHistory" style="width: 100%">
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

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

const result = ref({
  score: 92,
  accuracy: 87,
  timeUsed: '28 分钟',
  rank: 15
})

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

const history = ref<HistoryItem[]>([
  { title: '阶段性检测 A', date: '2024-09-30', score: 95, time: '30 分钟', accuracy: '90%' },
  { title: '能力提升练习 B', date: '2024-09-15', score: 82, time: '35 分钟', accuracy: '78%' },
  { title: '专题专项训练 C', date: '2024-09-01', score: 88, time: '32 分钟', accuracy: '84%' },
  { title: '模拟考试 D', date: '2024-08-25', score: 71, time: '40 分钟', accuracy: '65%' }
])

const showOnlyHighScore = ref(false)

const filteredHistory = computed(() => {
  if (!showOnlyHighScore.value) {
    return history.value
  }
  return history.value.filter((item) => item.score >= 85)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.result-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.score-card {
  text-align: center;
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
