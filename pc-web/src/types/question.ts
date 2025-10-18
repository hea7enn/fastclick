/**
 * 题目类型
 */
export type QuestionType = 'single' | 'multiple' | 'judge' | 'fill'

/**
 * 难度级别
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

/**
 * 选项接口（用于选择题和判断题）
 */
export interface QuestionOption {
  key: string
  value: string
}

/**
 * 题目接口
 */
export interface Question {
  id: string
  type: QuestionType
  category: string
  question: string
  options: QuestionOption[]
  answer: string | string[]
  analysis: string
  difficulty: DifficultyLevel
  score: number
  createTime?: string
  updateTime?: string
}

/**
 * Excel 导入的原始行数据
 */
export interface ExcelRowData {
  题型?: string
  分类?: string
  题目内容?: string
  选项A?: string
  选项B?: string
  选项C?: string
  选项D?: string
  正确答案?: string
  解析?: string
  难度?: string
  分值?: string | number
}

/**
 * 题型映射
 */
export const questionTypeMap: Record<string, QuestionType> = {
  单选: 'single',
  单选题: 'single',
  多选: 'multiple',
  多选题: 'multiple',
  判断: 'judge',
  判断题: 'judge',
  填空: 'fill',
  填空题: 'fill'
}

/**
 * 难度映射
 */
export const difficultyMap: Record<string, DifficultyLevel> = {
  简单: 'easy',
  容易: 'easy',
  中等: 'medium',
  中: 'medium',
  困难: 'hard',
  难: 'hard'
}

/**
 * 题型中文名称映射
 */
export const questionTypeNameMap: Record<QuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题'
}

/**
 * 难度中文名称映射
 */
export const difficultyNameMap: Record<DifficultyLevel, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}
