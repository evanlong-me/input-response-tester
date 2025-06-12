'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import {
  Mouse,
  Keyboard,
  MousePointer2
} from 'lucide-react'

import { DeviceChart, ReportRateChart } from '@/components/device-chart'
import { TestArea } from '@/components/test-area'
import { TestProgress } from '@/components/test-progress'
import { PerformanceStats } from '@/components/performance-stats'
import { Instructions } from '@/components/instructions'
import { OverallAnalysis } from '@/components/overall-analysis'
import { ReportRateStatsDisplay } from '@/components/report-rate-stats'

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
      if (isKeyboardTesting && waitingForInput) {
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
            HID 设备性能基准测试
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            键盘和鼠标延迟与回报率测试工具
          </p>
        </div>

        {/* Mouse Test Section - 独占一行 */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mouse className="w-5 h-5" />
                鼠标延迟测试
              </CardTitle>
              <CardDescription>
                测量鼠标点击延迟，分析响应时间
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
                    title="鼠标延迟统计"
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
                鼠标回报率测试
              </CardTitle>
              <CardDescription>
                测量鼠标移动事件的回报率和稳定性
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 鼠标晃动测试区域 */}
              <TestArea
                testType="mouse-move"
                isActive={isMouseMoveTesting}
                isReady={mouseMoveTestReady}
                isWaiting={isMouseMoveTesting}
                hasResults={mouseMoveEvents.length > 0}
                isOtherTestRunning={isMouseTesting || isKeyboardTesting || isKeyboardReportRateTesting}
                totalEvents={mouseMoveEvents.length}
                remainingTime={Math.ceil(
                  (MOUSE_MOVE_TEST_DURATION -
                    (mouseMoveTestProgress * MOUSE_MOVE_TEST_DURATION) / 100) / 1000
                )}
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
                className="h-40"
              />

              {/* 鼠标晃动测试进度条和重新开始按钮 */}
              {(isMouseMoveTesting || mouseMoveEvents.length > 0) && (
                <TestProgress
                  testType="report-rate"
                  progress={isMouseMoveTesting ? mouseMoveTestProgress : 100}
                  isActive={isMouseMoveTesting}
                  isDisabled={isMouseTesting || isKeyboardTesting || isKeyboardReportRateTesting}
                  onRestart={handleMouseMoveTestStart}
                  buttonText={isMouseMoveTesting ? '测试进行中...' : '重新测试回报率'}
                />
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
                  <ReportRateStatsDisplay
                    title="鼠标回报率统计"
                    stats={mouseMoveReportRateStats}
                    deviceType="mouse"
                  />
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
                键盘延迟测试
              </CardTitle>
              <CardDescription>
                测量键盘按键延迟，分析响应时间
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 测试区域 */}
              <TestArea
                testType="keyboard"
                isActive={isKeyboardTesting}
                isReady={keyboardTestReady}
                isWaiting={waitingForInput}
                hasResults={testResults.filter((r) => r.testType === 'keyboard').length > 0}
                isOtherTestRunning={isMouseTesting || isMouseMoveTesting || isKeyboardReportRateTesting}
                currentCount={keyboardTestCount}
                maxCount={MAX_TEST_COUNT}
                onClick={
                  keyboardTestReady &&
                  !isKeyboardTesting &&
                  !isMouseTesting &&
                  !isMouseMoveTesting &&
                  !isKeyboardReportRateTesting &&
                  testResults.filter((r) => r.testType === 'keyboard').length === 0
                    ? handleKeyboardRestart
                    : undefined
                }
              />

              {/* 键盘测试进度条和重新开始按钮 */}
              {(isKeyboardTesting ||
                testResults.filter((r) => r.testType === 'keyboard').length > 0) && (
                <TestProgress
                  testType="response"
                  currentCount={isKeyboardTesting ? keyboardTestCount : testResults.filter((r) => r.testType === 'keyboard').length}
                  maxCount={MAX_TEST_COUNT}
                  isActive={isKeyboardTesting}
                  isDisabled={isMouseTesting || isMouseMoveTesting || isKeyboardReportRateTesting}
                  onRestart={handleKeyboardRestart}
                />
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
                  <PerformanceStats
                    type="response"
                    title="键盘延迟统计"
                    stats={keyboardStats}
                    testResults={testResults.filter((r) => r.testType === 'keyboard')}
                  />
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
                键盘回报率测试
              </CardTitle>
              <CardDescription>
                测量键盘按键事件的回报率和稳定性
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 键盘回报率测试区域 */}
              <TestArea
                testType="keyboard-report-rate"
                isActive={isKeyboardReportRateTesting}
                isReady={keyboardReportRateTestReady}
                isWaiting={isKeyboardReportRateTesting}
                hasResults={keyboardReportRateEvents.length > 0}
                isOtherTestRunning={isMouseTesting || isKeyboardTesting || isMouseMoveTesting}
                totalEvents={keyboardReportRateEvents.length}
                remainingTime={Math.ceil(
                  (MOUSE_MOVE_TEST_DURATION -
                    (keyboardReportRateTestProgress * MOUSE_MOVE_TEST_DURATION) / 100) / 1000
                )}
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
                className="h-40"
              />

              {/* 键盘回报率测试进度条和重新开始按钮 */}
              {(isKeyboardReportRateTesting || keyboardReportRateEvents.length > 0) && (
                <TestProgress
                  testType="report-rate"
                  progress={isKeyboardReportRateTesting ? keyboardReportRateTestProgress : 100}
                  isActive={isKeyboardReportRateTesting}
                  isDisabled={isMouseTesting || isKeyboardTesting || isMouseMoveTesting || isKeyboardReportRateTesting}
                  onRestart={handleKeyboardReportRateTestStart}
                  buttonText={isKeyboardReportRateTesting ? '测试进行中...' : '重新测试回报率'}
                />
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
                  <ReportRateStatsDisplay
                    title="键盘回报率统计"
                    stats={keyboardMoveReportRateStats}
                    deviceType="keyboard"
                  />
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
        />

        {/* Instructions */}
        <Instructions />
      </div>
    </div>
  )
}
