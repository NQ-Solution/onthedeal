'use client'

import { Loader2 } from 'lucide-react'

export default function ProfileLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 헤더 스켈레톤 */}
      <div className="mb-8">
        <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* 프로필 카드 스켈레톤 */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-16 bg-blue-100 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* 로딩 인디케이터 */}
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    </div>
  )
}
