'use client'

import React, { useMemo } from 'react'
import { Mouse, Keyboard, MousePointer2, Zap, Timer } from 'lucide-react'

interface TestAreaProps {
  testType: 'mouse' | 'keyboard' | 'mouse-move' | 'keyboard-report-rate'
  isActive: boolean
  isReady: boolean
  isWaiting: boolean
  hasResults: boolean
  isOtherTestRunning: boolean
  currentCount?: number
  maxCount?: number
  totalEvents?: number
  remainingTime?: number
  onClick?: () => void
  onMouseMove?: (e: React.MouseEvent) => void
  tabIndex?: number
  className?: string
}

const testConfig = {
  mouse: {
    icon: Mouse,
    activeIcon: Zap,
    title: '点击开始鼠标延迟测试',
    subtitle: '连续点击30次测量延迟',
    activeTitle: '请快速点击！',
    completedTitle: '鼠标测试完成',
    completedSubtitle: '点击下方按钮重新测试',
    waitingTitle: '准备中...',
    waitingSubtitle: '请稍等',
    otherTestMessage: '其他测试进行中',
    colors: {
      active: 'border-green-400 bg-green-50/50 dark:bg-green-950/10 animate-pulse cursor-pointer',
      ready: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/10 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20',
      completed: 'border-green-400 bg-green-50/50 dark:bg-green-950/10',
      waiting: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
      disabled: 'border-border'
    }
  },
  keyboard: {
    icon: Keyboard,
    activeIcon: Zap,
    title: '点击开始键盘延迟测试',
    subtitle: '连续按键50次测量延迟',
    activeTitle: '请快速按键！',
    completedTitle: '键盘测试完成',
    completedSubtitle: '点击下方按钮重新测试',
    waitingTitle: '准备中...',
    waitingSubtitle: '请稍等',
    otherTestMessage: '其他测试进行中',
    colors: {
      active: 'border-green-400 bg-green-50/50 dark:bg-green-950/10 animate-pulse cursor-pointer',
      ready: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/10 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20',
      completed: 'border-green-400 bg-green-50/50 dark:bg-green-950/10',
      waiting: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
      disabled: 'border-border'
    }
  },
  'mouse-move': {
    icon: MousePointer2,
    activeIcon: MousePointer2,
    title: '点击开始鼠标回报率测试',
    subtitle: '晃动鼠标5秒测量回报率',
    activeTitle: '请快速晃动鼠标！',
    completedTitle: '鼠标回报率测试完成',
    completedSubtitle: '点击下方按钮重新测试',
    waitingTitle: '准备中...',
    waitingSubtitle: '请稍等',
    otherTestMessage: '其他测试进行中',
    colors: {
      active: 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/10 animate-pulse cursor-crosshair',
      ready: 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/10 cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/20',
      completed: 'border-green-400 bg-green-50/50 dark:bg-green-950/10',
      waiting: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
      disabled: 'border-border'
    }
  },
  'keyboard-report-rate': {
    icon: Keyboard,
    activeIcon: Keyboard,
    title: '点击开始键盘回报率测试',
    subtitle: '连续按键5秒测量回报率',
    activeTitle: '请连续按键！',
    completedTitle: '键盘回报率测试完成',
    completedSubtitle: '点击下方按钮重新测试',
    waitingTitle: '准备中...',
    waitingSubtitle: '请稍等',
    otherTestMessage: '其他测试进行中',
    colors: {
      active: 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10 animate-pulse',
      ready: 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10 cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20',
      completed: 'border-green-400 bg-green-50/50 dark:bg-green-950/10',
      waiting: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
      disabled: 'border-border'
    }
  }
}

export const TestArea = React.memo(({
  testType,
  isActive,
  isReady,
  isWaiting,
  hasResults,
  isOtherTestRunning,
  currentCount,
  maxCount,
  totalEvents,
  remainingTime,
  onClick,
  onMouseMove,
  tabIndex,
  className = ''
}: TestAreaProps) => {
  const config = useMemo(() => testConfig[testType], [testType])
  const Icon = config.icon
  const ActiveIcon = config.activeIcon

  const getAreaStyle = useMemo(() => {
    if (isWaiting && isActive) {
      return config.colors.active
    }
    if (isReady && !isActive && !isOtherTestRunning) {
      if (hasResults) {
        return config.colors.completed
      }
      return config.colors.ready
    }
    if (!isReady && !isActive) {
      return config.colors.waiting
    }
    if (isOtherTestRunning) {
      return config.colors.disabled
    }
    return config.colors.disabled
  }, [isWaiting, isActive, isReady, isOtherTestRunning, hasResults, config.colors])

  const renderContent = useMemo(() => {
    // 测试进行中
    if (isWaiting && isActive) {
      return (
        <div className="text-center pointer-events-none">
          <ActiveIcon className={`w-8 h-8 mx-auto mb-2 ${
            testType === 'mouse' || testType === 'keyboard' ? 'text-green-500' :
            testType === 'mouse-move' ? 'text-purple-500 animate-bounce' :
            'text-indigo-500 animate-bounce'
          }`} />
          <p className="text-sm font-medium">{config.activeTitle}</p>
          {(testType === 'mouse' || testType === 'keyboard') && currentCount !== undefined && maxCount && (
            <p className="text-xs text-muted-foreground mt-1">
              测试 {currentCount}/{maxCount}
            </p>
          )}
          {(testType === 'mouse-move' || testType === 'keyboard-report-rate') && (
            <>
              <p className="text-xs text-muted-foreground mt-1">
                {testType === 'mouse-move' 
                  ? `已记录 ${totalEvents || 0} 个事件`
                  : `已记录 ${totalEvents || 0} 个事件`
                }
              </p>
              {remainingTime !== undefined && (
                <p className="text-xs text-muted-foreground">
                  剩余时间: {remainingTime}秒
                </p>
              )}
            </>
          )}
        </div>
      )
    }

    // 准备状态或已完成
    if (isReady && !isActive && !isOtherTestRunning) {
      return (
        <div className="text-center pointer-events-none">
          {hasResults ? (
            <>
              <Icon className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium text-green-600">
                {config.completedTitle}
              </p>
              {(testType === 'mouse-move' || testType === 'keyboard-report-rate') && totalEvents && (
                <p className="text-xs text-muted-foreground mt-1">
                  {testType === 'mouse-move' 
                    ? `记录了 ${totalEvents} 个事件`
                    : `记录了 ${totalEvents} 个事件`
                  }
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {config.completedSubtitle}
              </p>
            </>
          ) : (
            <>
              <Icon className={`w-8 h-8 mx-auto mb-2 ${
                testType === 'mouse' || testType === 'keyboard' ? 'text-blue-500' :
                testType === 'mouse-move' ? 'text-purple-500' :
                'text-indigo-500'
              }`} />
              <p className={`text-sm font-medium ${
                testType === 'mouse' || testType === 'keyboard' ? 'text-blue-600' :
                testType === 'mouse-move' ? 'text-purple-600' :
                'text-indigo-600'
              }`}>
                {config.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {config.subtitle}
              </p>
            </>
          )}
        </div>
      )
    }

    // 等待状态
    if (!isReady && !isActive) {
      return (
        <div className="text-center pointer-events-none">
          <Timer className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm text-amber-600">{config.waitingTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {config.waitingSubtitle}
          </p>
        </div>
      )
    }

    // 其他测试进行中
    if (isOtherTestRunning) {
      return (
        <div className="text-center pointer-events-none">
          <Icon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {config.otherTestMessage}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            请等待当前测试完成
          </p>
        </div>
      )
    }

    return null
  }, [isWaiting, isActive, isReady, isOtherTestRunning, hasResults, testType, currentCount, maxCount, totalEvents, remainingTime, config, Icon, ActiveIcon])

  const height = testType === 'mouse-move' || testType === 'keyboard-report-rate' ? 'h-40' : 'h-32'

  return (
    <div
      className={`
        ${height} rounded-lg border-2 border-dashed flex items-center justify-center transition-all
        select-none user-select-none touch-manipulation outline-none
        ${getAreaStyle}
        ${className}
      `}
      onClick={onClick}
      onMouseMove={onMouseMove}
      tabIndex={tabIndex}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
      draggable={false}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {renderContent}
    </div>
  )
})

TestArea.displayName = 'TestArea' 
