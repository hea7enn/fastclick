import * as XLSX from 'xlsx'
import type { Question, QuestionOption, ExcelRowData } from '@/types/question'
import { questionTypeMap, difficultyMap } from '@/types/question'

/**
 * 验证错误类型
 */
export interface ValidationError {
  row: number
  field: string
  message: string
}

/**
 * Excel解析结果
 */
export interface ParseResult {
  success: boolean
  data: Omit<Question, 'id' | 'createTime' | 'updateTime'>[]
  errors: ValidationError[]
}

/**
 * 解析Excel文件
 */
export const parseExcelFile = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })

        // 读取第一个sheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          resolve({
            success: false,
            data: [],
            errors: [{ row: 0, field: 'file', message: 'Excel文件中没有找到工作表' }]
          })
          return
        }
        const worksheet = workbook.Sheets[firstSheetName]
        if (!worksheet) {
          resolve({
            success: false,
            data: [],
            errors: [{ row: 0, field: 'file', message: 'Excel工作表数据无效' }]
          })
          return
        }

        // 转换为JSON
        const jsonData: ExcelRowData[] = XLSX.utils.sheet_to_json(worksheet)

        // 解析和验证数据
        const result = parseAndValidate(jsonData)
        resolve(result)
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [{ row: 0, field: 'file', message: `文件解析失败: ${error}` }]
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: [{ row: 0, field: 'file', message: '文件读取失败' }]
      })
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * 解析和验证Excel数据
 */
const parseAndValidate = (jsonData: ExcelRowData[]): ParseResult => {
  const errors: ValidationError[] = []
  const questions: Omit<Question, 'id' | 'createTime' | 'updateTime'>[] = []

  jsonData.forEach((row, index) => {
    const rowNumber = index + 2 // Excel行号从1开始，还要算上表头

    // 验证必填字段
    if (!row.题型) {
      errors.push({ row: rowNumber, field: '题型', message: '题型不能为空' })
    }
    if (!row.题目内容) {
      errors.push({ row: rowNumber, field: '题目内容', message: '题目内容不能为空' })
    }
    if (!row.正确答案) {
      errors.push({ row: rowNumber, field: '正确答案', message: '正确答案不能为空' })
    }

    // 如果有错误，跳过这一行
    if (errors.some((e) => e.row === rowNumber)) {
      return
    }

    // 解析题型
    const typeKey = row.题型!.trim()
    const type = questionTypeMap[typeKey]
    if (!type) {
      errors.push({
        row: rowNumber,
        field: '题型',
        message: `无效的题型: ${typeKey}，支持：单选/多选/判断/填空`
      })
      return
    }

    // 解析选项
    const options: QuestionOption[] = []
    if (type === 'single' || type === 'multiple') {
      const optionKeys = ['A', 'B', 'C', 'D'] as const
      optionKeys.forEach((key) => {
        const columnKey = `选项${key}` as keyof ExcelRowData
        const value = row[columnKey]
        if (value) {
          options.push({ key, value: String(value).trim() })
        }
      })

      if (options.length < 2) {
        errors.push({
          row: rowNumber,
          field: '选项',
          message: '选择题至少需要2个选项'
        })
        return
      }
    } else if (type === 'judge') {
      // 判断题固定选项
      options.push({ key: 'A', value: '正确' })
      options.push({ key: 'B', value: '错误' })
    }

    // 解析答案
    let answer: string | string[]
    const answerStr = String(row.正确答案).trim().toUpperCase()

    if (type === 'multiple') {
      // 多选题答案是数组
      answer = answerStr.split(/[,，;；]/).map((a) => a.trim()).filter(Boolean)
      
      // 验证答案是否在选项中
      const validKeys = options.map((o) => o.key)
      const invalidAnswers = answer.filter((a) => !validKeys.includes(a))
      if (invalidAnswers.length > 0) {
        errors.push({
          row: rowNumber,
          field: '正确答案',
          message: `答案包含无效选项: ${invalidAnswers.join(', ')}`
        })
        return
      }
    } else if (type === 'judge') {
      // 判断题答案转换
      if (['正确', '对', 'TRUE', 'T', 'A'].includes(answerStr)) {
        answer = 'A'
      } else if (['错误', '错', 'FALSE', 'F', 'B'].includes(answerStr)) {
        answer = 'B'
      } else {
        errors.push({
          row: rowNumber,
          field: '正确答案',
          message: '判断题答案必须是：正确/错误、对/错、A/B'
        })
        return
      }
    } else if (type === 'single') {
      // 单选题验证答案
      answer = answerStr
      const validKeys = options.map((o) => o.key)
      if (!validKeys.includes(answer)) {
        errors.push({
          row: rowNumber,
          field: '正确答案',
          message: `答案必须是选项中的一个: ${validKeys.join(', ')}`
        })
        return
      }
    } else {
      // 填空题答案
      answer = String(row.正确答案).trim()
    }

    // 解析难度
    let difficulty = 'medium'
    if (row.难度) {
      const difficultyKey = row.难度.trim()
      difficulty = difficultyMap[difficultyKey] || 'medium'
    }

    // 解析分值
    let score = 5
    if (row.分值) {
      const scoreValue = typeof row.分值 === 'number' ? row.分值 : parseFloat(row.分值)
      if (!isNaN(scoreValue) && scoreValue > 0) {
        score = scoreValue
      }
    }

    // 构建题目对象
    const questionContent = row.题目内容
    if (!questionContent) {
      return
    }

    questions.push({
      type,
      category: row.分类?.trim() || '未分类',
      question: questionContent.trim(),
      options,
      answer,
      analysis: row.解析?.trim() || '',
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      score
    })
  })

  return {
    success: errors.length === 0,
    data: questions,
    errors
  }
}

/**
 * 导出题库为Excel文件
 */
export const exportToExcel = (questions: Question[], filename = '题库导出') => {
  // 转换数据格式
  const excelData = questions.map((q) => {
    const row: Record<string, any> = {
      题型: getTypeLabel(q.type),
      分类: q.category,
      题目内容: q.question
    }

    // 选项
    if (q.type === 'single' || q.type === 'multiple') {
      q.options.forEach((opt) => {
        row[`选项${opt.key}`] = opt.value
      })
    }

    // 答案
    if (q.type === 'multiple' && Array.isArray(q.answer)) {
      row.正确答案 = q.answer.join(',')
    } else if (q.type === 'judge') {
      row.正确答案 = q.answer === 'A' ? '正确' : '错误'
    } else {
      row.正确答案 = q.answer
    }

    row.解析 = q.analysis
    row.难度 = getDifficultyLabel(q.difficulty)
    row.分值 = q.score

    return row
  })

  // 创建工作簿
  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '题库')

  // 设置列宽
  worksheet['!cols'] = [
    { wch: 10 }, // 题型
    { wch: 12 }, // 分类
    { wch: 40 }, // 题目内容
    { wch: 25 }, // 选项A
    { wch: 25 }, // 选项B
    { wch: 25 }, // 选项C
    { wch: 25 }, // 选项D
    { wch: 15 }, // 正确答案
    { wch: 30 }, // 解析
    { wch: 8 },  // 难度
    { wch: 8 }   // 分值
  ]

  // 下载文件
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * 下载Excel模板
 */
export const downloadTemplate = () => {
  const templateData = [
    {
      题型: '单选',
      分类: '数学',
      题目内容: '1+1等于几？',
      选项A: '1',
      选项B: '2',
      选项C: '3',
      选项D: '4',
      正确答案: 'B',
      解析: '基础加法运算',
      难度: '简单',
      分值: 5
    },
    {
      题型: '多选',
      分类: '语文',
      题目内容: '以下哪些是中国四大名著？',
      选项A: '西游记',
      选项B: '红楼梦',
      选项C: '三国演义',
      选项D: '水浒传',
      正确答案: 'A,B,C,D',
      解析: '四大名著包括西游记、红楼梦、三国演义、水浒传',
      难度: '简单',
      分值: 10
    },
    {
      题型: '判断',
      分类: '常识',
      题目内容: '地球是圆的',
      选项A: '',
      选项B: '',
      选项C: '',
      选项D: '',
      正确答案: '正确',
      解析: '地球是一个近似球体',
      难度: '简单',
      分值: 5
    },
    {
      题型: '填空',
      分类: '历史',
      题目内容: '中国历史上第一个统一的封建王朝是___',
      选项A: '',
      选项B: '',
      选项C: '',
      选项D: '',
      正确答案: '秦朝',
      解析: '公元前221年，秦始皇统一六国',
      难度: '中等',
      分值: 5
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '题库模板')

  // 设置列宽
  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 12 },
    { wch: 40 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 15 },
    { wch: 30 },
    { wch: 8 },
    { wch: 8 }
  ]

  XLSX.writeFile(workbook, '题库导入模板.xlsx')
}

/**
 * 获取题型标签
 */
const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    single: '单选',
    multiple: '多选',
    judge: '判断',
    fill: '填空'
  }
  return map[type] || type
}

/**
 * 获取难度标签
 */
const getDifficultyLabel = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}
