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
  temporalPrecision: number
  frequencyStability: number
  intervalVariance: number
  medianInterval: number
  p95Interval: number
}

const MAX_TEST_COUNT = 20

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

  // 稳定性：基于变异系数的倒数计算（变异系数越小越稳定）
  const stability = Math.max(0, Math.min(100, 100 - coefficientOfVariation))

  // 一致性：基于标准差与中位数的比值
  const consistency = median > 0 ? Math.max(0, Math.min(100, 100 - (stdDev / median) * 100)) : 0

  // 性能：基于延迟的倒数和分布计算
  const performance = Math.max(0, Math.min(100, (30 / avg) * 100))

  // 可靠性：基于测试样本数和数据质量
  const sampleReliability = Math.min(100, (results.length / MAX_TEST_COUNT) * 100)
  const distributionReliability = coefficientOfVariation < 20 ? 100 : Math.max(0, 100 - coefficientOfVariation)
  const reliability = (sampleReliability + distributionReliability) / 2

  return {
    stability: Math.round(stability * 100) / 100,
    consistency: Math.round(consistency * 100) / 100,
    performance: Math.round(performance * 100) / 100,
    reliability: Math.round(reliability * 100) / 100,
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
      testDuration: 0,
      effectiveReportRate: 0,
      temporalPrecision: 0,
      frequencyStability: 0,
      intervalVariance: 0,
      medianInterval: 0,
      p95Interval: 0
    }
  }

  // 计算时间间隔
  const intervals = []
  for (let i = 1; i < events.length; i++) {
    const interval = events[i].timestamp - events[i - 1].timestamp
    if (interval > 0 && interval < 100) { // 过滤异常间隔（>100ms可能是暂停）
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
      testDuration: 0,
      effectiveReportRate: 0,
      temporalPrecision: 0,
      frequencyStability: 0,
      intervalVariance: 0,
      medianInterval: 0,
      p95Interval: 0
    }
  }

  // 排序间隔用于计算分位数
  const sortedIntervals = [...intervals].sort((a, b) => a - b)
  
  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const reportRate = averageInterval > 0 ? Math.round(1000 / averageInterval) : 0

  // 中位数间隔
  const medianInterval = sortedIntervals.length % 2 === 0
    ? (sortedIntervals[sortedIntervals.length / 2 - 1] + sortedIntervals[sortedIntervals.length / 2]) / 2
    : sortedIntervals[Math.floor(sortedIntervals.length / 2)]

  // 95分位数间隔
  const p95Index = Math.ceil(sortedIntervals.length * 0.95) - 1
  const p95Interval = sortedIntervals[Math.max(0, p95Index)]

  // 计算最大和最小回报率
  const maxInterval = Math.max(...intervals)
  const minInterval = Math.min(...intervals)
  const maxReportRate = minInterval > 0 ? Math.round(1000 / minInterval) : 0
  const minReportRate = maxInterval > 0 ? Math.round(1000 / maxInterval) : 0

  // 有效回报率（基于中位数计算，更稳定）
  const effectiveReportRate = medianInterval > 0 ? Math.round(1000 / medianInterval) : 0

  // 计算抖动（间隔的标准差）
  const intervalVariance = intervals.reduce(
    (acc, interval) => acc + Math.pow(interval - averageInterval, 2),
    0
  ) / intervals.length
  const jitter = Math.sqrt(intervalVariance)

  // 时序精度（基于抖动的倒数）
  const temporalPrecision = averageInterval > 0 
    ? Math.max(0, Math.min(100, 100 - (jitter / averageInterval) * 100))
    : 0

  // 频率稳定性（基于变异系数）
  const coefficientOfVariation = averageInterval > 0 ? (jitter / averageInterval) * 100 : 0
  const frequencyStability = Math.max(0, Math.min(100, 100 - coefficientOfVariation))

  // 计算稳定性（综合指标）
  const stability = (temporalPrecision + frequencyStability) / 2

  // 计算测试持续时间
  const testDuration = events.length > 0
    ? events[events.length - 1].timestamp - events[0].timestamp
    : 0

  return {
    averageInterval: Math.round(averageInterval * 1000) / 1000,
    reportRate,
    maxReportRate,
    minReportRate,
    jitter: Math.round(jitter * 1000) / 1000,
    stability: Math.round(stability * 100) / 100,
    totalEvents: events.length,
    testDuration: Math.round(testDuration),
    effectiveReportRate,
    temporalPrecision: Math.round(temporalPrecision * 100) / 100,
    frequencyStability: Math.round(frequencyStability * 100) / 100,
    intervalVariance: Math.round(intervalVariance * 1000) / 1000,
    medianInterval: Math.round(medianInterval * 1000) / 1000,
    p95Interval: Math.round(p95Interval * 1000) / 1000
  }
} 
