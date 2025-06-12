// 精度常量定义 - 统一的数值精度标准
export const PRECISION = {
  TIME: 3,        // 时间精度：3位小数 (0.001ms) - 用于时间间隔、抖动等
  PERCENTAGE: 2,  // 百分比精度：2位小数 (0.01%) - 用于稳定性、变异系数等
  FREQUENCY: 1,   // 频率精度：1位小数 (0.1Hz) - 用于回报率
  LATENCY: 2,     // 延迟精度：2位小数 (0.01ms) - 用于响应时间
  DURATION: 1     // 持续时间精度：1位小数 (0.1s) - 用于测试时长显示
} as const

/**
 * 精确舍入函数
 * 使用 Number.EPSILON 避免浮点数精度问题
 * @param value 要舍入的数值
 * @param precision 精度位数
 * @returns 精确舍入后的数值
 */
export const preciseRound = (value: number, precision: number): number => {
  if (!isFinite(value) || isNaN(value)) return 0
  const factor = Math.pow(10, precision)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/**
 * 计算精确百分位数
 * 使用线性插值方法，比简单索引更精确
 * @param sortedArray 已排序的数组
 * @param percentile 百分位数 (0-100)
 * @returns 百分位数值
 */
export const calculatePercentile = (sortedArray: number[], percentile: number): number => {
  if (sortedArray.length === 0) return 0
  
  const index = (percentile / 100) * (sortedArray.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  
  if (lower === upper) {
    return sortedArray[lower]
  }
  
  const weight = index - lower
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
}

/**
 * 格式化延迟数值
 * @param value 延迟值（毫秒）
 * @returns 格式化后的字符串
 */
export const formatLatency = (value: number): string => {
  return `${preciseRound(value, PRECISION.LATENCY)}ms`
}

/**
 * 格式化频率数值
 * @param value 频率值（赫兹）
 * @returns 格式化后的字符串
 */
export const formatFrequency = (value: number): string => {
  return `${preciseRound(value, PRECISION.FREQUENCY)}Hz`
}

/**
 * 格式化百分比数值
 * @param value 百分比值
 * @returns 格式化后的字符串
 */
export const formatPercentage = (value: number): string => {
  return `${preciseRound(value, PRECISION.PERCENTAGE)}%`
}

/**
 * 格式化时间数值
 * @param value 时间值（毫秒）
 * @returns 格式化后的字符串
 */
export const formatTime = (value: number): string => {
  return `${preciseRound(value, PRECISION.TIME)}ms`
}

/**
 * 格式化持续时间
 * @param value 持续时间（毫秒）
 * @returns 格式化后的字符串（秒）
 */
export const formatDuration = (value: number): string => {
  return `${preciseRound(value / 1000, PRECISION.DURATION)}s`
} 
