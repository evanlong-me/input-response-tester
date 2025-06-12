'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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

import { OverallAnalysis } from '@/components/overall-analysis'
import { ReportRateStatsDisplay } from '@/components/report-rate-stats'

import {
  calculateStats,
  calculateMouseMoveReportRate,
  calculateKeyboardReportRate
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

// 数据分析测试次数设置
const MOUSE_TEST_COUNT = 30 // 鼠标延迟测试次数
const KEYBOARD_TEST_COUNT = 50 // 键盘延迟测试次数
const MOUSE_MOVE_TEST_DURATION = 5000 // 鼠标晃动测试持续时间（毫秒）

export default function Home() {
  // 基础测试状态
  const [isMouseTesting, setIsMouseTesting] = useState(false)
  const [isKeyboardTesting, setIsKeyboardTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [waitingForInput, setWaitingForInput] = useState(false)
  const [testStartTime, setTestStartTime] = useState<number>(0)

  // 测试计数状态
  const [mouseTestCount, setMouseTestCount] = useState(0)
  const [keyboardTestCount, setKeyboardTestCount] = useState(0)

  // 回报率测试状态
  const [isMouseMoveTesting, setIsMouseMoveTesting] = useState(false)
  const [mouseMoveEvents, setMouseMoveEvents] = useState<MouseMoveEvent[]>([])
  const [mouseMoveTestProgress, setMouseMoveTestProgress] = useState(0)

  const [isKeyboardReportRateTesting, setIsKeyboardReportRateTesting] = useState(false)
  const [keyboardReportRateEvents, setKeyboardReportRateEvents] = useState<MouseMoveEvent[]>([])
  const [keyboardReportRateTestProgress, setKeyboardReportRateTestProgress] = useState(0)

  // 计时器引用
  const [mouseProgressTimer, setMouseProgressTimer] = useState<NodeJS.Timeout | null>(null)
  const [keyboardProgressTimer, setKeyboardProgressTimer] = useState<NodeJS.Timeout | null>(null)

  // 使用 useMemo 缓存计算结果，避免重复计算
  const { mouseResults, keyboardResults } = useMemo(() => ({
    mouseResults: testResults.filter((r) => r.testType === 'mouse'),
    keyboardResults: testResults.filter((r) => r.testType === 'keyboard')
  }), [testResults])

  const mouseStats = useMemo(() => calculateStats(testResults, 'mouse'), [testResults])
  const keyboardStats = useMemo(() => calculateStats(testResults, 'keyboard'), [testResults])
  const overallStats = useMemo(() => calculateStats(testResults), [testResults])


  const mouseMoveReportRateStats = useMemo(() => 
    calculateMouseMoveReportRate(mouseMoveEvents), [mouseMoveEvents])
  const keyboardMoveReportRateStats = useMemo(() => 
    calculateKeyboardReportRate(keyboardReportRateEvents), [keyboardReportRateEvents])

  // 使用 useMemo 缓存测试状态
  const testStates = useMemo(() => ({
    isAnyTesting: isMouseTesting || isKeyboardTesting || isMouseMoveTesting || isKeyboardReportRateTesting,
    mouseTestReady: !isMouseTesting && !isKeyboardTesting && !isMouseMoveTesting && !isKeyboardReportRateTesting,
    keyboardTestReady: !isMouseTesting && !isKeyboardTesting && !isMouseMoveTesting && !isKeyboardReportRateTesting,
    mouseMoveTestReady: !isMouseTesting && !isKeyboardTesting && !isMouseMoveTesting && !isKeyboardReportRateTesting,
    keyboardReportRateTestReady: !isMouseTesting && !isKeyboardTesting && !isMouseMoveTesting && !isKeyboardReportRateTesting
  }), [isMouseTesting, isKeyboardTesting, isMouseMoveTesting, isKeyboardReportRateTesting])

  // 优化的进度计时器函数
  const createProgressTimer = useCallback((
    duration: number,
    setProgress: (progress: number) => void,
    onComplete: () => void,
    setTimer: (timer: NodeJS.Timeout | null) => void
  ) => {
    const startTime = performance.now()
    
    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      setProgress(progress)

      if (elapsed >= duration) {
        clearInterval(timer)
        setTimer(null)
        onComplete()
      }
    }, 500)
    
    setTimer(timer)
  }, [])

  // 鼠标测试处理函数
  const handleMouseRestart = useCallback(() => {
    if (!testStates.mouseTestReady) return

    setTestResults((prev) => prev.filter((r) => r.testType !== 'mouse'))
    setIsMouseTesting(true)
    setMouseTestCount(0)
    setWaitingForInput(true)
    setTestStartTime(performance.now())
  }, [testStates.mouseTestReady])

  const handleMouseClick = useCallback(() => {
    if (!isMouseTesting || !waitingForInput) return

    const currentTestCount = mouseTestCount + 1
    setMouseTestCount(currentTestCount)

    const responseTime = Math.round(performance.now() - testStartTime)
    const result: TestResult = {
      timestamp: Date.now(),
      responseTime,
      testType: 'mouse'
    }

    setTestResults((prev) => [...prev, result])
    setWaitingForInput(false)

    if (currentTestCount < MOUSE_TEST_COUNT) {
      setWaitingForInput(true)
      setTestStartTime(performance.now())
    } else {
      setIsMouseTesting(false)
      setMouseTestCount(0)
    }
  }, [isMouseTesting, waitingForInput, testStartTime, mouseTestCount])

  // 鼠标移动测试处理函数
  const handleMouseMoveTestStart = useCallback(() => {
    if (!testStates.mouseMoveTestReady) return

    setMouseMoveEvents([])
    setIsMouseMoveTesting(true)
    setMouseMoveTestProgress(0)

    if (mouseProgressTimer) clearInterval(mouseProgressTimer)

    createProgressTimer(
      MOUSE_MOVE_TEST_DURATION,
      setMouseMoveTestProgress,
      () => {
        setIsMouseMoveTesting(false)
        setMouseMoveTestProgress(100)
      },
      setMouseProgressTimer
    )
  }, [testStates.mouseMoveTestReady, mouseProgressTimer, createProgressTimer])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseMoveTesting) return

    const newEvent: MouseMoveEvent = {
      timestamp: performance.now(),
      x: e.clientX,
      y: e.clientY
    }

    setMouseMoveEvents((prev) => [...prev, newEvent])
  }, [isMouseMoveTesting])

  // 键盘测试处理函数
  const handleKeyboardRestart = useCallback(() => {
    if (!testStates.keyboardTestReady) return

    setTestResults((prev) => prev.filter((r) => r.testType !== 'keyboard'))
    setIsKeyboardTesting(true)
    setKeyboardTestCount(0)
    setWaitingForInput(true)
    setTestStartTime(performance.now())
  }, [testStates.keyboardTestReady])

  const handleKeyboardReportRateTestStart = useCallback(() => {
    if (!testStates.keyboardReportRateTestReady) return

    setKeyboardReportRateEvents([])
    setIsKeyboardReportRateTesting(true)
    setKeyboardReportRateTestProgress(0)

    if (keyboardProgressTimer) clearInterval(keyboardProgressTimer)

    createProgressTimer(
      MOUSE_MOVE_TEST_DURATION,
      setKeyboardReportRateTestProgress,
      () => {
        setIsKeyboardReportRateTesting(false)
        setKeyboardReportRateTestProgress(100)
      },
      setKeyboardProgressTimer
    )
  }, [testStates.keyboardReportRateTestReady, keyboardProgressTimer, createProgressTimer])

  // 键盘事件监听
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isKeyboardReportRateTesting) {
        e.preventDefault()
        const newEvent: MouseMoveEvent = {
          timestamp: performance.now(),
          x: 0,
          y: 0
        }
        setKeyboardReportRateEvents((prev) => [...prev, newEvent])
        return
      }

      if (isKeyboardTesting && waitingForInput) {
        e.preventDefault()

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

        if (currentTestCount < KEYBOARD_TEST_COUNT) {
          setWaitingForInput(true)
          setTestStartTime(performance.now())
        } else {
          setIsKeyboardTesting(false)
          setKeyboardTestCount(0)
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isKeyboardTesting, isKeyboardReportRateTesting, waitingForInput, testStartTime, keyboardTestCount])

  // 清理计时器
  useEffect(() => {
    return () => {
      if (mouseProgressTimer) clearInterval(mouseProgressTimer)
      if (keyboardProgressTimer) clearInterval(keyboardProgressTimer)
    }
  }, [mouseProgressTimer, keyboardProgressTimer])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 背景装饰层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-gray-900/30 to-zinc-900/50"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/8 to-cyan-500/8 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
      
      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="container max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            HID 设备性能基准测试
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            键盘和鼠标延迟与回报率测试工具
          </p>
        </div>

        {/* Mouse Test Section */}
        <TestSection
          title="鼠标延迟测试"
          description="测量鼠标点击延迟，分析响应时间"
          icon={Mouse}
          testType="mouse"
          isActive={isMouseTesting}
          isReady={testStates.mouseTestReady}
          isWaiting={waitingForInput}
          hasResults={mouseResults.length > 0}
          isOtherTestRunning={testStates.isAnyTesting && !isMouseTesting}
          currentCount={mouseTestCount}
          maxCount={MOUSE_TEST_COUNT}
          onClick={isMouseTesting && waitingForInput ? handleMouseClick : 
                   (testStates.mouseTestReady && mouseResults.length === 0 ? handleMouseRestart : undefined)}
          onRestart={handleMouseRestart}
          testResults={mouseResults}
          stats={mouseStats}
        />

        {/* Mouse Move Test Section */}
        <ReportRateTestSection
          title="鼠标回报率测试"
          description="测量鼠标移动事件的回报率和稳定性"
          icon={MousePointer2}
          testType="mouse-move"
          isActive={isMouseMoveTesting}
          isReady={testStates.mouseMoveTestReady}
          hasResults={mouseMoveEvents.length > 0}
          isOtherTestRunning={testStates.isAnyTesting && !isMouseMoveTesting}
          totalEvents={mouseMoveEvents.length}
          progress={mouseMoveTestProgress}
          remainingTime={Math.ceil((MOUSE_MOVE_TEST_DURATION - (mouseMoveTestProgress * MOUSE_MOVE_TEST_DURATION) / 100) / 1000)}
          onClick={testStates.mouseMoveTestReady && mouseMoveEvents.length === 0 ? handleMouseMoveTestStart : undefined}
          onMouseMove={handleMouseMove}
          onRestart={handleMouseMoveTestStart}
          events={mouseMoveEvents}
          stats={mouseMoveReportRateStats}
          deviceType="mouse"
        />

        {/* Keyboard Test Section */}
        <TestSection
          title="键盘延迟测试"
          description="测量键盘按键延迟，分析响应时间"
          icon={Keyboard}
          testType="keyboard"
          isActive={isKeyboardTesting}
          isReady={testStates.keyboardTestReady}
          isWaiting={waitingForInput}
          hasResults={keyboardResults.length > 0}
          isOtherTestRunning={testStates.isAnyTesting && !isKeyboardTesting}
          currentCount={keyboardTestCount}
          maxCount={KEYBOARD_TEST_COUNT}
          onClick={testStates.keyboardTestReady && keyboardResults.length === 0 ? handleKeyboardRestart : undefined}
          onRestart={handleKeyboardRestart}
          testResults={keyboardResults}
          stats={keyboardStats}
        />

        {/* Keyboard Report Rate Test Section */}
        <ReportRateTestSection
          title="键盘回报率测试"
          description="测量键盘按键事件的回报率和稳定性"
          icon={Keyboard}
          testType="keyboard-report-rate"
          isActive={isKeyboardReportRateTesting}
          isReady={testStates.keyboardReportRateTestReady}
          hasResults={keyboardReportRateEvents.length > 0}
          isOtherTestRunning={testStates.isAnyTesting && !isKeyboardReportRateTesting}
          totalEvents={keyboardReportRateEvents.length}
          progress={keyboardReportRateTestProgress}
          remainingTime={Math.ceil((MOUSE_MOVE_TEST_DURATION - (keyboardReportRateTestProgress * MOUSE_MOVE_TEST_DURATION) / 100) / 1000)}
          onClick={testStates.keyboardReportRateTestReady && keyboardReportRateEvents.length === 0 ? handleKeyboardReportRateTestStart : undefined}
          onRestart={handleKeyboardReportRateTestStart}
          events={keyboardReportRateEvents}
          stats={keyboardMoveReportRateStats}
          deviceType="keyboard"
        />

        {/* 综合性能分析 */}
        <OverallAnalysis
          overallStats={overallStats}
          mouseStats={mouseStats}
          keyboardStats={keyboardStats}
          mouseMoveReportRateStats={mouseMoveReportRateStats}
          keyboardMoveReportRateStats={keyboardMoveReportRateStats}
        />


      </div>
    </div>
  )
}

// 优化的测试区域组件
const TestSection = React.memo(({
  title,
  description,
  icon: Icon,
  testType,
  isActive,
  isReady,
  isWaiting,
  hasResults,
  isOtherTestRunning,
  currentCount,
  maxCount,
  onClick,
  onRestart,
  testResults,
  stats
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  testType: 'mouse' | 'keyboard'
  isActive: boolean
  isReady: boolean
  isWaiting: boolean
  hasResults: boolean
  isOtherTestRunning: boolean
  currentCount?: number
  maxCount?: number
  onClick?: () => void
  onRestart: () => void
  testResults: TestResult[]
  stats: {
    avg: number
    min: number
    max: number
    count: number
  }
}) => (
  <div className="mb-8">
    <Card className="liquid-3d-border backdrop-blur-xl relative overflow-hidden">
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <TestArea
          testType={testType}
          isActive={isActive}
          isReady={isReady}
          isWaiting={isWaiting}
          hasResults={hasResults}
          isOtherTestRunning={isOtherTestRunning}
          currentCount={currentCount}
          maxCount={maxCount}
          onClick={onClick}
        />

        {(isActive || hasResults) && (
          <TestProgress
            testType="response"
            currentCount={isActive ? currentCount : testResults.length}
            maxCount={maxCount}
            isActive={isActive}
            isDisabled={isOtherTestRunning}
            onRestart={onRestart}
          />
        )}

        {hasResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t min-h-[400px]">
            <DeviceChart
              testResults={testResults.slice(testType === 'mouse' ? -30 : -50)}
              deviceType={testType}
            />
            <PerformanceStats
              title={`${testType === 'mouse' ? '鼠标' : '键盘'}延迟统计`}
              stats={stats}
              testResults={testResults}
            />
          </div>
        )}
      </CardContent>
    </Card>
  </div>
))

TestSection.displayName = 'TestSection'

// 优化的回报率测试区域组件
const ReportRateTestSection = React.memo(({
  title,
  description,
  icon: Icon,
  testType,
  isActive,
  isReady,
  hasResults,
  isOtherTestRunning,
  totalEvents,
  progress,
  remainingTime,
  onClick,
  onMouseMove,
  onRestart,
  events,
  stats,
  deviceType
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  testType: 'mouse-move' | 'keyboard-report-rate'
  isActive: boolean
  isReady: boolean
  hasResults: boolean
  isOtherTestRunning: boolean
  totalEvents?: number
  progress?: number
  remainingTime?: number
  onClick?: () => void
  onMouseMove?: (e: React.MouseEvent) => void
  onRestart: () => void
  events: MouseMoveEvent[]
  stats: {
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
  deviceType: 'mouse' | 'keyboard'
}) => (
  <div className="mb-8">
    <Card className="liquid-3d-border backdrop-blur-xl relative overflow-hidden">
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <TestArea
          testType={testType}
          isActive={isActive}
          isReady={isReady}
          isWaiting={isActive}
          hasResults={hasResults}
          isOtherTestRunning={isOtherTestRunning}
          totalEvents={totalEvents}
          remainingTime={remainingTime}
          onClick={onClick}
          onMouseMove={onMouseMove}
          className="h-40"
        />

        {(isActive || hasResults) && (
          <TestProgress
            testType="report-rate"
            progress={isActive ? progress : 100}
            isActive={isActive}
            isDisabled={isOtherTestRunning}
            onRestart={onRestart}
            buttonText={isActive ? '测试进行中...' : '重新测试'}
          />
        )}

        {hasResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t min-h-[400px]">
            <ReportRateChart events={events} deviceType={deviceType} />
            <ReportRateStatsDisplay
              title={`${deviceType === 'mouse' ? '鼠标' : '键盘'}回报率统计`}
              stats={stats}
              deviceType={deviceType}
            />
          </div>
        )}
      </CardContent>
    </Card>
  </div>
))

ReportRateTestSection.displayName = 'ReportRateTestSection'
