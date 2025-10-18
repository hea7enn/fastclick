<template>
  <div class="page-container history-page">
    <div class="page-title">
      <el-icon><Clock /></el-icon>
      答题历史
    </div>

    <el-alert
      v-if="!hasHistory"
      type="info"
      show-icon
      :closable="false"
      title="暂无答题历史，快去开始第一次挑战吧！🚀"
    />

    <template v-if="hasHistory">
      <!-- 趋势图 -->
      <el-card class="chart-card modern-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><TrendCharts /></el-icon>
              <span>成绩趋势分析</span>
            </div>
            <el-switch v-model="showTrendChart" active-text="显示图表" />
          </div>
        </template>
        <TrendChart v-if="showTrendChart" :data="trendData" />
        <el-empty v-else description="图表已隐藏" :image-size="100" />
      </el-card>

      <!-- 统计卡片 -->
      <el-row :gutter="24">
        <el-col :xs="24" :sm="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#409EFF" :size="36">
                <Document />
              </el-icon>
              <div class="stat-info">
                <div class="stat-label">总答题次数</div>
                <div class="stat-value">{{ history.length }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#67C23A" :size="36">
                <Trophy />
              </el-icon>
              <div class="stat-info">
                <div class="stat-label">最高得分</div>
                <div class="stat-value">{{ maxScore }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#E6A23C" :size="36">
                <Star />
              </el-icon>
              <div class="stat-info">
                <div class="stat-label">平均分</div>
                <div class="stat-value">{{ avgScore }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#F56C6C" :size="36">
                <DataAnalysis />
              </el-icon>
              <div class="stat-info">
                <div class="stat-label">平均正确率</div>
                <div class="stat-value">{{ avgAccuracy }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 筛选和操作 -->
      <el-card class="filter-card modern-card" shadow="hover">
        <div class="filter-row">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索考试名称..."
            clearable
            style="max-width: 300px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <div class="filter-actions">
            <el-select v-model="sortBy" placeholder="排序方式" style="width: 150px">
              <el-option label="最新优先" value="date-desc" />
              <el-option label="最早优先" value="date-asc" />
              <el-option label="得分最高" value="score-desc" />
              <el-option label="得分最低" value="score-asc" />
            </el-select>
            <el-button type="danger" @click="handleClearHistory">
              <el-icon><Delete /></el-icon>
              清空历史
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 历史记录列表 -->
      <el-card v-if="filteredHistory.length > 0" class="history-card modern-card" shadow="hover">
        <el-table :data="paginatedHistory" style="width: 100%" stripe>
          <el-table-column type="index" label="#" width="60" align="center" />
          
          <el-table-column prop="title" label="考试名称" min-width="180">
            <template #default="{ row }">
              <div class="title-cell">
                <span class="title-text">{{ row.title }}</span>
                <div class="title-tags">
                  <el-tag
                    v-for="type in row.config.questionTypes"
                    :key="type"
                    size="small"
                    effect="plain"
                  >
                    {{ getTypeName(type) }}
                  </el-tag>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="成绩" width="120" align="center">
            <template #default="{ row }">
              <div class="score-cell">
                <el-progress
                  type="circle"
                  :percentage="getScoreRate(row)"
                  :width="60"
                  :color="getScoreColor(row)"
                />
                <div class="score-text">{{ row.score }}/{{ row.totalScore }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="accuracy" label="正确率" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getAccuracyType(row.accuracy)">
                {{ row.accuracy }}%
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="题目数" width="100" align="center">
            <template #default="{ row }">
              {{ row.correctCount }}/{{ row.totalQuestions }}
            </template>
          </el-table-column>

          <el-table-column label="用时" width="100" align="center">
            <template #default="{ row }">
              {{ formatDuration(row.usedSeconds) }}
            </template>
          </el-table-column>

          <el-table-column prop="date" label="答题时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="viewDetail(row)">
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button size="small" type="danger" text @click="deleteRecord(row.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredHistory.length"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </el-card>

      <el-empty v-else description="没有符合条件的历史记录" />
    </template>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="答题详情" width="90%" :close-on-click-modal="false">
      <div v-if="selectedRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="考试名称">{{ selectedRecord.title }}</el-descriptions-item>
          <el-descriptions-item label="答题时间">{{ formatDate(selectedRecord.date) }}</el-descriptions-item>
          <el-descriptions-item label="得分">
            <el-tag type="success" size="large">{{ selectedRecord.score }}/{{ selectedRecord.totalScore }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="正确率">
            <el-tag :type="getAccuracyType(selectedRecord.accuracy)" size="large">
              {{ selectedRecord.accuracy }}%
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="正确题数">
            {{ selectedRecord.correctCount }}/{{ selectedRecord.totalQuestions }}
          </el-descriptions-item>
          <el-descriptions-item label="用时">{{ formatDuration(selectedRecord.usedSeconds) }}</el-descriptions-item>
          <el-descriptions-item label="题型" :span="2">
            <el-tag
              v-for="type in selectedRecord.config.questionTypes"
              :key="type"
              effect="plain"
              style="margin-right: 8px"
            >
              {{ getTypeName(type) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-actions">
          <el-button type="primary" size="large" @click="reviewAnswers">
            <el-icon><Document /></el-icon>
            查看答案解析
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useExamStore } from '@/stores'
import { questionTypeNameMap, type ExamRecord } from '@/types/question'
import TrendChart from '@/components/TrendChart.vue'

const examStore = useExamStore()
const { history } = storeToRefs(examStore)

const showTrendChart = ref(true)
const searchKeyword = ref('')
const sortBy = ref('date-desc')
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const selectedRecord = ref<ExamRecord | null>(null)

const hasHistory = computed(() => history.value.length > 0)

const maxScore = computed(() => {
  if (!hasHistory.value) return 0
  return Math.max(...history.value.map((r) => r.score))
})

const avgScore = computed(() => {
  if (!hasHistory.value) return 0
  const total = history.value.reduce((sum, r) => sum + r.score, 0)
  return Math.round(total / history.value.length)
})

const avgAccuracy = computed(() => {
  if (!hasHistory.value) return 0
  const total = history.value.reduce((sum, r) => sum + r.accuracy, 0)
  return Math.round(total / history.value.length)
})

const trendData = computed(() => {
  return history.value
    .slice()
    .reverse()
    .slice(0, 10)
    .map((record) => ({
      date: formatDateShort(record.date),
      score: record.score,
      accuracy: record.accuracy
    }))
})

const filteredHistory = computed(() => {
  let result = history.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((r) => r.title.toLowerCase().includes(keyword))
  }

  // 排序
  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return b.date - a.date
      case 'date-asc':
        return a.date - b.date
      case 'score-desc':
        return b.score - a.score
      case 'score-asc':
        return a.score - b.score
      default:
        return 0
    }
  })

  return result
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredHistory.value.slice(start, end)
})

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}秒`
  if (secs === 0) return `${mins}分`
  return `${mins}分${secs}秒`
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const getTypeName = (type: string) => questionTypeNameMap[type as keyof typeof questionTypeNameMap]

const getScoreRate = (record: ExamRecord) => {
  if (record.totalScore === 0) return 0
  return Math.round((record.score / record.totalScore) * 100)
}

const getScoreColor = (record: ExamRecord) => {
  const rate = getScoreRate(record)
  if (rate >= 90) return '#67C23A'
  if (rate >= 80) return '#409EFF'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
}

const getAccuracyType = (accuracy: number) => {
  if (accuracy >= 90) return 'success'
  if (accuracy >= 75) return 'warning'
  return 'danger'
}

const viewDetail = (record: ExamRecord) => {
  selectedRecord.value = record
  detailVisible.value = true
}

const reviewAnswers = () => {
  // TODO: 加载该记录的答题数据到 store，然后跳转到答案解析页面
  ElMessage.info('此功能需要在 store 中临时加载历史记录数据')
  detailVisible.value = false
}

const deleteRecord = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条历史记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    examStore.deleteHistoryRecord(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有历史记录吗？此操作不可恢复！',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    examStore.clearHistory()
    ElMessage.success('已清空历史记录')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.history-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.chart-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
  }
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .stat-icon {
      flex-shrink: 0;
    }

    .stat-info {
      flex: 1;

      .stat-label {
        font-size: 14px;
        color: $text-secondary;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: $text-primary;
      }
    }
  }
}

.filter-card {
  .filter-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-md;
  }

  .filter-actions {
    display: flex;
    gap: $spacing-sm;
  }
}

.history-card {
  .title-cell {
    .title-text {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .title-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  .score-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .score-text {
      font-size: 12px;
      color: $text-secondary;
    }
  }

  .pagination-container {
    margin-top: $spacing-lg;
    display: flex;
    justify-content: center;
  }
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  .detail-actions {
    display: flex;
    justify-content: center;
    padding-top: $spacing-md;
  }
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch !important;

    .el-input {
      max-width: 100% !important;
    }
  }

  .filter-actions {
    width: 100%;
    flex-direction: column;

    .el-select,
    .el-button {
      width: 100%;
    }
  }
}
</style>
