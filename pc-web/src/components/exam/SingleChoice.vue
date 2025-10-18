<template>
  <div class="single-choice">
    <el-radio-group v-if="question.options.length" v-model="internalValue" class="option-group" :disabled="disabled">
      <el-radio
        v-for="option in question.options"
        :key="option.key"
        :label="option.key"
        class="option-item"
        border
      >
        <span class="option-key">{{ option.key }}</span>
        <span class="option-text">{{ option.value }}</span>
      </el-radio>
    </el-radio-group>
    <el-empty v-else description="题目选项缺失" />
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
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.single-choice {
  .option-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .option-item {
    width: 100%;
    margin: 0;
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-base;
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    :deep(.el-radio__label) {
      flex: 1;
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-size: 16px;
      color: $text-primary;
    }

    .option-key {
      font-weight: 600;
      color: $primary-color;
    }

    .option-text {
      flex: 1;
      line-height: 1.6;
    }
  }
}
</style>
