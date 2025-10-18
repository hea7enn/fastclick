<template>
  <el-container class="layout-wrapper">
    <el-aside :width="isCollapse ? '72px' : '240px'" class="layout-sidebar">
      <div class="brand" @click="goHome">
        <el-icon v-if="isCollapse"><Compass /></el-icon>
        <template v-else>
          <span class="brand-icon">IQ+</span>
          <span class="brand-name">智答实验室</span>
        </template>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="layout-menu"
        :collapse="isCollapse"
        router
        background-color="transparent"
        text-color="#cfd6e6"
        active-text-color="#ffffff"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-button circle class="collapse-btn" text size="large" @click="toggleCollapse">
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <h1 class="header-title">{{ currentTitle }}</h1>
        </div>
        <div class="header-right">
          <el-tag size="large" type="success" effect="dark">
            欢迎回来，{{ username || '未登录用户' }}
          </el-tag>
          <el-button type="primary" round plain @click="handleAction">
            <el-icon><Avatar /></el-icon>
            <span>{{ username ? '个人中心' : '立即登录' }}</span>
          </el-button>
        </div>
      </el-header>

      <el-main class="layout-content">
        <RouterView v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </RouterView>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const isMobile = ref(false)

const menuItems = computed(() => [
  { path: '/home', title: '首页', icon: 'HomeFilled' },
  { path: '/question-bank', title: '题库管理', icon: 'Document' },
  { path: '/exam', title: '开始答题', icon: 'Edit' },
  { path: '/result', title: '成绩查询', icon: 'TrendCharts' }
])

const activeMenu = computed(() => route.path)

const currentTitle = computed(() => route.meta.title as string)

const username = computed(() => userStore.username)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 1024
  isCollapse.value = isMobile.value
}

const toggleCollapse = () => {
  if (isMobile.value) {
    isCollapse.value = !isCollapse.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}

const goHome = () => {
  router.push('/home')
}

const handleAction = () => {
  if (!userStore.isLogin) {
    userStore.setUserInfo({ username: '体验用户', userId: 'guest-001' })
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.layout-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #141e30 0%, #243b55 100%);
}

.layout-sidebar {
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(14px);
  background: rgba(17, 30, 48, 0.85);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
  font-weight: 700;
  font-size: 20px;
  color: #ffffff;
  letter-spacing: 2px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  transition: $transition-base;

  .brand-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin-right: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    font-size: 16px;
  }
}

.brand:hover {
  background: rgba(64, 158, 255, 0.18);
}

.layout-menu {
  flex: 1;
  border-right: none;
  margin-top: 12px;
}

.layout-main {
  background: rgba(243, 246, 255, 0.96);
  backdrop-filter: blur(10px);
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 $spacing-lg;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(22, 31, 48, 0.08);
  box-shadow: 0 8px 16px rgba(15, 29, 54, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: $text-primary;
}

.collapse-btn {
  color: #6c7a92;
  transition: $transition-base;

  &:hover {
    color: $primary-color;
    background-color: rgba(64, 158, 255, 0.1);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.layout-content {
  padding: $spacing-lg;
  background: linear-gradient(135deg, #eff3ff 0%, #f2f6ff 100%);
}

@media (max-width: 1024px) {
  .layout-sidebar {
    position: fixed;
    z-index: 2000;
    height: 100%;
    left: 0;
    top: 0;
    transform: translateX(0);
  }

  .layout-main {
    margin-left: 72px;
  }
}

@media (max-width: 768px) {
  .layout-main {
    margin-left: 0;
  }

  .layout-header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;
    padding: $spacing-md;
    height: auto;
  }

  .layout-content {
    padding: $spacing-md;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
