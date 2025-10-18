<template>
  <div class="page-container question-bank">
    <div class="page-title">
      <el-icon><Document /></el-icon>
      题库管理
    </div>

    <el-card class="content-card import-card">
      <template #header>
        <div class="card-header">
          <el-icon><Upload /></el-icon>
          Excel 导入
        </div>
      </template>
      <ExcelImport @success="handleImportSuccess" />
    </el-card>

    <el-card class="content-card">
      <template #header>
        <div class="card-toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索题目内容"
              clearable
              style="width: 260px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="selectedType"
              placeholder="题型"
              clearable
              style="width: 130px"
            >
              <el-option label="单选题" value="single" />
              <el-option label="多选题" value="multiple" />
              <el-option label="判断题" value="judge" />
              <el-option label="填空题" value="fill" />
            </el-select>
            <el-select
              v-model="selectedCategory"
              placeholder="分类"
              clearable
              style="width: 140px"
            >
              <el-option
                v-for="category in store.categories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
            <el-select
              v-model="selectedDifficulty"
              placeholder="难度"
              clearable
              style="width: 120px"
            >
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </div>
          <div class="toolbar-right">
            <el-button round @click="handleExport">
              <el-icon><Download /></el-icon>
              导出Excel
            </el-button>
            <el-button type="primary" round @click="handleAdd">
              <el-icon><CirclePlus /></el-icon>
              新建题目
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="store.totalCount === 0" class="empty-state">
        <el-empty description="暂无题目数据">
          <el-button type="primary" @click="handleAdd">创建第一道题目</el-button>
        </el-empty>
      </div>

      <div v-else>
        <div class="statistics">
          <el-tag type="info" size="large">
            <el-icon><List /></el-icon>
            总题数：{{ store.totalCount }}
          </el-tag>
          <el-tag type="primary" size="large">单选：{{ store.countByType.single }}</el-tag>
          <el-tag type="success" size="large">多选：{{ store.countByType.multiple }}</el-tag>
          <el-tag type="warning" size="large">判断：{{ store.countByType.judge }}</el-tag>
          <el-tag type="danger" size="large">填空：{{ store.countByType.fill }}</el-tag>
        </div>

        <el-table :data="paginatedQuestions" style="width: 100%" stripe>
          <el-table-column type="index" label="#" width="60" align="center" />

          <el-table-column prop="type" label="题型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="category" label="分类" width="120" align="center">
            <template #default="{ row }">
              <el-tag type="info" effect="plain" size="small">{{ row.category }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="question" label="题目内容" min-width="280">
            <template #default="{ row }">
              <div class="question-content">
                <div class="question-text">{{ row.question }}</div>
                <div v-if="row.type === 'single' || row.type === 'multiple'" class="question-options">
                  <span v-for="option in row.options" :key="option.key" class="option-tag">
                    {{ option.key }}:{{ option.value }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="answer" label="答案" width="120" align="center">
            <template #default="{ row }">
              <el-tag type="success" size="small">
                {{ formatAnswer(row) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="difficulty" label="难度" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="score" label="分值" width="80" align="center">
            <template #default="{ row }">
              <span class="score-text">{{ row.score }}分</span>
            </template>
          </el-table-column>

          <el-table-column prop="updateTime" label="更新时间" width="150" align="center" />

          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" text @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" text @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="table-footer">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredQuestions.length"
            background
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>
    </el-card>

    <QuestionDialog
      v-model="dialogVisible"
      :question="currentQuestion"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useQuestionBankStore } from '@/stores'
import type { Question, QuestionType, DifficultyLevel } from '@/types/question'
import { questionTypeNameMap, difficultyNameMap } from '@/types/question'
import { exportToExcel } from '@/utils'
import ExcelImport from '@/components/ExcelImport.vue'
import QuestionDialog from '@/components/QuestionDialog.vue'

const store = useQuestionBankStore()

const searchKeyword = ref('')
const selectedType = ref<string>('')
const selectedCategory = ref<string>('')
const selectedDifficulty = ref<string>('')
const currentPage = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const currentQuestion = ref<Question | undefined>()

const filteredQuestions = computed(() => {
  return store.searchQuestions(
    searchKeyword.value,
    selectedCategory.value,
    selectedDifficulty.value,
    selectedType.value
  )
})

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuestions.value.slice(start, end)
})

watch([searchKeyword, selectedType, selectedCategory, selectedDifficulty], () => {
  currentPage.value = 1
})

watch(pageSize, () => {
  currentPage.value = 1
})

watch(filteredQuestions, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / pageSize.value) || 1)
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})

const handleImportSuccess = (questions: Omit<Question, 'id' | 'createTime' | 'updateTime'>[]) => {
  if (!questions.length) {
    ElMessage.warning('导入的数据为空，请检查Excel内容')
    return
  }
  store.batchAddQuestions(questions)
  currentPage.value = 1
  ElMessage.success(`成功导入 ${questions.length} 道题目`)
}

const handleAdd = () => {
  currentQuestion.value = undefined
  dialogVisible.value = true
}

const handleEdit = (question: Question) => {
  currentQuestion.value = question
  dialogVisible.value = true
}

const handleDialogSubmit = (data: Omit<Question, 'id' | 'createTime' | 'updateTime'>) => {
  if (currentQuestion.value) {
    store.updateQuestion(currentQuestion.value.id, data)
    ElMessage.success('题目更新成功')
  } else {
    store.addQuestion(data)
    currentPage.value = 1
    ElMessage.success('题目创建成功')
  }
}

const handleDelete = async (question: Question) => {
  try {
    await ElMessageBox.confirm(`确定要删除这道题目吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    store.deleteQuestion(question.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleExport = () => {
  if (store.totalCount === 0) {
    ElMessage.warning('暂无题目可导出')
    return
  }

  try {
    const questions = filteredQuestions.value.length > 0 ? filteredQuestions.value : store.questions
    exportToExcel(questions, '题库导出')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('导出失败')
  }
}

const getTypeLabel = (type: QuestionType) => {
  return questionTypeNameMap[type] || type
}

const getTypeTagType = (type: QuestionType) => {
  const map: Record<QuestionType, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    single: 'primary',
    multiple: 'success',
    judge: 'warning',
    fill: 'danger'
  }
  return map[type]
}

const getDifficultyLabel = (difficulty: DifficultyLevel) => {
  return difficultyNameMap[difficulty] || difficulty
}

const getDifficultyTagType = (difficulty: DifficultyLevel) => {
  const map: Record<DifficultyLevel, 'success' | 'warning' | 'danger' | 'info'> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty]
}

const formatAnswer = (question: Question) => {
  if (question.type === 'judge') {
    return question.answer === 'A' ? '正确' : '错误'
  }
  if (Array.isArray(question.answer)) {
    return question.answer.join(', ')
  }
  return question.answer
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.import-card {
  margin-bottom: $spacing-lg;
}

.card-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-weight: 600;
}

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-md;

  .toolbar-left {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
    flex: 1;
  }

  .toolbar-right {
    display: flex;
    gap: $spacing-sm;
  }
}

.empty-state {
  padding: $spacing-xxl 0;
}

.statistics {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  flex-wrap: wrap;

  .el-tag {
    padding: 8px 16px;

    .el-icon {
      margin-right: 4px;
    }
  }
}

.question-content {
  .question-text {
    margin-bottom: 8px;
    line-height: 1.6;
    color: $text-primary;
  }

  .question-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .option-tag {
      display: inline-block;
      padding: 2px 8px;
      background-color: $bg-lighter;
      border-radius: $radius-sm;
      font-size: 12px;
      color: $text-secondary;
    }
  }
}

.score-text {
  font-weight: 600;
  color: $primary-color;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: $spacing-lg;
}

@media (max-width: 768px) {
  .card-toolbar {
    flex-direction: column;
    align-items: stretch;

    .toolbar-left,
    .toolbar-right {
      width: 100%;
      flex-direction: column;
    }
  }

  .statistics {
    .el-tag {
      flex: 1 1 calc(50% - #{$spacing-md});
      text-align: center;
    }
  }
}
</style>
