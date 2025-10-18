<template>
  <div class="judge-question">
    <el-radio-group v-model="internalValue" class="judge-group" :disabled="disabled">
      <el-radio-button
        v-for="option in judgeOptions"
        :key="option.key"
        :label="option.key"
      >
        {{ option.value }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question, QuestionOption } from '@/types/question'

const DEFAULT_OPTIONS: QuestionOption[] = [
  { key: 'A', value: '正确' },
  { key: 'B', value: '错误' }
]

const props = defineProps<{
  modelValue: string
  question: Question
  disabled?: boolean
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'change', value: string): void
}>()

const judgeOptions = computed(() => (props.question.options.length ? props.question.options : DEFAULT_OPTIONS))

const internalValue = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emits('update:modelValue', value)
    emits('change', value)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.judge-question {
  .judge-group {
    display: flex;
    gap: $spacing-md;

    :deep(.el-radio-button__inner) {
      min-width: 120px;
      font-size: 16px;
      letter-spacing: 1px;
      padding: $spacing-md 0;
    }
  }
}
</style>
