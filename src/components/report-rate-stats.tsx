'use client'

import React, { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { formatDuration } from '@/lib/precision-utils'

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

interface ReportRateStatsProps {
  title: string
  stats: ReportRateStats
  deviceType: 'mouse' | 'keyboard'
}

export const ReportRateStatsDisplay = React.memo(({ title, stats, deviceType }: ReportRateStatsProps) => {
  const deviceLabels = useMemo(() => ({
    mouse: {
      frequency: '回报率',
      events: '移动事件'
    },
    keyboard: {
      frequency: '回报率',
      events: '按键事件'
    }
  }), [])

  const labels = useMemo(() => deviceLabels[deviceType], [deviceLabels, deviceType])

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        <h4 className="font-medium">{title}</h4>
      </div>
      <div className="flex-1">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">平均{labels.frequency}</p>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{stats.reportRate}Hz</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">峰值{labels.frequency}</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{stats.maxReportRate}Hz</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">稳定性</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.stability}%</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">抖动</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{stats.jitter}ms</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">有效{labels.frequency}</span>
              <span className="text-base font-semibold text-indigo-600 dark:text-indigo-400">{stats.effectiveReportRate}Hz</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">信号质量</span>
              <span className="text-base font-semibold text-cyan-600 dark:text-cyan-400">{stats.signalQuality}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">{labels.events}总数</span>
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">{stats.totalEvents}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">测试时长</span>
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">{formatDuration(stats.testDuration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

ReportRateStatsDisplay.displayName = 'ReportRateStatsDisplay' 
