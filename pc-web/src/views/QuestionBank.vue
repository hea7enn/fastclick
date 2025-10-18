<template>
  <div class="page-container question-bank">
    <div class="page-title">
      <el-icon><Document /></el-icon>
      题库管理
    </div>

    <el-card class="content-card">
      <template #header>
        <div class="card-toolbar">
          <div class="toolbar-left">
            <el-input v-model="searchKeyword" placeholder="搜索题目、标签或关键字" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="selectedCategory" placeholder="题目分类" clearable style="width: 160px">
              <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
            </el-select>
            <el-select v-model="difficulty" placeholder="难度" clearable style="width: 140px">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </div>
          <el-button type="primary" round @click="newQuestion">
            <el-icon><CirclePlus /></el-icon>
            新建题目
          </el-button>
        </div>
      </template>

      <el-table :data="filteredQuestions" style="width: 100%">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="title" label="题目" min-width="260">
          <template #default="scope">
            <div class="question-title">{{ scope.row.title }}</div>
            <div class="question-meta">
              <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" type="info" effect="dark">{{ tag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" align="center" />
        <el-table-column prop="difficulty" label="难度" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getDifficultyType(scope.row.difficulty)">
              {{ getDifficultyLabel(scope.row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" align="center" />
        <el-table-column label="操作" width="160" align="center">
          <template #default>
            <el-button type="primary" text>编辑</el-button>
            <el-button type="danger" text>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="filteredQuestions.length"
          :page-size="10"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface QuestionItem {
  id: string
  title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  updateTime: string
}

const searchKeyword = ref('')
const selectedCategory = ref<string | null>(null)
const difficulty = ref<string | null>(null)

const categories = ['数学', '英语', '物理', '化学', '历史']

const questions = ref<QuestionItem[]>([
  {
    id: '1',
    title: '下列函数中，定义域为全体实数的是？',
    category: '数学',
    difficulty: 'medium',
    tags: ['基础', '函数'],
    updateTime: '2024-10-10 18:30'
  },
  {
    id: '2',
    title: 'The synonym of "rapid" is?',
    category: '英语',
    difficulty: 'easy',
    tags: ['词汇', '阅读'],
    updateTime: '2024-10-09 14:20'
  },
  {
    id: '3',
    title: '如何解释光的干涉现象？',
    category: '物理',
    difficulty: 'hard',
    tags: ['光学', '推理'],
    updateTime: '2024-10-08 09:45'
  },
  {
    id: '4',
    title: '中国古代四大发明分别是什么？',
    category: '历史',
    difficulty: 'easy',
    tags: ['文化', '记忆'],
    updateTime: '2024-10-07 11:10'
  }
])

const filteredQuestions = computed(() => {
  return questions.value.filter((item) => {
    const matchKeyword =
      !searchKeyword.value ||
      item.title.includes(searchKeyword.value) ||
      item.tags.some((tag) => tag.includes(searchKeyword.value))

    const matchCategory = !selectedCategory.value || item.category === selectedCategory.value
    const matchDifficulty = !difficulty.value || item.difficulty === difficulty.value

    return matchKeyword && matchCategory && matchDifficulty
  })
})

const getDifficultyLabel = (level: QuestionItem['difficulty']) => {
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

const getDifficultyType = (level: QuestionItem['difficulty']) => {
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

const newQuestion = () => {
  // TODO: 跳转到新建题目页
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-md;

  .toolbar-left {
    display: flex;
    gap: $spacing-md;
    flex-wrap: wrap;
  }
}

.question-title {
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 6px;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: $spacing-md;
}

@media (max-width: 768px) {
  .card-toolbar {
    flex-direction: column;
    align-items: stretch;

    .toolbar-left {
      width: 100%;
      flex-direction: column;
    }
  }
}
</style>
