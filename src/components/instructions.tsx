'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function Instructions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>使用说明</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">🖱️ 鼠标测试</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>延迟测试：</strong>连续点击20次测量延迟
              </p>
              <p>
                <strong>回报率测试：</strong>晃动鼠标5秒测量回报率
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">⌨️ 键盘测试</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>延迟测试：</strong>连续按键20次测量延迟
              </p>
              <p>
                <strong>回报率测试：</strong>连续按键5秒测量回报率
              </p>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">💡 注意事项</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>看到提示后快速响应</li>
            <li>重新测试会清除之前数据</li>
            <li>有线连接性能通常更好</li>
            <li>建议多次测试获得准确结果</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 
