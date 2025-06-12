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
  effectiveReportRate: number
  temporalPrecision: number
  medianInterval: number
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
  return {
    avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length * 100) / 100,
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
      median: 0,
      p95: 0,
      p99: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      jitterIndex: 0
    }
  }

  const times = results.map((r) => r.responseTime).sort((a, b) => a - b)
  const avg = times.reduce((a, b) => a + b, 0) / times.length

  // 中位数
  const median = times.length % 2 === 0 
    ? (times[times.length / 2 - 1] + times[times.length / 2]) / 2
    : times[Math.floor(times.length / 2)]

  // 95分位数和99分位数
  const p95Index = Math.ceil(times.length * 0.95) - 1
  const p99Index = Math.ceil(times.length * 0.99) - 1
  const p95 = times[Math.max(0, p95Index)]
  const p99 = times[Math.max(0, p99Index)]

  // 标准差
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

  // 稳定性：基于变异系数的倒数计算，使用更合理的映射函数
  // 变异系数越小越稳定，使用指数衰减函数避免直接归零
  const stability = Math.max(0, Math.min(100, 100 * Math.exp(-coefficientOfVariation / 50)))

  // 一致性：基于标准差与中位数的比值，使用更平滑的映射
  // 使用对数函数来处理大的变异，避免直接归零
  const consistencyRatio = median > 0 ? stdDev / median : 1
  const consistency = Math.max(0, Math.min(100, 100 * Math.exp(-consistencyRatio * 2)))

  return {
    stability: Math.round(stability * 100) / 100,
    consistency: Math.round(consistency * 100) / 100,
    median: Math.round(median * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    p99: Math.round(p99 * 100) / 100,
    standardDeviation: Math.round(stdDev * 100) / 100,
    coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
    jitterIndex: Math.round(jitterIndex * 100) / 100
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
      temporalPrecision: 0,
      medianInterval: 0
    }
  }

  // 计算时间间隔
  const intervals = []
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
      temporalPrecision: 0,
      medianInterval: 0
    }
  }

  // 过滤异常值：移除明显的异常间隔
  // 1. 过滤掉过短的间隔（< 0.1ms，可能是重复事件）
  // 2. 过滤掉过长的间隔（> 500ms，可能是事件循环阻塞或用户停顿）
  // 移除浏览器刷新率限制，允许检测高回报率设备
  const filteredIntervals = intervals.filter(interval => interval >= 0.1 && interval <= 500)
  
  // 如果过滤后数据太少，使用原始数据
  const validIntervals = filteredIntervals.length >= Math.max(2, intervals.length * 0.5) 
    ? filteredIntervals 
    : intervals

  // 基础统计
  const sortedIntervals = [...validIntervals].sort((a, b) => a - b)
  const averageInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length
  const minInterval = Math.min(...validIntervals)
  const maxInterval = Math.max(...validIntervals)
  
  // 中位数间隔
  const medianInterval = sortedIntervals.length % 2 === 0
    ? (sortedIntervals[sortedIntervals.length / 2 - 1] + sortedIntervals[sortedIntervals.length / 2]) / 2
    : sortedIntervals[Math.floor(sortedIntervals.length / 2)]

  // 回报率计算（Hz = 1000ms / 间隔ms）
  // 注意：测量结果反映浏览器能检测到的事件频率
  // 高端设备的实际硬件回报率可能会受到浏览器事件循环的影响
  const reportRate = Math.round(1000 / averageInterval)
  const effectiveReportRate = Math.round(1000 / medianInterval)
  const maxReportRate = Math.round(1000 / minInterval)
  const minReportRate = Math.round(1000 / maxInterval)

  // 抖动计算（标准差）
  const variance = validIntervals.reduce((acc, interval) => acc + Math.pow(interval - averageInterval, 2), 0) / validIntervals.length
  const jitter = Math.sqrt(variance)

  // 稳定性指标
  const coefficientOfVariation = averageInterval > 0 ? (jitter / averageInterval) * 100 : 0
  const stability = Math.max(0, Math.min(100, 100 - coefficientOfVariation))
  
  // 时序精度（抖动越小精度越高）
  const temporalPrecision = Math.max(0, Math.min(100, 100 - (jitter / averageInterval) * 100))
  
  return {
    averageInterval: Math.round(averageInterval * 1000) / 1000,
    reportRate,
    maxReportRate,
    minReportRate,
    jitter: Math.round(jitter * 1000) / 1000,
    stability: Math.round(stability * 100) / 100,
    totalEvents: events.length,
    effectiveReportRate,
    temporalPrecision: Math.round(temporalPrecision * 100) / 100,
    medianInterval: Math.round(medianInterval * 1000) / 1000
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
      temporalPrecision: 0,
      medianInterval: 0
    }
  }

  // 计算时间间隔
  const intervals = []
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
      temporalPrecision: 0,
      medianInterval: 0
    }
  }

  // 键盘特殊过滤：
  // 1. 过滤掉过短的间隔（< 0.5ms，键盘重复事件或浏览器重复触发）
  // 2. 过滤掉过长的间隔（> 1000ms，可能是用户停顿或事件循环阻塞）
  // 移除浏览器刷新率限制，支持高回报率键盘（如8000Hz游戏键盘）
  const filteredIntervals = intervals.filter(interval => interval >= 0.5 && interval <= 1000)
  
  // 如果过滤后数据太少，使用原始数据
  const validIntervals = filteredIntervals.length >= Math.max(2, intervals.length * 0.3) 
    ? filteredIntervals 
    : intervals

  // 基础统计
  const sortedIntervals = [...validIntervals].sort((a, b) => a - b)
  const averageInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length
  const minInterval = Math.min(...validIntervals)
  const maxInterval = Math.max(...validIntervals)
  
  // 中位数间隔
  const medianInterval = sortedIntervals.length % 2 === 0
    ? (sortedIntervals[sortedIntervals.length / 2 - 1] + sortedIntervals[sortedIntervals.length / 2]) / 2
    : sortedIntervals[Math.floor(sortedIntervals.length / 2)]

  // 回报率计算（Hz = 1000ms / 间隔ms）
  const reportRate = Math.round(1000 / averageInterval)
  const effectiveReportRate = Math.round(1000 / medianInterval)
  const maxReportRate = Math.round(1000 / minInterval)
  const minReportRate = Math.round(1000 / maxInterval)

  // 抖动计算（标准差）
  const variance = validIntervals.reduce((acc, interval) => acc + Math.pow(interval - averageInterval, 2), 0) / validIntervals.length
  const jitter = Math.sqrt(variance)

  // 稳定性指标
  const coefficientOfVariation = averageInterval > 0 ? (jitter / averageInterval) * 100 : 0
  const stability = Math.max(0, Math.min(100, 100 - coefficientOfVariation))
  
  // 时序精度（抖动越小精度越高）
  const temporalPrecision = Math.max(0, Math.min(100, 100 - (jitter / averageInterval) * 100))
  
  return {
    averageInterval: Math.round(averageInterval * 1000) / 1000,
    reportRate,
    maxReportRate,
    minReportRate,
    jitter: Math.round(jitter * 1000) / 1000,
    stability: Math.round(stability * 100) / 100,
    totalEvents: events.length,
    effectiveReportRate,
    temporalPrecision: Math.round(temporalPrecision * 100) / 100,
    medianInterval: Math.round(medianInterval * 1000) / 1000
  }
} 
