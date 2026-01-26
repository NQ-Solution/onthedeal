'use client'

import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 바 스켈레톤 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-primary-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    </div>
  )
}
