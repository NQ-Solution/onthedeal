'use client'

import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 사이드바 스켈레톤 */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-primary-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">관리자 페이지 로딩 중...</p>
        </div>
      </div>
    </div>
  )
}
