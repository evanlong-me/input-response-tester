'use client'

import React, { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { Mouse, Keyboard, MousePointer2, Activity } from 'lucide-react'
import { PRECISION, preciseRound } from '@/lib/precision-utils'

interface TestResult {
  timestamp: number
  responseTime: number
  testType: 'mouse' | 'keyboard'
}

interface MouseMoveEvent {
  timestamp: number
  x: number
  y: number
}

interface DeviceChartProps {
  testResults: TestResult[]
  deviceType: 'mouse' | 'keyboard'
}

interface ReportRateChartProps {
  events: MouseMoveEvent[]
  deviceType: 'mouse' | 'keyboard'
}

const chartConfig = {
  responseTime: {
    label: '响应延迟',
    color: '#3b82f6' // 蓝色
  }
} satisfies ChartConfig

const reportRateChartConfig = {
  reportRate: {
    label: '回报率',
    color: '#8b5cf6' // 紫色
  },
  interval: {
    label: '时间间隔',
    color: '#10b981' // 绿色
  }
} satisfies ChartConfig

export const DeviceChart = React.memo(({ testResults, deviceType }: DeviceChartProps) => {
  // 创建简单的数据结构
  const chartData = useMemo(() => {
    return testResults.map((result, index) => ({
      test: index + 1,
      responseTime: result.responseTime
    }))
  }, [testResults])

  const deviceInfo = useMemo(() => ({
    mouse: {
      icon: Mouse,
      title: '延迟趋势',
      description: '响应延迟变化趋势'
    },
    keyboard: {
      icon: Keyboard,
      title: '延迟趋势',
      description: '响应延迟变化趋势'
    }
  }), [])

  const DeviceIcon = deviceInfo[deviceType].icon

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center gap-2">
        <DeviceIcon className="w-4 h-4" />
        <h4 className="font-medium">{deviceInfo[deviceType].title}</h4>
      </div>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto flex-1 w-full min-h-[250px]"
      >
        <AreaChart data={chartData}>
          <defs>
            <linearGradient
              id={`fillResponseTime-${deviceType}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="var(--color-responseTime)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-responseTime)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="test"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: number) => `${value}ms`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            dataKey="responseTime"
            type="natural"
            fill={`url(#fillResponseTime-${deviceType})`}
            stroke="var(--color-responseTime)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
})

DeviceChart.displayName = 'DeviceChart'

export const ReportRateChart = React.memo(({ events, deviceType }: ReportRateChartProps) => {
  // 计算回报率数据
  const chartData = useMemo(() => {
    const data = []
    if (events.length > 1) {
      for (let i = 1; i < events.length; i++) {
        const interval = events[i].timestamp - events[i - 1].timestamp
        const reportRate = interval > 0 ? preciseRound(1000 / interval, PRECISION.FREQUENCY) : 0
        data.push({
          index: i,
          reportRate: reportRate,
          interval: preciseRound(interval, PRECISION.TIME),
          time: preciseRound((events[i].timestamp - events[0].timestamp) / 1000, 2) // 2位小数的秒数
        })
      }
    }
    return data
  }, [events])

  const deviceInfo = useMemo(() => ({
    mouse: {
      icon: MousePointer2,
      title: '回报率趋势',
      description: '回报率变化趋势'
    },
    keyboard: {
      icon: Activity,
      title: '回报率趋势',
      description: '回报率变化趋势'
    }
  }), [])

  const DeviceIcon = deviceInfo[deviceType].icon

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center gap-2">
        <DeviceIcon className="w-4 h-4" />
        <h4 className="font-medium">{deviceInfo[deviceType].title}</h4>
      </div>
      <ChartContainer
        config={reportRateChartConfig}
        className="aspect-auto flex-1 w-full min-h-[250px]"
      >
        <LineChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}s`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: number) => `${value}Hz`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Line
            dataKey="reportRate"
            type="monotone"
            stroke="var(--color-reportRate)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
})

ReportRateChart.displayName = 'ReportRateChart'
