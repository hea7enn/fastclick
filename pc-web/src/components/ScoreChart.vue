<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface Props {
  correctCount: number
  wrongCount: number
  unansweredCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  unansweredCount: 0
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '答题情况',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { 
            value: props.correctCount, 
            name: '正确',
            itemStyle: { color: '#67C23A' }
          },
          { 
            value: props.wrongCount, 
            name: '错误',
            itemStyle: { color: '#F56C6C' }
          },
          ...(props.unansweredCount > 0 ? [{
            value: props.unansweredCount,
            name: '未作答',
            itemStyle: { color: '#E6A23C' }
          }] : [])
        ]
      }
    ]
  }

  chartInstance.setOption(option)
}

const updateChart = () => {
  if (!chartInstance) return

  chartInstance.setOption({
    series: [{
      data: [
        { 
          value: props.correctCount, 
          name: '正确',
          itemStyle: { color: '#67C23A' }
        },
        { 
          value: props.wrongCount, 
          name: '错误',
          itemStyle: { color: '#F56C6C' }
        },
        ...(props.unansweredCount > 0 ? [{
          value: props.unansweredCount,
          name: '未作答',
          itemStyle: { color: '#E6A23C' }
        }] : [])
      ]
    }]
  })
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

watch(
  () => [props.correctCount, props.wrongCount, props.unansweredCount],
  () => {
    updateChart()
  }
)
</script>

<style scoped lang="scss">
.chart-container {
  width: 100%;
  height: 300px;
}
</style>
