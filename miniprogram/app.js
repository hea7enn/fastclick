const {
  ensureQuestionBankInitialized
} = require('./utils/storage')

App({
  onLaunch() {
    ensureQuestionBankInitialized()
  },
  globalData: {
    appName: '智能答题系统',
    version: '1.0.0'
  }
})
