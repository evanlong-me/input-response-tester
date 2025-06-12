'use client'

import React, { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { PRECISION, preciseRound, calculatePercentile } from '@/lib/precision-utils'

interface TestResult {
  timestamp: number
  responseTime: number
  testType: 'mouse' | 'keyboard'
}

interface PerformanceStatsProps {
  title: string
  stats: {
    avg: number
    min: number
    max: number
    count: number
  }
  testResults: TestResult[]
}

export const PerformanceStats = React.memo(({
  title,
  stats,
  testResults
}: PerformanceStatsProps) => {
  const advancedStats = useMemo(() => {
    if (!testResults || testResults.length === 0) return null
    
    const times = testResults.map(r => r.responseTime).sort((a, b) => a - b)
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
    
    return {
      median: preciseRound(median, PRECISION.LATENCY),
      stdDev: preciseRound(stdDev, PRECISION.LATENCY),
      coefficientOfVariation: preciseRound(coefficientOfVariation, PRECISION.PERCENTAGE),
      p95: preciseRound(p95, PRECISION.LATENCY),
      p99: preciseRound(p99, PRECISION.LATENCY)
    }
  }, [testResults])

  const renderResponseStats = useMemo(() => {
    if (stats.count === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          暂无测试数据
        </div>
      )
    }

    const advanced = advancedStats
    if (!advanced) return null

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">平均延迟</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.avg}ms</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">最佳延迟</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">{stats.min}ms</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">最差延迟</p>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{stats.max}ms</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">中位数</p>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{advanced.median}ms</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">标准差</span>
            <span className="text-base font-semibold text-orange-600 dark:text-orange-400">{advanced.stdDev}ms</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">变异系数</span>
            <span className="text-base font-semibold text-rose-600 dark:text-rose-400">{advanced.coefficientOfVariation}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">95分位数</span>
            <span className="text-base font-semibold text-violet-600 dark:text-violet-400">{advanced.p95}ms</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">99分位数</span>
            <span className="text-base font-semibold text-pink-600 dark:text-pink-400">{advanced.p99}ms</span>
          </div>
        </div>
      </div>
    )
  }, [stats, testResults, advancedStats])

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        <h4 className="font-medium">{title}</h4>
      </div>
      <div className="flex-1">
        {renderResponseStats}
      </div>
    </div>
  )
})

PerformanceStats.displayName = 'PerformanceStats' 
