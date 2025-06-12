'use client'

import React from 'react'
import { BarChart3 } from 'lucide-react'

interface Stats {
  avg: number
  min: number
  max: number
  count: number
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

interface PerformanceStatsProps {
  type: 'response' | 'report-rate'
  title: string
  stats?: Stats
  reportRateStats?: ReportRateStats
  testResults?: Array<{ responseTime: number }>
}

export function PerformanceStats({
  type,
  title,
  stats,
  reportRateStats,
  testResults
}: PerformanceStatsProps) {
  const calculateAdvancedStats = (results: Array<{ responseTime: number }>) => {
    if (!results || results.length === 0) return null
    
    const times = results.map(r => r.responseTime).sort((a, b) => a - b)
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    
    // 中位数
    const median = times.length % 2 === 0
      ? (times[times.length / 2 - 1] + times[times.length / 2]) / 2
      : times[Math.floor(times.length / 2)]
    
    // 标准差
    const variance = times.reduce((acc, time) => acc + Math.pow(time - avg, 2), 0) / times.length
    const stdDev = Math.sqrt(variance)
    
    // 变异系数
    const coefficientOfVariation = avg > 0 ? (stdDev / avg) * 100 : 0
    
    // 95分位数和99分位数
    const p95Index = Math.ceil(times.length * 0.95) - 1
    const p99Index = Math.ceil(times.length * 0.99) - 1
    const p95 = times[Math.max(0, p95Index)]
    const p99 = times[Math.max(0, p99Index)]
    
    return {
      median: Math.round(median * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
      p95,
      p99
    }
  }

  const renderResponseStats = () => {
    if (!stats || !testResults) return null
    
    const advancedStats = calculateAdvancedStats(testResults)
    
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
            延迟指标
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">平均延迟</span>
              <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                {stats.avg}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">最小延迟</span>
              <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                {stats.min}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">最大延迟</span>
              <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                {stats.max}ms
              </span>
            </div>
            {advancedStats && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">中位数</span>
                  <span className="font-medium text-sm text-teal-600 dark:text-teal-400">
                    {advancedStats.median}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">95分位数</span>
                  <span className="font-medium text-sm text-purple-600 dark:text-purple-400">
                    {advancedStats.p95}ms
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {advancedStats && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
              稳定性指标
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">标准差</span>
                <span className="font-medium text-sm text-cyan-600 dark:text-cyan-400">
                  {advancedStats.stdDev}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">变异系数</span>
                <span className="font-medium text-sm text-pink-600 dark:text-pink-400">
                  {advancedStats.coefficientOfVariation}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">99分位数</span>
                <span className="font-medium text-sm text-indigo-600 dark:text-indigo-400">
                  {advancedStats.p99}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">延迟范围</span>
                <span className="font-medium text-sm text-amber-600 dark:text-amber-400">
                  {stats.max - stats.min}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">测试次数</span>
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  {stats.count}次
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderReportRateStats = () => {
    if (!reportRateStats) return null
    
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
            回报率指标
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">平均回报率</span>
              <span className="font-medium text-sm text-purple-600 dark:text-purple-400">
                {reportRateStats.reportRate}Hz
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">有效回报率</span>
              <span className="font-medium text-sm text-indigo-600 dark:text-indigo-400">
                {reportRateStats.effectiveReportRate}Hz
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">最大回报率</span>
              <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                {reportRateStats.maxReportRate}Hz
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">最小回报率</span>
              <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                {reportRateStats.minReportRate}Hz
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">平均间隔</span>
              <span className="font-medium text-sm text-teal-600 dark:text-teal-400">
                {reportRateStats.averageInterval}ms
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
            稳定性指标
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">抖动</span>
              <span className="font-medium text-sm text-amber-600 dark:text-amber-400">
                {reportRateStats.jitter}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">稳定性评分</span>
              <span className={`font-medium text-sm ${
                reportRateStats.stability >= 80
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : reportRateStats.stability >= 60
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {reportRateStats.stability}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">时序精度</span>
              <span className="font-medium text-sm text-cyan-600 dark:text-cyan-400">
                {reportRateStats.temporalPrecision}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">事件总数</span>
              <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                {reportRateStats.totalEvents}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4" />
        <h4 className="font-medium">{title}</h4>
      </div>
      <div className="bg-muted/30 rounded-lg p-4 flex-1 flex flex-col justify-center">
        {type === 'response' ? renderResponseStats() : renderReportRateStats()}
      </div>
    </div>
  )
} 
