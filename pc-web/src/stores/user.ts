import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const username = ref<string>('')
  const userId = ref<string>('')
  const isLogin = ref<boolean>(false)

  const setUserInfo = (user: { username: string; userId: string }) => {
    username.value = user.username
    userId.value = user.userId
    isLogin.value = true
  }

  const logout = () => {
    username.value = ''
    userId.value = ''
    isLogin.value = false
  }

  return {
    username,
    userId,
    isLogin,
    setUserInfo,
    logout
  }
})
