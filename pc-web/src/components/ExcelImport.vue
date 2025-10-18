<template>
  <div class="excel-import">
    <div class="import-actions">
      <el-upload
        class="upload-area"
        drag
        :auto-upload="false"
        :show-file-list="false"
        accept=".xlsx,.xls"
        :disabled="loading"
        @change="handleFileChange"
      >
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="upload-tip">支持 xls/xlsx 格式，模板请先下载再填写</div>
        </template>
      </el-upload>

      <el-button class="template-btn" :loading="loadingTemplate" @click="handleDownloadTemplate">
        <el-icon><Download /></el-icon>
        下载模板
      </el-button>
    </div>

    <div v-if="errors.length" class="error-list">
      <el-alert type="error" title="导入失败，请检查以下错误：" show-icon :closable="false">
        <ul class="error-items">
          <li v-for="item in errors" :key="`${item.row}-${item.field}`">
            第 {{ item.row }} 行 [{{ item.field }}]：{{ item.message }}
          </li>
        </ul>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile, UploadFiles } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { ParseResult, ValidationError } from '@/utils'
import { parseExcelFile, downloadTemplate } from '@/utils'

const emits = defineEmits<{
  (event: 'success', payload: ParseResult['data']): void
  (event: 'error', payload: ValidationError[]): void
}>()

const loading = ref(false)
const loadingTemplate = ref(false)
const errors = ref<ValidationError[]>([])

const handleFileChange = async (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  if (!uploadFile.raw) {
    ElMessage.warning('请选择正确的Excel文件')
    return
  }

  loading.value = true

  const result = await parseExcelFile(uploadFile.raw)

  if (result.success) {
    errors.value = []
    emits('success', result.data)
    ElMessage.success(`成功导入 ${result.data.length} 道题目！`)
  } else {
    errors.value = result.errors
    emits('error', result.errors)
    ElMessage.error('导入失败，请检查错误信息')
  }

  loading.value = false
  // 清空已选择文件
  uploadFiles.splice(0, uploadFiles.length)
}

const handleDownloadTemplate = async () => {
  loadingTemplate.value = true
  try {
    await downloadTemplate()
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('模板下载失败')
  } finally {
    loadingTemplate.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.excel-import {
  .import-actions {
    display: flex;
    gap: $spacing-lg;
    align-items: center;
    flex-wrap: wrap;

    .upload-area {
      width: 360px;
      max-width: 100%;
      border: 1px dashed $border-color;
      border-radius: $radius-md;
      transition: border-color 0.2s ease;

      &:hover {
        border-color: $primary-color;
      }

      .upload-icon {
        font-size: 42px;
        color: $primary-color;
        margin-bottom: $spacing-sm;
      }

      .upload-tip {
        margin-top: $spacing-sm;
        color: $text-secondary;
        font-size: 12px;
        text-align: center;
      }
    }

    .template-btn {
      align-self: flex-start;
    }
  }

  .error-list {
    margin-top: $spacing-lg;

    .error-items {
      margin: $spacing-sm 0 0;
      padding-left: $spacing-md;

      li {
        line-height: 1.6;
        color: $danger-color;
      }
    }
  }
}
</style>
