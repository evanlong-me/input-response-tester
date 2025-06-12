'use client'

import React from 'react'
import { BarChart3 } from 'lucide-react'

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

interface ReportRateStatsProps {
  title: string
  stats: ReportRateStats
  deviceType: 'mouse' | 'keyboard'
}

export function ReportRateStatsDisplay({ title, stats, deviceType }: ReportRateStatsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const deviceLabels = {
    mouse: {
      frequency: '回报率',
      events: '移动事件'
    },
    keyboard: {
      frequency: '回报率',
      events: '按键事件'
    }
  }

  const labels = deviceLabels[deviceType]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4" />
        <h4 className="font-medium">{title}</h4>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
              {labels.frequency}指标
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  平均{labels.frequency}
                </span>
                <span className={`font-medium text-sm ${
                  deviceType === 'mouse' ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  {stats.reportRate}Hz
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  有效{labels.frequency}
                </span>
                <span className={`font-medium text-sm ${
                  deviceType === 'mouse' ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'
                }`}>
                  {stats.effectiveReportRate}Hz
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  最大{labels.frequency}
                </span>
                <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                  {stats.maxReportRate}Hz
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  最小{labels.frequency}
                </span>
                <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                  {stats.minReportRate}Hz
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  平均间隔
                </span>
                <span className="font-medium text-sm text-teal-600 dark:text-teal-400">
                  {stats.averageInterval}ms
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
                <span className="text-sm text-muted-foreground">
                  抖动
                </span>
                <span className="font-medium text-sm text-amber-600 dark:text-amber-400">
                  {stats.jitter}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  稳定性评分
                </span>
                <span className={`font-medium text-sm ${getScoreColor(stats.stability)}`}>
                  {stats.stability}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  时序精度
                </span>
                <span className="font-medium text-sm text-cyan-600 dark:text-cyan-400">
                  {stats.temporalPrecision}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {labels.events}总数
                </span>
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  {stats.totalEvents}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
