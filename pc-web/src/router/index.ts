import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: '/question-bank',
        name: 'QuestionBank',
        component: () => import('@/views/QuestionBank.vue'),
        meta: { title: '题库管理', icon: 'Document' }
      },
      {
        path: '/exam',
        name: 'Exam',
        component: () => import('@/views/Exam.vue'),
        meta: { title: '开始答题', icon: 'Edit' }
      },
      {
        path: '/result',
        name: 'Result',
        component: () => import('@/views/Result.vue'),
        meta: { title: '成绩查询', icon: 'TrendCharts' }
      },
      {
        path: '/answer-analysis',
        name: 'AnswerAnalysis',
        component: () => import('@/views/AnswerAnalysis.vue'),
        meta: { title: '答案解析', icon: 'Document' }
      },
      {
        path: '/wrong-questions',
        name: 'WrongQuestions',
        component: () => import('@/views/WrongQuestions.vue'),
        meta: { title: '错题本', icon: 'Warning' }
      },
      {
        path: '/history',
        name: 'History',
        component: () => import('@/views/History.vue'),
        meta: { title: '答题历史', icon: 'Clock' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
