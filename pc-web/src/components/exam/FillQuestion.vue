<template>
  <div class="fill-question">
    <el-input
      v-model="internalValue"
      type="textarea"
      :autosize="{ minRows: 3, maxRows: 6 }"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <p class="hint">可以填写多个答案，用空格、逗号或换行分隔。</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/types/question'

const props = defineProps<{
  modelValue: string
  question: Question
  disabled?: boolean
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'change', value: string): void
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emits('update:modelValue', value)
    emits('change', value)
  }
})

const placeholder = computed(() => props.question?.analysis ? '请输入答案，可参考题目提示或解析' : '请输入答案')
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.fill-question {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  .hint {
    font-size: 12px;
    color: $text-secondary;
  }
}
</style>
