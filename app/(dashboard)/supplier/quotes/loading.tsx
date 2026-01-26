'use client'

import { Loader2 } from 'lucide-react'

export default function SupplierQuotesLoading() {
  return (
    <div className="p-6">
      {/* 헤더 스켈레톤 */}
      <div className="mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-56 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* 제안 목록 스켈레톤 */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
              </div>
              <div className="h-8 w-20 bg-blue-100 rounded-full" />
            </div>
            <div className="grid grid-cols-4 gap-4 py-4 border-t border-gray-100">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 w-14 bg-gray-100 rounded" />
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <div className="h-10 w-28 bg-gray-200 rounded-lg" />
            </div>
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
