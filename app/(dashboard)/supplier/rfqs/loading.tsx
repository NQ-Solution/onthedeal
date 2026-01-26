'use client'

import { Loader2 } from 'lucide-react'

export default function SupplierRFQsLoading() {
  return (
    <div className="p-6">
      {/* 헤더 스켈레톤 */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-72 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* 필터 스켈레톤 */}
      <div className="flex gap-4 mb-6">
        <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        <div className="flex-1" />
        <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* 카드 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-16 bg-blue-100 rounded-full" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-3/4 bg-gray-100 rounded mb-4" />
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-10 w-full bg-green-200 rounded-lg" />
          </div>
        ))}
      </div>

      {/* 로딩 인디케이터 */}
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    </div>
  )
}
