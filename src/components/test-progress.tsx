'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface TestProgressProps {
  testType: 'response' | 'report-rate'
  currentCount?: number
  maxCount?: number
  progress?: number
  isActive: boolean
  isDisabled: boolean
  onRestart: () => void
  buttonText?: string
}

export function TestProgress({
  testType,
  currentCount,
  maxCount,
  progress,
  isActive,
  isDisabled,
  onRestart,
  buttonText
}: TestProgressProps) {
  const getProgressValue = () => {
    if (testType === 'response' && currentCount !== undefined && maxCount) {
      return isActive ? (currentCount / maxCount) * 100 : 100
    }
    if (testType === 'report-rate' && progress !== undefined) {
      return isActive ? progress : 100
    }
    return 0
  }

  const getProgressText = () => {
    if (testType === 'response' && currentCount !== undefined && maxCount) {
      return `${isActive ? currentCount : maxCount}/${maxCount}`
    }
    if (testType === 'report-rate' && progress !== undefined) {
      return `${isActive ? Math.round(progress) : 100}%`
    }
    return '0/0'
  }

  const getProgressColor = () => {
    if (!isActive) {
      return '[&>[data-slot=progress-indicator]]:bg-green-400'
    }
    if (testType === 'report-rate') {
      return '[&>[data-slot=progress-indicator]]:bg-purple-400'
    }
    return ''
  }

  const getButtonText = () => {
    if (buttonText) return buttonText
    return '重新测试'
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>测试进度</span>
          <span>{getProgressText()}</span>
        </div>
        <Progress
          value={getProgressValue()}
          className={`w-full ${getProgressColor()}`}
        />
      </div>
      <Button
        onClick={onRestart}
        disabled={isDisabled}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700"
        variant="default"
      >
        {getButtonText()}
      </Button>
    </div>
  )
} 
