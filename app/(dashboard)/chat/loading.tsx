'use client'

import { Loader2 } from 'lucide-react'

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* 채팅방 목록 스켈레톤 */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border border-gray-100 rounded-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 채팅 영역 로딩 */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-primary-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">채팅을 불러오는 중...</p>
        </div>
      </div>
    </div>
  )
}
