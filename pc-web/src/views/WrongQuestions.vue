<template>
  <div class="page-container wrong-questions-page">
    <div class="page-title">
      <el-icon><Warning /></el-icon>
      错题本
    </div>

    <el-alert
      v-if="!hasWrongQuestions"
      type="success"
      show-icon
      :closable="false"
      title="太棒了！暂无错题记录，继续保持！💪"
    />

    <template v-if="hasWrongQuestions">
      <!-- 统计卡片 -->
      <el-row :gutter="24">
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#F56C6C" :size="40">
                <DocumentDelete />
              </el-icon>
              <div class="stat-info">
                <div class="stat-label">错题总数</div>
                <div class="stat-value">{{ totalWrongCount }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#E6A23C" :size="40">
                <Clock />
              </el-icon>
              <div class="stat-info">
                <div class="stat-label">待解决</div>
                <div class="stat-value">{{ unresolvedCount }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#67C23A" :size="40">
                <CircleCheck />
              </el-icon>
              <div class="stat-info">
                <div class="stat-label">已掌握</div>
                <div class="stat-value">{{ resolvedCount }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 操作栏 -->
      <el-card class="action-card modern-card" shadow="hover">
        <div class="action-row">
          <el-radio-group v-model="filterStatus" size="large">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="unresolved">待解决</el-radio-button>
            <el-radio-button value="resolved">已掌握</el-radio-button>
          </el-radio-group>
          <div class="action-buttons">
            <el-button type="primary" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出错题
            </el-button>
            <el-button type="danger" @click="handleClearAll">
              <el-icon><Delete /></el-icon>
              清空错题本
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 错题列表 -->
      <el-card v-if="filteredQuestions.length > 0" class="questions-card modern-card" shadow="hover">
        <div class="question-list">
          <div
            v-for="(item, index) in filteredQuestions"
            :key="item.id"
            class="question-item"
            :class="{ resolved: item.isResolved }"
          >
            <div class="question-header">
              <div class="header-left">
                <el-tag type="danger" effect="dark" size="large">{{ index + 1 }}</el-tag>
                <el-tag type="primary">{{ getTypeName(item.question.type) }}</el-tag>
                <el-tag :type="getDifficultyType(item.question.difficulty)">
                  {{ getDifficultyName(item.question.difficulty) }}
                </el-tag>
                <el-tag type="info">{{ item.question.score }} 分</el-tag>
                <el-tag type="warning" effect="plain">错误 {{ item.wrongCount }} 次</el-tag>
                <el-tag v-if="item.isResolved" type="success">已掌握</el-tag>
              </div>
              <div class="header-right">
                <el-button
                  v-if="!item.isResolved"
                  type="success"
                  size="small"
                  @click="markAsResolved(item.id)"
                >
                  <el-icon><Check /></el-icon>
                  标记为已掌握
                </el-button>
                <el-button type="danger" size="small" text @click="deleteWrongQuestion(item.id)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>

            <div class="question-body">
              <div class="question-text">{{ item.question.question }}</div>

              <!-- 选项 -->
              <div v-if="item.question.options.length > 0" class="options-list">
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

              <!-- 答案对比 -->
              <el-row :gutter="16" class="answer-row">
                <el-col :xs="24" :sm="12">
                  <div class="answer-box wrong-answer">
                    <div class="box-title">
                      <el-icon><User /></el-icon>
                      你的答案
                    </div>
                    <div class="box-content">{{ formatAnswer(item.userAnswer) }}</div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <div class="answer-box correct-answer">
                    <div class="box-title">
                      <el-icon><Check /></el-icon>
                      正确答案
                    </div>
                    <div class="box-content">{{ formatAnswer(item.question.answer) }}</div>
                  </div>
                </el-col>
              </el-row>

              <!-- 解析 -->
              <div v-if="item.question.analysis" class="analysis-box">
                <div class="box-title">
                  <el-icon><Notebook /></el-icon>
                  答案解析
                </div>
                <div class="box-content">{{ item.question.analysis }}</div>
              </div>

              <!-- 元信息 -->
              <div class="meta-info">
                <el-tag size="small" effect="plain">
                  最近错误：{{ formatDate(item.lastWrongTime) }}
                </el-tag>
                <el-tag v-if="item.question.category" size="small" effect="plain">
                  分类：{{ item.question.category }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-empty v-else description="暂无符合条件的错题" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useExamStore } from '@/stores'
import { questionTypeNameMap, difficultyNameMap, type Question } from '@/types/question'

const examStore = useExamStore()
const { wrongQuestions } = storeToRefs(examStore)

const filterStatus = ref<'all' | 'unresolved' | 'resolved'>('all')

const hasWrongQuestions = computed(() => wrongQuestions.value.length > 0)
const totalWrongCount = computed(() => wrongQuestions.value.length)
const unresolvedCount = computed(() => wrongQuestions.value.filter((wq) => !wq.isResolved).length)
const resolvedCount = computed(() => wrongQuestions.value.filter((wq) => wq.isResolved).length)

const filteredQuestions = computed(() => {
  if (filterStatus.value === 'all') {
    return wrongQuestions.value
  }
  return wrongQuestions.value.filter((wq) =>
    filterStatus.value === 'resolved' ? wq.isResolved : !wq.isResolved
  )
})

const getTypeName = (type: string) => questionTypeNameMap[type as keyof typeof questionTypeNameMap]
const getDifficultyName = (difficulty: string) =>
  difficultyNameMap[difficulty as keyof typeof difficultyNameMap]

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

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-CN')
}

const isCorrectOption = (question: Question, optionKey: string): boolean => {
  const correctAnswer = question.answer
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some((ans) => ans.toString().toUpperCase() === optionKey.toUpperCase())
  }
  return correctAnswer.toString().toUpperCase() === optionKey.toUpperCase()
}

const isWrongOption = (item: any, optionKey: string): boolean => {
  const userAnswer = item.userAnswer
  if (Array.isArray(userAnswer)) {
    return userAnswer.some((ans) => ans.toString().toUpperCase() === optionKey.toUpperCase())
  }
  return userAnswer.toString().toUpperCase() === optionKey.toUpperCase()
}

const markAsResolved = (id: string) => {
  examStore.markWrongQuestionResolved(id)
  ElMessage.success('已标记为掌握！继续加油！💪')
}

const deleteWrongQuestion = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这道错题吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    examStore.deleteWrongQuestion(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有错题吗？此操作不可恢复！', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    examStore.clearWrongQuestions()
    ElMessage.success('已清空错题本')
  } catch {
    // 用户取消
  }
}

const handleExport = () => {
  if (filteredQuestions.value.length === 0) {
    ElMessage.warning('没有可导出的错题')
    return
  }

  // 生成导出内容
  let content = '错题本导出\n\n'
  filteredQuestions.value.forEach((item, index) => {
    content += `${index + 1}. ${item.question.question}\n`
    if (item.question.options.length > 0) {
      item.question.options.forEach((opt) => {
        content += `   ${opt.key}. ${opt.value}\n`
      })
    }
    content += `   你的答案：${formatAnswer(item.userAnswer)}\n`
    content += `   正确答案：${formatAnswer(item.question.answer)}\n`
    if (item.question.analysis) {
      content += `   解析：${item.question.analysis}\n`
    }
    content += `   错误次数：${item.wrongCount}\n`
    content += '\n---\n\n'
  })

  // 创建下载
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `错题本_${new Date().toLocaleDateString()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功！')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.wrong-questions-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
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
        font-size: 32px;
        font-weight: 700;
        color: $text-primary;
      }
    }
  }
}

.action-card {
  .action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-md;
  }

  .action-buttons {
    display: flex;
    gap: $spacing-sm;
  }
}

.questions-card {
  .question-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  .question-item {
    padding: $spacing-lg;
    border: 2px solid #F56C6C;
    border-radius: $border-radius-base;
    background: rgba(245, 108, 108, 0.02);

    &.resolved {
      border-color: #67C23A;
      background: rgba(103, 194, 58, 0.02);
      opacity: 0.7;
    }
  }

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;
    gap: $spacing-sm;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .header-right {
      display: flex;
      gap: 8px;
    }
  }

  .question-body {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .question-text {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.8;
    color: $text-primary;
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

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
        min-width: 24px;
      }

      .option-value {
        flex: 1;
      }
    }
  }

  .answer-row {
    margin-top: $spacing-sm;
  }

  .answer-box,
  .analysis-box {
    padding: $spacing-md;
    border-radius: $border-radius-base;

    .box-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      margin-bottom: $spacing-sm;
      color: $text-primary;
    }

    .box-content {
      font-size: 16px;
      font-weight: 500;
      line-height: 1.6;
    }
  }

  .answer-box {
    &.wrong-answer {
      background: rgba(245, 108, 108, 0.1);
      border: 2px solid rgba(245, 108, 108, 0.3);
    }

    &.correct-answer {
      background: rgba(103, 194, 58, 0.1);
      border: 2px solid rgba(103, 194, 58, 0.3);
    }
  }

  .analysis-box {
    background: rgba(64, 158, 255, 0.05);
    border-left: 4px solid #409EFF;
  }

  .meta-info {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .action-row {
    flex-direction: column;
    align-items: stretch !important;
  }

  .action-buttons {
    width: 100%;

    .el-button {
      flex: 1;
    }
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .header-right {
    width: 100%;

    .el-button {
      flex: 1;
    }
  }
}
</style>
