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
  performance: number
  reliability: number
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
  maxTestCount: number
}

export function OverallAnalysis({
  overallStats,
  mouseStats,
  keyboardStats,
  overallAdvancedStats,
  maxTestCount
}: OverallAnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const getOverallScore = () => {
    return Math.round(
      (overallAdvancedStats.stability +
        overallAdvancedStats.consistency +
        overallAdvancedStats.performance +
        overallAdvancedStats.reliability) / 4
    )
  }

  const getBetterDevice = () => {
    if (mouseStats.avg && keyboardStats.avg) {
      return mouseStats.avg < keyboardStats.avg ? '鼠标' : '键盘'
    }
    if (mouseStats.avg) return '鼠标'
    if (keyboardStats.avg) return '键盘'
    return '暂无数据'
  }

  const getPerformanceDifference = () => {
    if (mouseStats.avg && keyboardStats.avg) {
      return `${Math.abs(mouseStats.avg - keyboardStats.avg)}ms`
    }
    return '暂无数据'
  }

  const getTestCompleteness = () => {
    return Math.round((overallStats.count / (maxTestCount * 2)) * 100)
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          综合性能分析报告
        </CardTitle>
        <CardDescription>
          基于所有测试数据的深度性能分析，包含延迟统计、稳定性评估和设备对比
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 性能指标 */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium">性能指标</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  综合平均延迟
                </span>
                <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                  {overallStats.avg}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  最佳响应时间
                </span>
                <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                  {overallStats.min}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  最差响应时间
                </span>
                <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                  {overallStats.max}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  总测试样本
                </span>
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  {overallStats.count}次
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  延迟范围
                </span>
                <span className="font-medium text-sm text-violet-600 dark:text-violet-400">
                  {overallStats.max - overallStats.min}ms
                </span>
              </div>
            </div>
          </div>

          {/* 高级分析指标 */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h4 className="font-medium">高级分析指标</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  系统稳定性
                </span>
                <span className={`font-medium text-sm ${getScoreColor(overallAdvancedStats.stability)}`}>
                  {overallAdvancedStats.stability}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  响应一致性
                </span>
                <span className={`font-medium text-sm ${getScoreColor(overallAdvancedStats.consistency)}`}>
                  {overallAdvancedStats.consistency}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  性能评分
                </span>
                <span className={`font-medium text-sm ${getScoreColor(overallAdvancedStats.performance)}`}>
                  {overallAdvancedStats.performance}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  数据可靠性
                </span>
                <span className={`font-medium text-sm ${getScoreColor(overallAdvancedStats.reliability)}`}>
                  {overallAdvancedStats.reliability}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  综合评级
                </span>
                <span className={`font-medium text-sm ${getScoreColor(getOverallScore())}`}>
                  {getOverallScore()}%
                </span>
              </div>
            </div>
          </div>

          {/* 设备对比分析 */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <h4 className="font-medium">设备对比分析</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  鼠标平均延迟
                </span>
                <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                  {mouseStats.avg || 0}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  键盘平均延迟
                </span>
                <span className="font-medium text-sm text-indigo-600 dark:text-indigo-400">
                  {keyboardStats.avg || 0}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  性能差异
                </span>
                <span className="font-medium text-sm text-violet-600 dark:text-violet-400">
                  {getPerformanceDifference()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  更优设备
                </span>
                <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                  {getBetterDevice()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  测试完成度
                </span>
                <span className="font-medium text-sm text-teal-600 dark:text-teal-400">
                  {getTestCompleteness()}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
