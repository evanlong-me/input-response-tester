import { PRECISION, preciseRound, calculatePercentile } from './precision-utils'

interface TestResult {
  timestamp: number
  responseTime: number
  testType: 'mouse' | 'keyboard'
}

interface MouseMoveEvent {
  timestamp: number
  x: number
  y: number
}

interface Stats {
  avg: number
  min: number
  max: number
  count: number
}

interface AdvancedStats {
  stability: number
  consistency: number
  performance: number
  reliability: number
  median: number
  p95: number
  p99: number
  standardDeviation: number
  coefficientOfVariation: number
  jitterIndex: number
}

interface ReportRateStats {
  averageInterval: number
  reportRate: number
  maxReportRate: number
  minReportRate: number
  jitter: number
  stability: number
  totalEvents: number
  testDuration: number
  effectiveReportRate: number
  signalQuality: number
  frequencyStability: number
  intervalVariance: number
  medianInterval: number
  p95Interval: number
}

// 计算基础统计数据
export const calculateStats = (
  results: TestResult[],
  type?: 'mouse' | 'keyboard'
): Stats => {
  const filtered = results.filter((r) => !type || r.testType === type)

  if (filtered.length === 0) {
    return { avg: 0, min: 0, max: 0, count: 0 }
  }

  const times = filtered.map((r) => r.responseTime)
  const sum = times.reduce((a, b) => a + b, 0)
  
  return {
    avg: preciseRound(sum / times.length, PRECISION.LATENCY),
    min: Math.min(...times),
    max: Math.max(...times),
    count: times.length
  }
}

// 计算高级统计数据
export const calculateAdvancedStats = (results: TestResult[]): AdvancedStats => {
  if (results.length === 0) {
    return {
      stability: 0,
      consistency: 0,
      performance: 0,
      reliability: 0,
      median: 0,
      p95: 0,
      p99: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      jitterIndex: 0
    }
  }

  const times = results.map((r) => r.responseTime).sort((a, b) => a - b)
  const sum = times.reduce((a, b) => a + b, 0)
  const avg = sum / times.length

  // 精确计算百分位数
  const median = calculatePercentile(times, 50)
  const p95 = calculatePercentile(times, 95)
  const p99 = calculatePercentile(times, 99)

  // 精确计算方差和标准差
  const variance = times.reduce((acc, time) => acc + Math.pow(time - avg, 2), 0) / times.length
  const stdDev = Math.sqrt(variance)

  // 变异系数
  const coefficientOfVariation = avg > 0 ? (stdDev / avg) * 100 : 0

  // 抖动指数（基于相邻测量值的差异）
  let jitterSum = 0
  for (let i = 1; i < results.length; i++) {
    jitterSum += Math.abs(results[i].responseTime - results[i - 1].responseTime)
  }
  const jitterIndex = results.length > 1 ? jitterSum / (results.length - 1) : 0

  // 优化的评分算法 - 更精确的分段计算
  
  // 稳定性评分：基于变异系数的精确分段函数
  let stability = 0
  if (coefficientOfVariation <= 5) {
    stability = 100 // 变异系数 <= 5% 为优秀
  } else if (coefficientOfVariation <= 10) {
    stability = 100 - (coefficientOfVariation - 5) * 4 // 5-10% 线性下降到 80分
  } else if (coefficientOfVariation <= 20) {
    stability = 80 - (coefficientOfVariation - 10) * 3 // 10-20% 线性下降到 50分
  } else if (coefficientOfVariation <= 40) {
    stability = 50 - (coefficientOfVariation - 20) * 1.5 // 20-40% 线性下降到 20分
  } else {
    stability = Math.max(0, 20 - (coefficientOfVariation - 40) * 0.5) // 40%以上缓慢下降
  }

  // 一致性评分：基于标准差与平均值的比值
  const consistencyRatio = avg > 0 ? (stdDev / avg) * 100 : 100
  let consistency = 0
  if (consistencyRatio <= 3) {
    consistency = 100 // 标准差/均值 <= 3% 为优秀
  } else if (consistencyRatio <= 8) {
    consistency = 100 - (consistencyRatio - 3) * 6 // 3-8% 线性下降到 70分
  } else if (consistencyRatio <= 15) {
    consistency = 70 - (consistencyRatio - 8) * 4 // 8-15% 线性下降到 42分
  } else if (consistencyRatio <= 30) {
    consistency = 42 - (consistencyRatio - 15) * 2 // 15-30% 线性下降到 12分
  } else {
    consistency = Math.max(0, 12 - (consistencyRatio - 30) * 0.4) // 30%以上缓慢下降
  }

  // 性能评分：基于平均延迟的精确分段
  let performance = 0
  if (avg <= 5) {
    performance = 100 // <= 5ms 为顶级性能
  } else if (avg <= 10) {
    performance = 100 - (avg - 5) * 4 // 5-10ms 线性下降到 80分
  } else if (avg <= 20) {
    performance = 80 - (avg - 10) * 3 // 10-20ms 线性下降到 50分
  } else if (avg <= 40) {
    performance = 50 - (avg - 20) * 1.5 // 20-40ms 线性下降到 20分
  } else if (avg <= 80) {
    performance = 20 - (avg - 40) * 0.25 // 40-80ms 线性下降到 10分
  } else {
    performance = Math.max(0, 10 - (avg - 80) * 0.1) // 80ms以上缓慢下降
  }

  // 可靠性：综合考虑稳定性和一致性，但给稳定性更高权重
  const reliability = (stability * 0.6 + consistency * 0.4)

  return {
    stability: preciseRound(Math.max(0, Math.min(100, stability)), PRECISION.PERCENTAGE),
    consistency: preciseRound(Math.max(0, Math.min(100, consistency)), PRECISION.PERCENTAGE),
    performance: preciseRound(Math.max(0, Math.min(100, performance)), PRECISION.PERCENTAGE),
    reliability: preciseRound(Math.max(0, Math.min(100, reliability)), PRECISION.PERCENTAGE),
    median: preciseRound(median, PRECISION.LATENCY),
    p95: preciseRound(p95, PRECISION.LATENCY),
    p99: preciseRound(p99, PRECISION.LATENCY),
    standardDeviation: preciseRound(stdDev, PRECISION.LATENCY),
    coefficientOfVariation: preciseRound(coefficientOfVariation, PRECISION.PERCENTAGE),
    jitterIndex: preciseRound(jitterIndex, PRECISION.LATENCY)
  }
}

// 计算鼠标移动回报率统计数据
export const calculateMouseMoveReportRate = (events: MouseMoveEvent[]): ReportRateStats => {
  if (events.length < 2) {
    return {
      averageInterval: 0,
      reportRate: 0,
      maxReportRate: 0,
      minReportRate: 0,
      jitter: 0,
      stability: 0,
      totalEvents: 0,
      effectiveReportRate: 0,
      signalQuality: 0,
      medianInterval: 0,
      testDuration: 0,
      frequencyStability: 0,
      intervalVariance: 0,
      p95Interval: 0
    }
  }

  // 计算精确时间间隔
  const intervals: number[] = []
  for (let i = 1; i < events.length; i++) {
    const interval = events[i].timestamp - events[i - 1].timestamp
    if (interval > 0) {
      intervals.push(interval)
    }
  }

  if (intervals.length === 0) {
    return {
      averageInterval: 0,
      reportRate: 0,
      maxReportRate: 0,
      minReportRate: 0,
      jitter: 0,
      stability: 0,
      totalEvents: events.length,
      effectiveReportRate: 0,
      signalQuality: 0,
      medianInterval: 0,
      testDuration: 0,
      frequencyStability: 0,
      intervalVariance: 0,
      p95Interval: 0
    }
  }

  // 智能异常值过滤
  // 1. 计算四分位数范围 (IQR) 进行异常值检测
  const sortedIntervals = [...intervals].sort((a, b) => a - b)
  const q1 = calculatePercentile(sortedIntervals, 25)
  const q3 = calculatePercentile(sortedIntervals, 75)
  const iqr = q3 - q1
  
  // 2. 使用 IQR 方法过滤异常值，但保留合理的边界
  const lowerBound = Math.max(0.1, q1 - 1.5 * iqr) // 最小0.1ms
  const upperBound = Math.min(500, q3 + 1.5 * iqr) // 最大500ms
  
  const filteredIntervals = intervals.filter(interval => 
    interval >= lowerBound && interval <= upperBound
  )
  
  // 如果过滤后数据太少，使用更宽松的过滤条件
  const validIntervals = filteredIntervals.length >= Math.max(3, intervals.length * 0.5) 
    ? filteredIntervals 
    : intervals.filter(interval => interval >= 0.1 && interval <= 500)

  // 精确统计计算
  const sum = validIntervals.reduce((a, b) => a + b, 0)
  const averageInterval = sum / validIntervals.length
  const minInterval = Math.min(...validIntervals)
  const maxInterval = Math.max(...validIntervals)
  
  // 精确百分位数计算
  const sortedValidIntervals = [...validIntervals].sort((a, b) => a - b)
  const medianInterval = calculatePercentile(sortedValidIntervals, 50)
  const p95IntervalValue = calculatePercentile(sortedValidIntervals, 95)

  // 精确回报率计算
  const reportRate = preciseRound(1000 / averageInterval, PRECISION.FREQUENCY)
  const effectiveReportRate = preciseRound(1000 / medianInterval, PRECISION.FREQUENCY)
  const maxReportRate = preciseRound(1000 / minInterval, PRECISION.FREQUENCY)
  const minReportRate = preciseRound(1000 / maxInterval, PRECISION.FREQUENCY)

  // 精确方差和抖动计算
  const variance = validIntervals.reduce((acc, interval) => 
    acc + Math.pow(interval - averageInterval, 2), 0) / validIntervals.length
  const jitter = Math.sqrt(variance)

  // 精确稳定性指标
  const coefficientOfVariation = averageInterval > 0 ? (jitter / averageInterval) * 100 : 0
  const stability = Math.max(0, Math.min(100, 100 - coefficientOfVariation))
  
  // 精确信号质量 - 基于事件分布均匀性和一致性
  let signalQuality = 0
  if (validIntervals.length > 2) {
    // 计算相邻间隔的差异程度
    const intervalDifferences = []
    for (let i = 1; i < validIntervals.length; i++) {
      intervalDifferences.push(Math.abs(validIntervals[i] - validIntervals[i - 1]))
    }
    
    const avgDifference = intervalDifferences.reduce((a, b) => a + b, 0) / intervalDifferences.length
    const maxDifference = Math.max(...intervalDifferences)
    
    // 信号质量基于：1) 间隔一致性 2) 峰值控制 3) 整体分布
    const consistencyScore = averageInterval > 0 ? Math.max(0, 100 - (avgDifference / averageInterval) * 200) : 0
    const peakControlScore = averageInterval > 0 ? Math.max(0, 100 - (maxDifference / averageInterval) * 100) : 0
    const distributionScore = Math.max(0, 100 - Math.abs(medianInterval - averageInterval) / averageInterval * 100)
    
    signalQuality = (consistencyScore * 0.5 + peakControlScore * 0.3 + distributionScore * 0.2)
  }
  
  // 计算测试持续时间
  const testDuration = events[events.length - 1].timestamp - events[0].timestamp

  // 精确频率稳定性
  const frequencyStability = signalQuality

  return {
    averageInterval: preciseRound(averageInterval, PRECISION.TIME),
    reportRate,
    maxReportRate,
    minReportRate,
    jitter: preciseRound(jitter, PRECISION.TIME),
    stability: preciseRound(stability, PRECISION.PERCENTAGE),
    totalEvents: events.length,
    effectiveReportRate,
    signalQuality: preciseRound(signalQuality, PRECISION.PERCENTAGE),
    medianInterval: preciseRound(medianInterval, PRECISION.TIME),
    testDuration: preciseRound(testDuration, PRECISION.TIME),
    frequencyStability: preciseRound(frequencyStability, PRECISION.PERCENTAGE),
    intervalVariance: preciseRound(variance, PRECISION.TIME),
    p95Interval: preciseRound(p95IntervalValue, PRECISION.TIME)
  }
}

// 计算键盘回报率统计数据（专门针对键盘事件优化）
export const calculateKeyboardReportRate = (events: MouseMoveEvent[]): ReportRateStats => {
  if (events.length < 2) {
    return {
      averageInterval: 0,
      reportRate: 0,
      maxReportRate: 0,
      minReportRate: 0,
      jitter: 0,
      stability: 0,
      totalEvents: 0,
      effectiveReportRate: 0,
      signalQuality: 0,
      medianInterval: 0,
      testDuration: 0,
      frequencyStability: 0,
      intervalVariance: 0,
      p95Interval: 0
    }
  }

  // 计算精确时间间隔
  const intervals: number[] = []
  for (let i = 1; i < events.length; i++) {
    const interval = events[i].timestamp - events[i - 1].timestamp
    if (interval > 0) {
      intervals.push(interval)
    }
  }

  if (intervals.length === 0) {
    return {
      averageInterval: 0,
      reportRate: 0,
      maxReportRate: 0,
      minReportRate: 0,
      jitter: 0,
      stability: 0,
      totalEvents: events.length,
      effectiveReportRate: 0,
      signalQuality: 0,
      medianInterval: 0,
      testDuration: 0,
      frequencyStability: 0,
      intervalVariance: 0,
      p95Interval: 0
    }
  }

  // 键盘特殊的智能过滤
  // 1. 计算四分位数范围进行异常值检测
  const sortedIntervals = [...intervals].sort((a, b) => a - b)
  const q1 = calculatePercentile(sortedIntervals, 25)
  const q3 = calculatePercentile(sortedIntervals, 75)
  const iqr = q3 - q1
  
  // 2. 键盘特殊边界：考虑键盘重复率和高频游戏键盘
  const lowerBound = Math.max(0.125, q1 - 1.5 * iqr) // 最小0.125ms (8000Hz)
  const upperBound = Math.min(1000, q3 + 1.5 * iqr) // 最大1000ms
  
  const filteredIntervals = intervals.filter(interval => 
    interval >= lowerBound && interval <= upperBound
  )
  
  // 如果过滤后数据太少，使用更宽松的键盘专用过滤条件
  const validIntervals = filteredIntervals.length >= Math.max(3, intervals.length * 0.3) 
    ? filteredIntervals 
    : intervals.filter(interval => interval >= 0.125 && interval <= 1000)

  // 精确统计计算
  const sum = validIntervals.reduce((a, b) => a + b, 0)
  const averageInterval = sum / validIntervals.length
  const minInterval = Math.min(...validIntervals)
  const maxInterval = Math.max(...validIntervals)
  
  // 精确百分位数计算
  const sortedValidIntervals = [...validIntervals].sort((a, b) => a - b)
  const medianInterval = calculatePercentile(sortedValidIntervals, 50)
  const p95IntervalValue = calculatePercentile(sortedValidIntervals, 95)

  // 精确回报率计算
  const reportRate = preciseRound(1000 / averageInterval, PRECISION.FREQUENCY)
  const effectiveReportRate = preciseRound(1000 / medianInterval, PRECISION.FREQUENCY)
  const maxReportRate = preciseRound(1000 / minInterval, PRECISION.FREQUENCY)
  const minReportRate = preciseRound(1000 / maxInterval, PRECISION.FREQUENCY)

  // 精确方差和抖动计算
  const variance = validIntervals.reduce((acc, interval) => 
    acc + Math.pow(interval - averageInterval, 2), 0) / validIntervals.length
  const jitter = Math.sqrt(variance)

  // 精确稳定性指标
  const coefficientOfVariation = averageInterval > 0 ? (jitter / averageInterval) * 100 : 0
  const stability = Math.max(0, Math.min(100, 100 - coefficientOfVariation))
  
  // 精确信号质量 - 基于事件分布均匀性和一致性
  let signalQuality = 0
  if (validIntervals.length > 2) {
    // 计算相邻间隔的差异程度
    const intervalDifferences = []
    for (let i = 1; i < validIntervals.length; i++) {
      intervalDifferences.push(Math.abs(validIntervals[i] - validIntervals[i - 1]))
    }
    
    const avgDifference = intervalDifferences.reduce((a, b) => a + b, 0) / intervalDifferences.length
    const maxDifference = Math.max(...intervalDifferences)
    
    // 信号质量基于：1) 间隔一致性 2) 峰值控制 3) 整体分布
    const consistencyScore = averageInterval > 0 ? Math.max(0, 100 - (avgDifference / averageInterval) * 200) : 0
    const peakControlScore = averageInterval > 0 ? Math.max(0, 100 - (maxDifference / averageInterval) * 100) : 0
    const distributionScore = Math.max(0, 100 - Math.abs(medianInterval - averageInterval) / averageInterval * 100)
    
    signalQuality = (consistencyScore * 0.5 + peakControlScore * 0.3 + distributionScore * 0.2)
  }
  
  // 计算测试持续时间
  const testDuration = events[events.length - 1].timestamp - events[0].timestamp

  // 精确频率稳定性
  const frequencyStability = signalQuality

  return {
    averageInterval: preciseRound(averageInterval, PRECISION.TIME),
    reportRate,
    maxReportRate,
    minReportRate,
    jitter: preciseRound(jitter, PRECISION.TIME),
    stability: preciseRound(stability, PRECISION.PERCENTAGE),
    totalEvents: events.length,
    effectiveReportRate,
    signalQuality: preciseRound(signalQuality, PRECISION.PERCENTAGE),
    medianInterval: preciseRound(medianInterval, PRECISION.TIME),
    testDuration: preciseRound(testDuration, PRECISION.TIME),
    frequencyStability: preciseRound(frequencyStability, PRECISION.PERCENTAGE),
    intervalVariance: preciseRound(variance, PRECISION.TIME),
    p95Interval: preciseRound(p95IntervalValue, PRECISION.TIME)
  }
} 
