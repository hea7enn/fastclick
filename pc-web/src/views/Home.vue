<template>
  <div class="home-page">
    <div class="hero-section">
      <h1 class="hero-title">
        <span class="gradient-text">智能答题系统</span>
      </h1>
      <p class="hero-subtitle">掌握知识，成就未来 • 科学练习，精准提升</p>
      <div class="hero-actions">
        <el-button type="primary" size="large" round @click="startExam">
          <el-icon><Edit /></el-icon>
          立即开始答题
        </el-button>
        <el-button size="large" round plain @click="viewQuestionBank">
          <el-icon><Document /></el-icon>
          浏览题库
        </el-button>
      </div>
    </div>

    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
          <el-card class="stat-card modern-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" :style="{ color: stat.color }">
                <component :is="stat.icon" />
              </el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="features-section">
      <h2 class="section-title">核心功能</h2>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="6" v-for="feature in features" :key="feature.title">
          <el-card class="feature-card modern-card" shadow="hover">
            <div class="feature-icon" :style="{ background: feature.bgColor }">
              <el-icon :size="32">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="records-section">
      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span class="page-title">
              <el-icon><TrendCharts /></el-icon>
              最近答题记录
            </span>
            <el-button type="primary" text @click="viewAllRecords">查看全部</el-button>
          </div>
        </template>
        <el-empty v-if="records.length === 0" description="暂无答题记录，快去开始答题吧！" />
        <div v-else class="records-list">
          <div class="record-item" v-for="record in records" :key="record.id">
            <div class="record-info">
              <span class="record-title">{{ record.title }}</span>
              <span class="record-time">{{ record.time }}</span>
            </div>
            <div class="record-score">
              <el-tag :type="getScoreType(record.score)" size="large">
                得分：{{ record.score }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface RecordItem {
  id: string
  title: string
  time: string
  score: number
}

const router = useRouter()

const stats = ref([
  { title: '总题目数', value: '1,258', icon: 'Document', color: '#409EFF' },
  { title: '已完成', value: '376', icon: 'CircleCheck', color: '#67C23A' },
  { title: '正确率', value: '85%', icon: 'TrendCharts', color: '#E6A23C' },
  { title: '平均分', value: '89', icon: 'Medal', color: '#F56C6C' }
])

const features = ref([
  {
    title: '题库管理',
    description: '丰富的题库资源，支持分类检索和快速定位',
    icon: 'Folder',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '智能答题',
    description: '流畅的答题体验，支持多种题型和实时反馈',
    icon: 'Edit',
    bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: '成绩分析',
    description: '详尽的成绩报告，帮助您了解学习进度',
    icon: 'DataAnalysis',
    bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: '错题回顾',
    description: '智能整理错题，针对性练习提升能力',
    icon: 'Warning',
    bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
])

const records = ref<RecordItem[]>([
  { id: 'rec-1', title: '冲刺模拟 A 卷', time: '2024-10-10 18:30', score: 92 },
  { id: 'rec-2', title: '阶段测验 B 卷', time: '2024-10-05 14:20', score: 85 },
  { id: 'rec-3', title: '强化训练 C 卷', time: '2024-09-28 09:40', score: 78 }
])

const startExam = () => {
  router.push('/exam')
}

const viewQuestionBank = () => {
  router.push('/question-bank')
}

const viewAllRecords = () => {
  router.push('/result')
}

const getScoreType = (score: number): string => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: $border-radius-large;
  margin-bottom: $spacing-lg;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: $spacing-md;
}

.hero-subtitle {
  font-size: 18px;
  color: $text-secondary;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
}

.stats-section {
  margin-bottom: $spacing-xl;
}

.stat-card {
  cursor: pointer;
  transition: $transition-base;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.stat-icon {
  font-size: 48px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: $text-primary;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-title {
  font-size: 14px;
  color: $text-secondary;
}

.features-section {
  margin-bottom: $spacing-xl;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: $spacing-lg;
  text-align: center;
  color: $text-primary;
}

.feature-card {
  text-align: center;
  padding: $spacing-lg;
  cursor: pointer;
  transition: $transition-base;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: $spacing-md;
  color: white;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: $spacing-sm;
  color: $text-primary;
}

.feature-desc {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.6;
}

.records-section {
  margin-bottom: $spacing-lg;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: $bg-primary;
  border-radius: $border-radius-base;
  transition: $transition-base;

  &:hover {
    background: rgba(64, 158, 255, 0.05);
  }
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-title {
  font-size: 16px;
  font-weight: 500;
  color: $text-primary;
}

.record-time {
  font-size: 14px;
  color: $text-secondary;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
    padding: 0 20px;
  }

  .stat-value {
    font-size: 24px;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>
