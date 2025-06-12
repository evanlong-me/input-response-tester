'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Target,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react'

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

interface OverallAnalysisProps {
  overallStats: Stats
  mouseStats: Stats
  keyboardStats: Stats
  overallAdvancedStats: AdvancedStats
}

export function OverallAnalysis({
  overallStats,
  mouseStats,
  keyboardStats,
  overallAdvancedStats
}: OverallAnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const getPerformanceDifference = () => {
    if (mouseStats.avg && keyboardStats.avg) {
      return `${Math.abs(mouseStats.avg - keyboardStats.avg)}ms`
    }
    return '暂无数据'
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          综合测试结果
        </CardTitle>
        <CardDescription>
          延迟统计和设备对比
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 基础指标 */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium">基础指标</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  平均延迟
                </span>
                <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                  {overallStats.avg}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  最小延迟
                </span>
                <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                  {overallStats.min}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  最大延迟
                </span>
                <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                  {overallStats.max}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  测试次数
                </span>
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  {overallStats.count}次
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  延迟范围
                </span>
                <span className="font-medium text-sm text-amber-600 dark:text-amber-400">
                  {overallStats.max - overallStats.min}ms
                </span>
              </div>
            </div>
          </div>

          {/* 稳定性指标 */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h4 className="font-medium">稳定性指标</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  稳定性
                </span>
                <span className={`font-medium text-sm ${getScoreColor(overallAdvancedStats.stability)}`}>
                  {overallAdvancedStats.stability}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  一致性
                </span>
                <span className={`font-medium text-sm ${getScoreColor(overallAdvancedStats.consistency)}`}>
                  {overallAdvancedStats.consistency}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  中位数延迟
                </span>
                <span className="font-medium text-sm text-teal-600 dark:text-teal-400">
                  {overallAdvancedStats.median}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  标准差
                </span>
                <span className="font-medium text-sm text-cyan-600 dark:text-cyan-400">
                  {overallAdvancedStats.standardDeviation}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  变异系数
                </span>
                <span className="font-medium text-sm text-pink-600 dark:text-pink-400">
                  {overallAdvancedStats.coefficientOfVariation}%
                </span>
              </div>
            </div>
          </div>

          {/* 设备对比 */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <h4 className="font-medium">设备对比</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  鼠标延迟
                </span>
                <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                  {mouseStats.avg || 0}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  键盘延迟
                </span>
                <span className="font-medium text-sm text-indigo-600 dark:text-indigo-400">
                  {keyboardStats.avg || 0}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  延迟差异
                </span>
                <span className="font-medium text-sm text-violet-600 dark:text-violet-400">
                  {getPerformanceDifference()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  鼠标测试次数
                </span>
                <span className="font-medium text-sm text-slate-600 dark:text-slate-400">
                  {mouseStats.count}次
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  键盘测试次数
                </span>
                <span className="font-medium text-sm text-slate-600 dark:text-slate-400">
                  {keyboardStats.count}次
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
