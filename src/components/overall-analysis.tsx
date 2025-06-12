'use client'

import React, { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Target, BarChart3, Activity, Zap, Radio } from 'lucide-react'
import { PRECISION, preciseRound } from '@/lib/precision-utils'

interface Stats {
  avg: number
  min: number
  max: number
  count: number
}

interface ReportRateStats {
  reportRate: number
  effectiveReportRate: number
  maxReportRate: number
  minReportRate: number
  averageInterval: number
  jitter: number
  stability: number
  signalQuality: number
  totalEvents: number
  medianInterval: number
  testDuration: number
  frequencyStability: number
  intervalVariance: number
  p95Interval: number
}

interface OverallAnalysisProps {
  overallStats: Stats
  mouseStats: Stats
  keyboardStats: Stats
  mouseMoveReportRateStats: ReportRateStats
  keyboardMoveReportRateStats: ReportRateStats
}

export const OverallAnalysis = React.memo(
  ({ overallStats, mouseStats, keyboardStats, mouseMoveReportRateStats, keyboardMoveReportRateStats }: OverallAnalysisProps) => {
    const hasData = useMemo(() => {
      return overallStats.count > 0
    }, [overallStats.count])

    const hasReportRateData = useMemo(() => {
      return mouseMoveReportRateStats.totalEvents > 0 || keyboardMoveReportRateStats.totalEvents > 0
    }, [mouseMoveReportRateStats.totalEvents, keyboardMoveReportRateStats.totalEvents])

    const getPerformanceDifference = useMemo(() => {
      if (mouseStats.avg && keyboardStats.avg) {
        return `${preciseRound(Math.abs(mouseStats.avg - keyboardStats.avg), PRECISION.LATENCY)}ms`
      }
      return '暂无数据'
    }, [mouseStats.avg, keyboardStats.avg])

    const getReportRateDifference = useMemo(() => {
      if (mouseMoveReportRateStats.reportRate && keyboardMoveReportRateStats.reportRate) {
        return `${preciseRound(Math.abs(mouseMoveReportRateStats.reportRate - keyboardMoveReportRateStats.reportRate), PRECISION.FREQUENCY)}Hz`
      }
      return '暂无数据'
    }, [mouseMoveReportRateStats.reportRate, keyboardMoveReportRateStats.reportRate])

    if (!hasData && !hasReportRateData) {
      return (
        <Card className="mb-8 border-dashed backdrop-blur-sm bg-white/10 border border-white/20">
          <CardContent className="relative z-10">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-lg">
                请先完成测试以查看综合分析结果
              </p>
              <p className="text-muted-foreground/70 text-sm mt-2">
                完成鼠标或键盘测试后，这里将显示详细的性能分析
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="mb-8 backdrop-blur-sm bg-white/10 border border-white/20">
        <CardHeader className="pb-6 relative z-10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-500" />
            综合测试结果
          </CardTitle>
          <CardDescription className="text-sm">
            延迟统计和设备对比分析
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 延迟性能指标 */}
            {hasData && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-base">延迟性能</h3>
                </div>
                <div className="space-y-3">
                  {mouseStats.count > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          鼠标平均
                        </span>
                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                          {mouseStats.avg}ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          鼠标最佳
                        </span>
                        <span className="font-semibold text-sm text-green-600 dark:text-green-400">
                          {mouseStats.min}ms
                        </span>
                      </div>
                    </>
                  )}
                  {keyboardStats.count > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          键盘平均
                        </span>
                        <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                          {keyboardStats.avg}ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          键盘最佳
                        </span>
                        <span className="font-semibold text-sm text-violet-600 dark:text-violet-400">
                          {keyboardStats.min}ms
                        </span>
                      </div>
                    </>
                  )}
                  {mouseStats.count > 0 && keyboardStats.count > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-muted-foreground">
                        延迟差异
                      </span>
                      <span className="font-bold text-base text-amber-600 dark:text-amber-400">
                        {getPerformanceDifference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 回报率性能指标 */}
            {hasReportRateData && (
              <div className="bg-gradient-to-br from-purple-50 to-violet-100/50 dark:from-purple-900/20 dark:to-violet-800/10 rounded-xl p-5 border border-purple-200/50 dark:border-purple-700/30">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-base">回报率性能</h3>
                </div>
                <div className="space-y-3">
                  {mouseMoveReportRateStats.totalEvents > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          鼠标回报率
                        </span>
                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                          {mouseMoveReportRateStats.reportRate}Hz
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          鼠标稳定性
                        </span>
                        <span className="font-semibold text-sm text-green-600 dark:text-green-400">
                          {preciseRound(mouseMoveReportRateStats.stability, PRECISION.PERCENTAGE)}%
                        </span>
                      </div>
                    </>
                  )}
                  {keyboardMoveReportRateStats.totalEvents > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          键盘回报率
                        </span>
                        <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                          {keyboardMoveReportRateStats.reportRate}Hz
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          键盘稳定性
                        </span>
                        <span className="font-semibold text-sm text-violet-600 dark:text-violet-400">
                          {preciseRound(keyboardMoveReportRateStats.stability, PRECISION.PERCENTAGE)}%
                        </span>
                      </div>
                    </>
                  )}
                  {mouseMoveReportRateStats.totalEvents > 0 && keyboardMoveReportRateStats.totalEvents > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-purple-200 dark:border-purple-700">
                      <span className="text-xs text-muted-foreground">
                        回报率差异
                      </span>
                      <span className="font-bold text-base text-amber-600 dark:text-amber-400">
                        {getReportRateDifference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 设备对比分析 */}
            {(hasData || hasReportRateData) && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100/50 dark:from-emerald-900/20 dark:to-teal-800/10 rounded-xl p-5 border border-emerald-200/50 dark:border-emerald-700/30">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-base">设备对比</h3>
                </div>
                <div className="space-y-3">
                  {/* 鼠标综合性能 */}
                  {(mouseStats.count > 0 || mouseMoveReportRateStats.totalEvents > 0) && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          鼠标延迟
                        </span>
                        <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                          {mouseStats.count > 0 ? `${mouseStats.avg}ms` : '未测试'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          鼠标回报率
                        </span>
                        <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                          {mouseMoveReportRateStats.totalEvents > 0 ? `${mouseMoveReportRateStats.reportRate}Hz` : '未测试'}
                        </span>
                      </div>
                    </>
                  )}
                  {/* 键盘综合性能 */}
                  {(keyboardStats.count > 0 || keyboardMoveReportRateStats.totalEvents > 0) && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          键盘延迟
                        </span>
                        <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                          {keyboardStats.count > 0 ? `${keyboardStats.avg}ms` : '未测试'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          键盘回报率
                        </span>
                        <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                          {keyboardMoveReportRateStats.totalEvents > 0 ? `${keyboardMoveReportRateStats.reportRate}Hz` : '未测试'}
                        </span>
                      </div>
                    </>
                  )}
                  {/* 性能差异对比 */}
                  {mouseStats.count > 0 && keyboardStats.count > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-emerald-200 dark:border-emerald-700">
                      <span className="text-xs text-muted-foreground">
                        延迟优势
                      </span>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                          mouseStats.avg < keyboardStats.avg
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}
                      >
                        <Zap
                          className={`w-3 h-3 ${
                            mouseStats.avg < keyboardStats.avg
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-purple-600 dark:text-purple-400'
                          }`}
                        />
                        <span
                          className={`font-semibold text-xs ${
                            mouseStats.avg < keyboardStats.avg
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {mouseStats.avg < keyboardStats.avg ? '鼠标' : '键盘'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)

OverallAnalysis.displayName = 'OverallAnalysis'
