<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑题目' : '新建题目'"
    width="700px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="题型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择题型" @change="handleTypeChange">
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="判断题" value="judge" />
          <el-option label="填空题" value="fill" />
        </el-select>
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-input v-model="formData.category" placeholder="请输入分类，如：数学、英语" clearable />
      </el-form-item>

      <el-form-item label="题目内容" prop="question">
        <el-input
          v-model="formData.question"
          type="textarea"
          :rows="3"
          placeholder="请输入题目内容"
        />
      </el-form-item>

      <el-form-item
        v-if="formData.type === 'single' || formData.type === 'multiple'"
        label="选项"
        prop="options"
      >
        <div class="options-list">
          <div v-for="(option, index) in formData.options" :key="index" class="option-item">
            <span class="option-key">{{ option.key }}.</span>
            <el-input
              v-model="option.value"
              placeholder="请输入选项内容"
              clearable
              @blur="validateOptions"
            />
            <el-button
              v-if="formData.options.length > 2"
              type="danger"
              text
              @click="removeOption(index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button v-if="formData.options.length < 6" text @click="addOption">
            <el-icon><Plus /></el-icon>
            添加选项
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="正确答案" prop="answer">
        <el-select
          v-if="formData.type === 'single'"
          v-model="formData.answer"
          placeholder="请选择正确答案"
        >
          <el-option
            v-for="option in formData.options"
            :key="option.key"
            :label="`${option.key}. ${option.value}`"
            :value="option.key"
          />
        </el-select>

        <el-select
          v-else-if="formData.type === 'multiple'"
          v-model="formData.answer"
          multiple
          placeholder="请选择正确答案（可多选）"
        >
          <el-option
            v-for="option in formData.options"
            :key="option.key"
            :label="`${option.key}. ${option.value}`"
            :value="option.key"
          />
        </el-select>

        <el-radio-group v-else-if="formData.type === 'judge'" v-model="formData.answer">
          <el-radio label="A">正确</el-radio>
          <el-radio label="B">错误</el-radio>
        </el-radio-group>

        <el-input v-else v-model="formData.answer" placeholder="请输入正确答案" clearable />
      </el-form-item>

      <el-form-item label="答案解析" prop="analysis">
        <el-input
          v-model="formData.analysis"
          type="textarea"
          :rows="3"
          placeholder="请输入答案解析"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="难度" prop="difficulty">
            <el-select v-model="formData.difficulty" placeholder="请选择难度">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分值" prop="score">
            <el-input-number
              v-model="formData.score"
              :min="1"
              :max="100"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Question, QuestionOption, QuestionType, DifficultyLevel } from '@/types/question'

interface FormData {
  type: QuestionType
  category: string
  question: string
  options: QuestionOption[]
  answer: string | string[]
  analysis: string
  difficulty: DifficultyLevel
  score: number
}

const props = defineProps<{
  modelValue: boolean
  question?: Question
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'submit', data: FormData): void
}>()

const visible = ref(props.modelValue)
const loading = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const defaultOptions = (): QuestionOption[] => [
  { key: 'A', value: '' },
  { key: 'B', value: '' },
  { key: 'C', value: '' },
  { key: 'D', value: '' }
]

const formData = reactive<FormData>({
  type: 'single',
  category: '',
  question: '',
  options: defaultOptions(),
  answer: '',
  analysis: '',
  difficulty: 'medium',
  score: 5
})

const optionsValidator = (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
  if (formData.type === 'single' || formData.type === 'multiple') {
    const validOptions = formData.options.filter((opt) => opt.value.trim())
    if (validOptions.length < 2) {
      callback(new Error('至少需要2个选项'))
      return
    }
  }
  callback()
}

const rules = reactive<FormRules<FormData>>({
  type: [{ required: true, message: '请选择题型', trigger: 'change' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  question: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  options: [{ validator: optionsValidator, trigger: 'blur' }],
  answer: [{ required: true, message: '请输入正确答案', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  score: [{ required: true, message: '请输入分值', trigger: 'change' }]
})

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.question) {
      isEdit.value = true
      Object.assign(formData, {
        type: props.question.type,
        category: props.question.category,
        question: props.question.question,
        options: props.question.options.length ? props.question.options.map((item) => ({ ...item })) : defaultOptions(),
        answer: Array.isArray(props.question.answer)
          ? [...props.question.answer]
          : props.question.answer,
        analysis: props.question.analysis,
        difficulty: props.question.difficulty,
        score: props.question.score
      })
    } else {
      isEdit.value = false
    }
  }
)

watch(visible, (val) => {
  emits('update:modelValue', val)
})

const handleTypeChange = (type: QuestionType) => {
  formData.answer = type === 'multiple' ? [] : ''

  if (type === 'judge') {
    formData.options = [
      { key: 'A', value: '正确' },
      { key: 'B', value: '错误' }
    ]
  } else if (type === 'single' || type === 'multiple') {
    if (
      formData.options.length === 0 ||
      (formData.options[0] && formData.options[0].key === 'A' && formData.options[0].value === '正确')
    ) {
      formData.options = defaultOptions()
    }
  } else {
    formData.options = []
  }

  nextTick(() => {
    formRef.value?.clearValidate(['answer', 'options'])
  })
}

const addOption = () => {
  const nextKey = String.fromCharCode(65 + formData.options.length)
  formData.options.push({ key: nextKey, value: '' })
}

const removeOption = (index: number) => {
  formData.options.splice(index, 1)
  formData.options = formData.options.map((opt, idx) => ({
    key: String.fromCharCode(65 + idx),
    value: opt.value
  })) as QuestionOption[]

  const validKeys = formData.options.map((o) => o.key)

  if (typeof formData.answer === 'string') {
    if (!validKeys.includes(formData.answer)) {
      formData.answer = ''
    }
  } else if (Array.isArray(formData.answer)) {
    formData.answer = formData.answer.filter((a) => validKeys.includes(a))
  }

  validateOptions()
}

const validateOptions = () => {
  nextTick(() => {
    formRef.value?.validateField('options')
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  loading.value = true

  try {
    const valid = await formRef.value.validate()
    if (!valid) {
      return
    }

    const submitData: FormData = {
      type: formData.type,
      category: formData.category.trim(),
      question: formData.question.trim(),
      options:
        formData.type === 'single' || formData.type === 'multiple' || formData.type === 'judge'
          ? formData.options.filter((opt) => opt.value.trim())
          : [],
      answer: formData.answer,
      analysis: formData.analysis.trim(),
      difficulty: formData.difficulty,
      score: formData.score
    }

    emits('submit', submitData)
    visible.value = false
  } catch (error) {
    console.warn('表单校验失败', error)
  } finally {
    loading.value = false
  }
}

const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    type: 'single',
    category: '',
    question: '',
    options: defaultOptions(),
    answer: '',
    analysis: '',
    difficulty: 'medium',
    score: 5
  })
  isEdit.value = false
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.options-list {
  width: 100%;

  .option-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;

    .option-key {
      font-weight: 600;
      color: $primary-color;
      min-width: 24px;
    }

    .el-input {
      flex: 1;
    }
  }
}
</style>
