import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { DeviceChart } from '@/components/device-chart'
import { TestArea } from '@/components/test-area'
import { TestProgress } from '@/components/test-progress'
import { PerformanceStats } from '@/components/performance-stats'

interface TestResult {
  timestamp: number
  responseTime: number
  testType: 'mouse' | 'keyboard'
}

interface TestSectionProps {
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
}

export const TestSection = React.memo(
  ({
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
  }: TestSectionProps) => (
    <div className="mb-8">
      <Card className="backdrop-blur bg-white/5 border border-white/10">
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="w-4 h-4" />
            {title}
          </CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
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
                testResults={testResults.slice(
                  testType === 'mouse' ? -30 : -50
                )}
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
  )
)

TestSection.displayName = 'TestSection'
