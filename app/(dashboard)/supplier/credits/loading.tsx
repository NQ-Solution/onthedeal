'use client'

import { Loader2 } from 'lucide-react'

export default function CreditsLoading() {
  return (
    <div className="p-6">
      {/* 헤더 스켈레톤 */}
      <div className="mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-56 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* 크레딧 잔액 카드 스켈레톤 */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 mb-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-24 bg-white/30 rounded" />
            <div className="h-12 w-48 bg-white/30 rounded" />
          </div>
          <div className="h-12 w-32 bg-white/30 rounded-xl" />
        </div>
      </div>

      {/* 충전/사용 내역 스켈레톤 */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-1">
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 로딩 인디케이터 */}
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    </div>
  )
}
