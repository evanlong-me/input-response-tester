import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ReportRateChart } from '@/components/device-chart'
import { TestArea } from '@/components/test-area'
import { TestProgress } from '@/components/test-progress'
import { ReportRateStatsDisplay } from '@/components/report-rate-stats'

interface MouseMoveEvent {
  timestamp: number
  x: number
  y: number
}

interface ReportRateTestSectionProps {
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
}

export const ReportRateTestSection = React.memo(({
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
}: ReportRateTestSectionProps) => (
  <div className="mb-8">
    <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
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
