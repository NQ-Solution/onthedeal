'use client'

import { useState, useEffect } from 'react'

export default function DashboardLoading() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex flex-col">
      {/* 상단 바 스켈레톤 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse" />
            <div className="h-10 w-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {/* 로고 애니메이션 */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 animate-pulse">
              <span className="text-white font-bold text-3xl">OD</span>
            </div>
            {/* 회전하는 링 */}
            <div className="absolute inset-0 w-32 h-32 mx-auto -mt-4 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
          </div>

          {/* 프로그레스 바 */}
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 텍스트 */}
          <p className="text-gray-700 font-semibold text-lg mb-1">OnTheDeal</p>
          <p className="text-gray-500 text-sm">잠시만 기다려 주세요...</p>
        </div>
      </div>

      {/* 하단 장식 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-orange-500 to-primary-500 animate-pulse" />
    </div>
  )
}
