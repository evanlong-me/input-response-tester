'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

import {
  Mouse,
  Keyboard,
  Zap,
  BarChart3,
  Timer,
  MousePointer2
} from 'lucide-react'

import { DeviceChart, ReportRateChart } from '@/components/device-chart'
import { TestArea } from '@/components/test-area'
import { TestProgress } from '@/components/test-progress'
import { PerformanceStats } from '@/components/performance-stats'
import { Instructions } from '@/components/instructions'
import { OverallAnalysis } from '@/components/overall-analysis'
import {
  calculateStats,
  calculateAdvancedStats,
  calculateMouseMoveReportRate
} from '@/lib/stats-utils'

interface TestResult {
  timestamp: number
  responseTime: number
  testType: 'mouse' | 'keyboard'
}

// 新增鼠标移动事件接口
interface MouseMoveEvent {
  timestamp: number
  x: number
  y: number
}

const MAX_TEST_COUNT = 20 // 统一测试次数
const MOUSE_MOVE_TEST_DURATION = 5000 // 鼠标晃动测试持续时间（毫秒）

export default function Home() {
  const [isMouseTesting, setIsMouseTesting] = useState(false)
  const [isKeyboardTesting, setIsKeyboardTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [waitingForInput, setWaitingForInput] = useState(false)
  const [testStartTime, setTestStartTime] = useState<number>(0)

  // 添加新的状态来控制测试区域的准备状态
  const [mouseTestReady, setMouseTestReady] = useState(true)
  const [keyboardTestReady, setKeyboardTestReady] = useState(true)
  const [keyboardAreaFocused, setKeyboardAreaFocused] = useState(false)

  // 连续测试相关状态
  const [mouseTestCount, setMouseTestCount] = useState(0)
  const [keyboardTestCount, setKeyboardTestCount] = useState(0)

  // 新增鼠标晃动测试相关状态
  const [isMouseMoveTesting, setIsMouseMoveTesting] = useState(false)
  const [mouseMoveEvents, setMouseMoveEvents] = useState<MouseMoveEvent[]>([])
  const [mouseMoveTestReady, setMouseMoveTestReady] = useState(true)
  const [mouseMoveTestProgress, setMouseMoveTestProgress] = useState(0)

  // 新增键盘回报率测试相关状态
  const [isKeyboardReportRateTesting, setIsKeyboardReportRateTesting] =
    useState(false)
  const [keyboardReportRateEvents, setKeyboardReportRateEvents] = useState<
    MouseMoveEvent[]
  >([])
  const [keyboardReportRateTestReady, setKeyboardReportRateTestReady] =
    useState(true)
  const [keyboardReportRateTestProgress, setKeyboardReportRateTestProgress] =
    useState(0)

  const mouseMoveTestAreaRef = useRef<HTMLDivElement>(null)
  const keyboardReportRateTestAreaRef = useRef<HTMLDivElement>(null)







  // 重新开始鼠标测试
  const handleMouseRestart = useCallback(async () => {
    if (isKeyboardTesting || isMouseMoveTesting || isKeyboardReportRateTesting)
      return

    // 清除之前的鼠标测试数据
    setTestResults((prev) => prev.filter((r) => r.testType !== 'mouse'))
    setIsMouseTesting(true)
    setMouseTestReady(false)
    setMouseTestCount(0)
    // 立即开始第一次测试，无延迟
    setWaitingForInput(true)
    setTestStartTime(performance.now())
  }, [isKeyboardTesting, isMouseMoveTesting, isKeyboardReportRateTesting])

  // 新增：开始鼠标晃动测试
  const handleMouseMoveTestStart = useCallback(async () => {
    if (
      isMouseTesting ||
      isKeyboardTesting ||
      isMouseMoveTesting ||
      isKeyboardReportRateTesting
    )
      return

    setMouseMoveEvents([])
    setIsMouseMoveTesting(true)
    setMouseMoveTestReady(false)
    setMouseMoveTestProgress(0)

    // 开始进度计时
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / MOUSE_MOVE_TEST_DURATION) * 100, 100)
      setMouseMoveTestProgress(progress)

      if (elapsed >= MOUSE_MOVE_TEST_DURATION) {
        clearInterval(progressInterval)
        setIsMouseMoveTesting(false)
        setMouseMoveTestReady(true)
        setMouseMoveTestProgress(100)
      }
    }, 50)
  }, [
    isMouseTesting,
    isKeyboardTesting,
    isMouseMoveTesting,
    isKeyboardReportRateTesting
  ])

  // 重新开始键盘测试
  const handleKeyboardRestart = useCallback(async () => {
    if (isMouseTesting || isMouseMoveTesting || isKeyboardReportRateTesting)
      return

    // 清除之前的键盘测试数据
    setTestResults((prev) => prev.filter((r) => r.testType !== 'keyboard'))
    setIsKeyboardTesting(true)
    setKeyboardTestReady(false)
    setKeyboardTestCount(0)
    setKeyboardAreaFocused(false) // 重置焦点状态
    // 立即开始第一次测试，无延迟
    setWaitingForInput(true)
    setTestStartTime(performance.now())
  }, [isMouseTesting, isMouseMoveTesting, isKeyboardReportRateTesting])

  // 新增：开始键盘回报率测试
  const handleKeyboardReportRateTestStart = useCallback(async () => {
    if (
      isMouseTesting ||
      isKeyboardTesting ||
      isMouseMoveTesting ||
      isKeyboardReportRateTesting
    )
      return

    setKeyboardReportRateEvents([])
    setIsKeyboardReportRateTesting(true)
    setKeyboardReportRateTestReady(false)
    setKeyboardReportRateTestProgress(0)

    // 开始进度计时
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / MOUSE_MOVE_TEST_DURATION) * 100, 100)
      setKeyboardReportRateTestProgress(progress)

      if (elapsed >= MOUSE_MOVE_TEST_DURATION) {
        clearInterval(progressInterval)
        setIsKeyboardReportRateTesting(false)
        setKeyboardReportRateTestReady(true)
        setKeyboardReportRateTestProgress(100)
      }
    }, 50)
  }, [
    isMouseTesting,
    isKeyboardTesting,
    isMouseMoveTesting,
    isKeyboardReportRateTesting
  ])

  // 简化的鼠标测试 - 仅处理测试中的点击
  const handleMouseClick = useCallback(() => {
    if (!isMouseTesting || !waitingForInput) return

    // 先增加测试计数
    const currentTestCount = mouseTestCount + 1
    setMouseTestCount(currentTestCount)

    // 完成当前测试
    const responseTime = Math.round(performance.now() - testStartTime)
    const result: TestResult = {
      timestamp: Date.now(),
      responseTime,
      testType: 'mouse'
    }

    setTestResults((prev) => [...prev, result])
    setWaitingForInput(false)

    if (currentTestCount < MAX_TEST_COUNT) {
      // 立即开始下一次测试，无延迟
      setWaitingForInput(true)
      setTestStartTime(performance.now())
    } else {
      // 完成所有测试
      setIsMouseTesting(false)
      setMouseTestCount(0)
      setMouseTestReady(true)
    }
  }, [isMouseTesting, waitingForInput, testStartTime, mouseTestCount])

  // 新增：处理鼠标移动事件
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isMouseMoveTesting) return

      const now = performance.now()
      const newEvent: MouseMoveEvent = {
        timestamp: now,
        x: e.clientX,
        y: e.clientY
      }

      setMouseMoveEvents((prev) => [...prev, newEvent])
    },
    [isMouseMoveTesting]
  )

  // 键盘事件监听
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 键盘回报率测试 - 记录所有按键事件
      if (isKeyboardReportRateTesting) {
        e.preventDefault()
        const now = performance.now()
        const newEvent: MouseMoveEvent = {
          timestamp: now,
          x: 0, // 键盘事件不需要坐标
          y: 0
        }
        setKeyboardReportRateEvents((prev) => [...prev, newEvent])
        return
      }

      // 响应时间测试 - 仅在测试进行中响应按键
      if (
        waitingForInput &&
        isKeyboardTesting &&
        keyboardTestCount < MAX_TEST_COUNT
      ) {
        // 完成键盘测试
        e.preventDefault()

        // 先增加测试计数
        const currentTestCount = keyboardTestCount + 1
        setKeyboardTestCount(currentTestCount)

        const responseTime = Math.round(performance.now() - testStartTime)
        const result: TestResult = {
          timestamp: Date.now(),
          responseTime,
          testType: 'keyboard'
        }

        setTestResults((prev) => [...prev, result])
        setWaitingForInput(false)

        if (currentTestCount < MAX_TEST_COUNT) {
          // 立即开始下一次测试，无延迟
          setWaitingForInput(true)
          setTestStartTime(performance.now())
        } else {
          // 完成所有测试
          setIsKeyboardTesting(false)
          setKeyboardTestCount(0)
          setKeyboardTestReady(true)
          setKeyboardAreaFocused(false) // 清除焦点状态
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [
    isKeyboardTesting,
    isKeyboardReportRateTesting,
    waitingForInput,
    testStartTime,
    keyboardTestCount
  ])

  const mouseStats = calculateStats(testResults, 'mouse')
  const keyboardStats = calculateStats(testResults, 'keyboard')
  const overallStats = calculateStats(testResults)

  // 计算高级统计数据
  const overallAdvancedStats = calculateAdvancedStats(testResults)

  // 新增：计算鼠标移动回报率数据
  const mouseMoveReportRateStats = calculateMouseMoveReportRate(mouseMoveEvents)

  // 新增：计算键盘回报率数据
  const keyboardMoveReportRateStats = calculateMouseMoveReportRate(
    keyboardReportRateEvents
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            HID 设备性能基准测试平台
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            高精度人机接口设备延迟分析与回报率测量系统，提供微秒级时序分析、统计学建模和性能基准评估
          </p>
        </div>

        {/* Mouse Test Section - 独占一行 */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mouse className="w-5 h-5" />
                鼠标延迟响应性能测试
              </CardTitle>
              <CardDescription>
                基于刺激-响应模型的鼠标点击延迟测量，采用高精度时间戳记录，分析输入延迟分布特征与系统响应性能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 测试区域 */}
              <TestArea
                testType="mouse"
                isActive={isMouseTesting}
                isReady={mouseTestReady}
                isWaiting={waitingForInput}
                hasResults={testResults.filter((r) => r.testType === 'mouse').length > 0}
                isOtherTestRunning={isKeyboardTesting || isMouseMoveTesting || isKeyboardReportRateTesting}
                currentCount={mouseTestCount}
                maxCount={MAX_TEST_COUNT}
                onClick={
                  isMouseTesting && waitingForInput
                    ? handleMouseClick
                    : mouseTestReady &&
                      !isMouseTesting &&
                      !isKeyboardTesting &&
                      !isMouseMoveTesting &&
                      testResults.filter((r) => r.testType === 'mouse').length === 0
                    ? handleMouseRestart
                    : undefined
                }
              />

              {/* 鼠标测试进度条和重新开始按钮 */}
              {(isMouseTesting ||
                testResults.filter((r) => r.testType === 'mouse').length > 0) && (
                <TestProgress
                  testType="response"
                  currentCount={isMouseTesting ? mouseTestCount : testResults.filter((r) => r.testType === 'mouse').length}
                  maxCount={MAX_TEST_COUNT}
                  isActive={isMouseTesting}
                  isDisabled={isKeyboardTesting || isMouseMoveTesting || isKeyboardReportRateTesting}
                  onRestart={handleMouseRestart}
                />
              )}

              {/* 图表和性能分析区域 */}
              {testResults.filter((r) => r.testType === 'mouse').length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t min-h-[400px]">
                  {/* 延迟图表 */}
                  <div className="flex flex-col">
                    <DeviceChart
                      testResults={testResults
                        .filter((r) => r.testType === 'mouse')
                        .slice(-20)}
                      deviceType="mouse"
                    />
                  </div>

                  {/* 鼠标性能统计 */}
                  <PerformanceStats
                    type="response"
                    title="鼠标性能分析"
                    stats={mouseStats}
                    testResults={testResults.filter((r) => r.testType === 'mouse')}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mouse Move Test Section - 新增鼠标晃动测试 */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer2 className="w-5 h-5" />
                鼠标轮询频率与时序精度测试
              </CardTitle>
              <CardDescription>
                通过连续鼠标移动事件采样分析设备轮询频率、时序抖动和频率稳定性，评估鼠标传感器与驱动程序性能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 鼠标晃动测试区域 */}
              <div
                ref={mouseMoveTestAreaRef}
                className={`
                  h-40 rounded-lg border-2 border-dashed flex items-center justify-center transition-all
                  select-none user-select-none touch-manipulation cursor-crosshair
                  ${
                    isMouseMoveTesting
                      ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/10 animate-pulse'
                      : mouseMoveTestReady &&
                        !isMouseTesting &&
                        !isKeyboardTesting &&
                        !isMouseMoveTesting &&
                        mouseMoveEvents.length === 0
                      ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/10 cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/20'
                      : mouseMoveTestReady &&
                        !isMouseTesting &&
                        !isKeyboardTesting &&
                        !isMouseMoveTesting &&
                        mouseMoveEvents.length > 0
                      ? 'border-green-400 bg-green-50/50 dark:bg-green-950/10'
                      : 'border-border'
                  }
                `}
                onClick={
                  mouseMoveTestReady &&
                  !isMouseTesting &&
                  !isKeyboardTesting &&
                  !isMouseMoveTesting &&
                  mouseMoveEvents.length === 0
                    ? handleMouseMoveTestStart
                    : undefined
                }
                onMouseMove={handleMouseMove}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                draggable={false}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                {isMouseMoveTesting && (
                  <div className="text-center pointer-events-none">
                    <MousePointer2 className="w-8 h-8 mx-auto mb-2 text-purple-500 animate-bounce" />
                    <p className="text-sm font-medium">
                      请在此区域内快速晃动鼠标！
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      已捕获 {mouseMoveEvents.length} 个移动事件
                    </p>
                    <p className="text-xs text-muted-foreground">
                      剩余时间:{' '}
                      {Math.ceil(
                        (MOUSE_MOVE_TEST_DURATION -
                          (mouseMoveTestProgress * MOUSE_MOVE_TEST_DURATION) /
                            100) /
                          1000
                      )}
                      秒
                    </p>
                  </div>
                )}

                {mouseMoveTestReady &&
                  !isMouseTesting &&
                  !isKeyboardTesting &&
                  !isMouseMoveTesting && (
                    <div className="text-center pointer-events-none">
                      {mouseMoveEvents.length > 0 ? (
                        <>
                          <MousePointer2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <p className="text-sm font-medium text-green-600">
                            鼠标晃动测试已完成
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            捕获了 {mouseMoveEvents.length} 个移动事件
                          </p>
                          <p className="text-xs text-muted-foreground">
                            点击下方按钮开始新的测试
                          </p>
                        </>
                      ) : (
                        <>
                          <MousePointer2 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <p className="text-sm font-medium text-purple-600">
                            点击此区域开始鼠标晃动测试
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            将进行5秒钟的鼠标移动监测
                          </p>
                        </>
                      )}
                    </div>
                  )}

                {(isMouseTesting || isKeyboardTesting) && (
                  <div className="text-center pointer-events-none">
                    <MousePointer2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isMouseTesting ? '鼠标点击测试进行中' : '键盘测试进行中'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      请等待当前测试完成
                    </p>
                  </div>
                )}
              </div>

              {/* 鼠标晃动测试进度条和重新开始按钮 */}
              {(isMouseMoveTesting || mouseMoveEvents.length > 0) && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>测试进度</span>
                      <span>
                        {isMouseMoveTesting
                          ? `${Math.round(mouseMoveTestProgress)}%`
                          : '100%'}
                      </span>
                    </div>
                    <Progress
                      value={isMouseMoveTesting ? mouseMoveTestProgress : 100}
                      className={`w-full ${
                        !isMouseMoveTesting
                          ? '[&>[data-slot=progress-indicator]]:bg-green-400'
                          : '[&>[data-slot=progress-indicator]]:bg-purple-400'
                      }`}
                    />
                  </div>
                  <Button
                    onClick={handleMouseMoveTestStart}
                    disabled={
                      isMouseTesting || isKeyboardTesting || isMouseMoveTesting
                    }
                    className="w-full"
                    variant="default"
                  >
                    {isMouseMoveTesting ? '测试进行中...' : '开始新的晃动测试'}
                  </Button>
                </div>
              )}

              {/* 鼠标晃动测试结果分析 */}
              {mouseMoveEvents.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t min-h-[400px]">
                  {/* 回报率图表 */}
                  <div className="flex flex-col">
                    <ReportRateChart
                      events={mouseMoveEvents}
                      deviceType="mouse"
                    />
                  </div>

                  {/* 鼠标晃动回报率统计 */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4" />
                      <h4 className="font-medium">鼠标晃动回报率分析</h4>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 flex-1 flex flex-col justify-center">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                            轮询频率指标
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                平均轮询频率
                              </span>
                              <span className="font-medium text-sm text-purple-600 dark:text-purple-400">
                                {mouseMoveReportRateStats.reportRate}Hz
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                有效轮询频率
                              </span>
                              <span className="font-medium text-sm text-indigo-600 dark:text-indigo-400">
                                {mouseMoveReportRateStats.effectiveReportRate}Hz
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                峰值频率 (Max)
                              </span>
                              <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                                {mouseMoveReportRateStats.maxReportRate}Hz
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                最低频率 (Min)
                              </span>
                              <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                                {mouseMoveReportRateStats.minReportRate}Hz
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                平均采样间隔
                              </span>
                              <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                                {mouseMoveReportRateStats.averageInterval}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                中位数间隔
                              </span>
                              <span className="font-medium text-sm text-teal-600 dark:text-teal-400">
                                {mouseMoveReportRateStats.medianInterval}ms
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                            时序稳定性指标
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                时序抖动 (Jitter)
                              </span>
                              <span className="font-medium text-sm text-amber-600 dark:text-amber-400">
                                {mouseMoveReportRateStats.jitter}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                时序精度评分
                              </span>
                              <span
                                className={`font-medium text-sm ${
                                  mouseMoveReportRateStats.temporalPrecision >= 80
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : mouseMoveReportRateStats.temporalPrecision >= 60
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {mouseMoveReportRateStats.temporalPrecision}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                频率稳定性评分
                              </span>
                              <span
                                className={`font-medium text-sm ${
                                  mouseMoveReportRateStats.frequencyStability >= 80
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : mouseMoveReportRateStats.frequencyStability >= 60
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {mouseMoveReportRateStats.frequencyStability}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                综合稳定性评分
                              </span>
                              <span
                                className={`font-medium text-sm ${
                                  mouseMoveReportRateStats.stability >= 80
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : mouseMoveReportRateStats.stability >= 60
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {mouseMoveReportRateStats.stability}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                间隔方差 (σ²)
                              </span>
                              <span className="font-medium text-sm text-cyan-600 dark:text-cyan-400">
                                {mouseMoveReportRateStats.intervalVariance}ms²
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                95分位间隔 (P95)
                              </span>
                              <span className="font-medium text-sm text-pink-600 dark:text-pink-400">
                                {mouseMoveReportRateStats.p95Interval}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                采样事件总数
                              </span>
                              <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                                {mouseMoveReportRateStats.totalEvents}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                有效测试时长
                              </span>
                              <span className="font-medium text-sm text-violet-600 dark:text-violet-400">
                                {(
                                  mouseMoveReportRateStats.testDuration / 1000
                                ).toFixed(2)}s
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Test Section - 独占一行 */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                键盘轮询频率与信号完整性测试
              </CardTitle>
              <CardDescription>
                通过连续按键事件序列分析键盘轮询频率、信号时序稳定性和数据传输完整性，评估键盘控制器性能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 测试区域 */}
              <div
                className={`
                 h-32 rounded-lg border-2 border-dashed flex items-center justify-center transition-all
                 select-none user-select-none touch-manipulation outline-none
                 ${
                   waitingForInput && isKeyboardTesting
                     ? 'border-green-400 bg-green-50/50 dark:bg-green-950/10 animate-pulse cursor-pointer'
                     : keyboardTestReady &&
                       !isMouseTesting &&
                       !isMouseMoveTesting &&
                       keyboardAreaFocused
                     ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/10 cursor-pointer'
                     : !keyboardTestReady && !isKeyboardTesting
                     ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                     : keyboardTestReady &&
                       !isKeyboardTesting &&
                       !isMouseTesting &&
                       !isMouseMoveTesting &&
                       testResults.filter((r) => r.testType === 'keyboard')
                         .length === 0
                     ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/10 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20'
                     : keyboardTestReady &&
                       !isKeyboardTesting &&
                       !isMouseTesting &&
                       !isMouseMoveTesting &&
                       testResults.filter((r) => r.testType === 'keyboard')
                         .length > 0
                     ? 'border-green-400 bg-green-50/50 dark:bg-green-950/10'
                     : 'border-border'
                 }
               `}
                tabIndex={
                  isKeyboardTesting ||
                  (keyboardTestReady &&
                    !isMouseTesting &&
                    !isMouseMoveTesting &&
                    !isKeyboardTesting &&
                    testResults.filter((r) => r.testType === 'keyboard')
                      .length === 0)
                    ? 0
                    : -1
                }
                onClick={
                  isKeyboardTesting
                    ? () => setKeyboardAreaFocused(true)
                    : keyboardTestReady &&
                      !isKeyboardTesting &&
                      !isMouseTesting &&
                      !isMouseMoveTesting &&
                      testResults.filter((r) => r.testType === 'keyboard')
                        .length === 0
                    ? handleKeyboardRestart
                    : undefined
                }
                onFocus={
                  isKeyboardTesting
                    ? () => setKeyboardAreaFocused(true)
                    : keyboardTestReady &&
                      !isMouseTesting &&
                      !isMouseMoveTesting &&
                      !isKeyboardTesting &&
                      testResults.filter((r) => r.testType === 'keyboard')
                        .length === 0
                    ? () => setKeyboardAreaFocused(true)
                    : undefined
                }
                onBlur={
                  isKeyboardTesting ||
                  (keyboardTestReady &&
                    !isMouseTesting &&
                    !isMouseMoveTesting &&
                    !isKeyboardTesting &&
                    testResults.filter((r) => r.testType === 'keyboard')
                      .length === 0)
                    ? () => setKeyboardAreaFocused(false)
                    : undefined
                }
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                draggable={false}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                {waitingForInput && isKeyboardTesting && (
                  <div className="text-center pointer-events-none">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium">请快速按任意键！</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      测试 {keyboardTestCount}/{MAX_TEST_COUNT}
                    </p>
                  </div>
                )}

                {keyboardTestReady &&
                  !isKeyboardTesting &&
                  !isMouseTesting &&
                  !isMouseMoveTesting && (
                    <div className="text-center pointer-events-none">
                      {testResults.filter((r) => r.testType === 'keyboard')
                        .length > 0 ? (
                        <>
                          <Keyboard className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <p className="text-sm font-medium text-green-600">
                            键盘测试已完成
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            点击下方按钮开始新的测试
                          </p>
                        </>
                      ) : (
                        <>
                          <Keyboard className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-sm font-medium text-blue-600">
                            点击此区域开始键盘测试
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            将进行20次连续延迟测试
                          </p>
                        </>
                      )}
                    </div>
                  )}
                {!keyboardTestReady && !isKeyboardTesting && (
                  <div className="text-center pointer-events-none">
                    <Timer className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p className="text-sm text-amber-600">准备下次测试中...</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      请稍等片刻
                    </p>
                  </div>
                )}
                {(isMouseTesting || isMouseMoveTesting) && (
                  <div className="text-center pointer-events-none">
                    <Keyboard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isMouseTesting ? '鼠标测试进行中' : '鼠标晃动测试进行中'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      请等待当前测试完成
                    </p>
                  </div>
                )}
              </div>

              {/* 键盘测试进度条和重新开始按钮 */}
              {(isKeyboardTesting ||
                testResults.filter((r) => r.testType === 'keyboard').length >
                  0) && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>测试进度</span>
                      <span>
                        {isKeyboardTesting
                          ? keyboardTestCount
                          : testResults.filter((r) => r.testType === 'keyboard')
                              .length}
                        /{MAX_TEST_COUNT}
                      </span>
                    </div>
                    <Progress
                      value={
                        isKeyboardTesting
                          ? (keyboardTestCount / MAX_TEST_COUNT) * 100
                          : 100
                      }
                      className={`w-full ${
                        !isKeyboardTesting
                          ? '[&>[data-slot=progress-indicator]]:bg-green-400'
                          : ''
                      }`}
                    />
                  </div>
                  <Button
                    onClick={handleKeyboardRestart}
                    disabled={isMouseTesting || isMouseMoveTesting}
                    className="w-full"
                    variant="default"
                  >
                    {isKeyboardTesting ? '重新开始测试' : '开始新的测试'}
                  </Button>
                </div>
              )}

              {/* 图表和性能分析区域 */}
              {testResults.filter((r) => r.testType === 'keyboard').length >
                0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t min-h-[400px]">
                  {/* 延迟图表 */}
                  <div className="flex flex-col">
                    <DeviceChart
                      testResults={testResults
                        .filter((r) => r.testType === 'keyboard')
                        .slice(-20)}
                      deviceType="keyboard"
                    />
                  </div>

                  {/* 键盘性能统计 */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4" />
                      <h4 className="font-medium">键盘性能分析</h4>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 flex-1 flex flex-col justify-center">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                            延迟指标
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                平均延迟
                              </span>
                              <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                                {keyboardStats.avg}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                最佳表现
                              </span>
                              <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                                {keyboardStats.min}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                最差表现
                              </span>
                              <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                                {keyboardStats.max}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                延迟范围
                              </span>
                              <span className="font-medium text-sm text-violet-600 dark:text-violet-400">
                                {keyboardStats.max - keyboardStats.min}ms
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
                                标准差
                              </span>
                              <span className="font-medium text-sm text-cyan-600 dark:text-cyan-400">
                                {(() => {
                                  const results = testResults.filter(
                                    (r) => r.testType === 'keyboard'
                                  )
                                  if (results.length === 0) return '0ms'
                                  const times = results.map(
                                    (r) => r.responseTime
                                  )
                                  const avg =
                                    times.reduce((a, b) => a + b, 0) /
                                    times.length
                                  const variance =
                                    times.reduce(
                                      (acc, time) =>
                                        acc + Math.pow(time - avg, 2),
                                      0
                                    ) / times.length
                                  return Math.round(Math.sqrt(variance)) + 'ms'
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                变异系数
                              </span>
                              <span className="font-medium text-sm text-pink-600 dark:text-pink-400">
                                {(() => {
                                  const results = testResults.filter(
                                    (r) => r.testType === 'keyboard'
                                  )
                                  if (
                                    results.length === 0 ||
                                    keyboardStats.avg === 0
                                  )
                                    return '0%'
                                  const times = results.map(
                                    (r) => r.responseTime
                                  )
                                  const avg =
                                    times.reduce((a, b) => a + b, 0) /
                                    times.length
                                  const variance =
                                    times.reduce(
                                      (acc, time) =>
                                        acc + Math.pow(time - avg, 2),
                                      0
                                    ) / times.length
                                  const stdDev = Math.sqrt(variance)
                                  return Math.round((stdDev / avg) * 100) + '%'
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                95%分位数
                              </span>
                              <span className="font-medium text-sm text-rose-600 dark:text-rose-400">
                                {(() => {
                                  const results = testResults.filter(
                                    (r) => r.testType === 'keyboard'
                                  )
                                  if (results.length === 0) return '0ms'
                                  const times = results
                                    .map((r) => r.responseTime)
                                    .sort((a, b) => a - b)
                                  const index =
                                    Math.ceil(times.length * 0.95) - 1
                                  return times[Math.max(0, index)] + 'ms'
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                测试样本
                              </span>
                              <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                                {keyboardStats.count}次
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Report Rate Test Section - 新增键盘回报率测试 */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                键盘轮询频率与信号完整性测试
              </CardTitle>
              <CardDescription>
                通过连续按键事件序列分析键盘轮询频率、信号时序稳定性和数据传输完整性，评估键盘控制器性能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 键盘回报率测试区域 */}
              <div
                ref={keyboardReportRateTestAreaRef}
                className={`
                  h-40 rounded-lg border-2 border-dashed flex items-center justify-center transition-all
                  select-none user-select-none touch-manipulation outline-none
                  ${
                    isKeyboardReportRateTesting
                      ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10 animate-pulse'
                      : keyboardReportRateTestReady &&
                        !isMouseTesting &&
                        !isKeyboardTesting &&
                        !isMouseMoveTesting &&
                        !isKeyboardReportRateTesting &&
                        keyboardReportRateEvents.length === 0
                      ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10 cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20'
                      : keyboardReportRateTestReady &&
                        !isMouseTesting &&
                        !isKeyboardTesting &&
                        !isMouseMoveTesting &&
                        !isKeyboardReportRateTesting &&
                        keyboardReportRateEvents.length > 0
                      ? 'border-green-400 bg-green-50/50 dark:bg-green-950/10'
                      : 'border-border'
                  }
                `}
                tabIndex={
                  isKeyboardReportRateTesting ||
                  (keyboardReportRateTestReady &&
                    !isMouseTesting &&
                    !isKeyboardTesting &&
                    !isMouseMoveTesting &&
                    !isKeyboardReportRateTesting &&
                    keyboardReportRateEvents.length === 0)
                    ? 0
                    : -1
                }
                onClick={
                  keyboardReportRateTestReady &&
                  !isMouseTesting &&
                  !isKeyboardTesting &&
                  !isMouseMoveTesting &&
                  !isKeyboardReportRateTesting &&
                  keyboardReportRateEvents.length === 0
                    ? handleKeyboardReportRateTestStart
                    : undefined
                }
                onFocus={
                  keyboardReportRateTestReady &&
                  !isMouseTesting &&
                  !isKeyboardTesting &&
                  !isMouseMoveTesting &&
                  !isKeyboardReportRateTesting &&
                  keyboardReportRateEvents.length === 0
                    ? handleKeyboardReportRateTestStart
                    : undefined
                }
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                draggable={false}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                {isKeyboardReportRateTesting && (
                  <div className="text-center pointer-events-none">
                    <Keyboard className="w-8 h-8 mx-auto mb-2 text-indigo-500 animate-bounce" />
                    <p className="text-sm font-medium">请保持连续按键输入！</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      已采样 {keyboardReportRateEvents.length} 个按键信号
                    </p>
                    <p className="text-xs text-muted-foreground">
                      剩余采样时间:{' '}
                      {Math.ceil(
                        (MOUSE_MOVE_TEST_DURATION -
                          (keyboardReportRateTestProgress *
                            MOUSE_MOVE_TEST_DURATION) /
                            100) /
                          1000
                      )}
                      秒
                    </p>
                  </div>
                )}

                {keyboardReportRateTestReady &&
                  !isMouseTesting &&
                  !isKeyboardTesting &&
                  !isMouseMoveTesting &&
                  !isKeyboardReportRateTesting && (
                    <div className="text-center pointer-events-none">
                      {keyboardReportRateEvents.length > 0 ? (
                        <>
                          <Keyboard className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <p className="text-sm font-medium text-green-600">
                            键盘轮询频率测试已完成
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            采样了 {keyboardReportRateEvents.length} 个按键信号
                          </p>
                          <p className="text-xs text-muted-foreground">
                            点击下方按钮开始新的测试
                          </p>
                        </>
                      ) : (
                        <>
                          <Keyboard className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                          <p className="text-sm font-medium text-indigo-600">
                            点击此区域开始键盘轮询频率测试
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            将进行5秒钟的按键信号采样
                          </p>
                        </>
                      )}
                    </div>
                  )}

                {(isMouseTesting ||
                  isMouseMoveTesting ||
                  isKeyboardTesting) && (
                  <div className="text-center pointer-events-none">
                    <Keyboard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isMouseTesting
                        ? '鼠标点击测试进行中'
                        : isMouseMoveTesting
                        ? '鼠标晃动测试进行中'
                        : '键盘延迟测试进行中'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      请等待当前测试完成
                    </p>
                  </div>
                )}
              </div>

              {/* 键盘回报率测试进度条和重新开始按钮 */}
              {(isKeyboardReportRateTesting ||
                keyboardReportRateEvents.length > 0) && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>测试进度</span>
                      <span>
                        {isKeyboardReportRateTesting
                          ? `${Math.round(keyboardReportRateTestProgress)}%`
                          : '100%'}
                      </span>
                    </div>
                    <Progress
                      value={
                        isKeyboardReportRateTesting
                          ? keyboardReportRateTestProgress
                          : 100
                      }
                      className={`w-full ${
                        !isKeyboardReportRateTesting
                          ? '[&>[data-slot=progress-indicator]]:bg-green-400'
                          : '[&>[data-slot=progress-indicator]]:bg-indigo-400'
                      }`}
                    />
                  </div>
                  <Button
                    onClick={handleKeyboardReportRateTestStart}
                    disabled={
                      isMouseTesting ||
                      isKeyboardTesting ||
                      isMouseMoveTesting ||
                      isKeyboardReportRateTesting
                    }
                    className="w-full"
                    variant="default"
                  >
                    {isKeyboardReportRateTesting
                      ? '信号采样进行中...'
                      : '开始新的轮询频率测试'}
                  </Button>
                </div>
              )}

              {/* 键盘回报率测试结果分析 */}
              {keyboardReportRateEvents.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t min-h-[400px]">
                  {/* 回报率图表 */}
                  <div className="flex flex-col">
                    <ReportRateChart
                      events={keyboardReportRateEvents}
                      deviceType="keyboard"
                    />
                  </div>

                  {/* 键盘回报率统计 */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4" />
                      <h4 className="font-medium">键盘轮询频率分析</h4>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 flex-1 flex flex-col justify-center">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                            轮询频率指标
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                平均轮询频率
                              </span>
                              <span className="font-medium text-sm text-indigo-600 dark:text-indigo-400">
                                {keyboardMoveReportRateStats.reportRate}Hz
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                有效轮询频率
                              </span>
                              <span className="font-medium text-sm text-purple-600 dark:text-purple-400">
                                {keyboardMoveReportRateStats.effectiveReportRate}Hz
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                峰值频率 (Max)
                              </span>
                              <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                                {keyboardMoveReportRateStats.maxReportRate}Hz
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                最低频率 (Min)
                              </span>
                              <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                                {keyboardMoveReportRateStats.minReportRate}Hz
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                平均信号间隔
                              </span>
                              <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                                {keyboardMoveReportRateStats.averageInterval}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                中位数间隔
                              </span>
                              <span className="font-medium text-sm text-teal-600 dark:text-teal-400">
                                {keyboardMoveReportRateStats.medianInterval}ms
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                            信号完整性指标
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                时序抖动 (Jitter)
                              </span>
                              <span className="font-medium text-sm text-amber-600 dark:text-amber-400">
                                {keyboardMoveReportRateStats.jitter}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                时序精度评分
                              </span>
                              <span
                                className={`font-medium text-sm ${
                                  keyboardMoveReportRateStats.temporalPrecision >= 80
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : keyboardMoveReportRateStats.temporalPrecision >= 60
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {keyboardMoveReportRateStats.temporalPrecision}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                频率稳定性评分
                              </span>
                              <span
                                className={`font-medium text-sm ${
                                  keyboardMoveReportRateStats.frequencyStability >= 80
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : keyboardMoveReportRateStats.frequencyStability >= 60
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {keyboardMoveReportRateStats.frequencyStability}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                综合稳定性评分
                              </span>
                              <span
                                className={`font-medium text-sm ${
                                  keyboardMoveReportRateStats.stability >= 80
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : keyboardMoveReportRateStats.stability >= 60
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {keyboardMoveReportRateStats.stability}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                信号方差 (σ²)
                              </span>
                              <span className="font-medium text-sm text-cyan-600 dark:text-cyan-400">
                                {keyboardMoveReportRateStats.intervalVariance}ms²
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                95分位间隔 (P95)
                              </span>
                              <span className="font-medium text-sm text-pink-600 dark:text-pink-400">
                                {keyboardMoveReportRateStats.p95Interval}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                信号采样总数
                              </span>
                              <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                                {keyboardMoveReportRateStats.totalEvents}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                有效采样时长
                              </span>
                              <span className="font-medium text-sm text-violet-600 dark:text-violet-400">
                                {(
                                  keyboardMoveReportRateStats.testDuration / 1000
                                ).toFixed(2)}s
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 综合性能分析 - 独占一行，分三列 */}
        <OverallAnalysis
          overallStats={overallStats}
          mouseStats={mouseStats}
          keyboardStats={keyboardStats}
          overallAdvancedStats={overallAdvancedStats}
          maxTestCount={MAX_TEST_COUNT}
        />

        {/* Instructions */}
        <Instructions />
      </div>
    </div>
  )
}
