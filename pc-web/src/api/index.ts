export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export async function fetchQuestions() {
  // TODO: 实现真实 API 调用
  return []
}

export async function submitAnswer(_examId: string, _answers: Record<string, string>) {
  // TODO: 实现真实 API 调用
  return { success: true }
}

export async function getExamResult(_examId: string) {
  // TODO: 实现真实 API 调用
  return {}
}
