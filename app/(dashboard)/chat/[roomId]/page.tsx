'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// 개별 채팅방 URL은 메인 채팅 페이지로 리다이렉트
// 채팅 페이지에서 해당 채팅방을 자동 선택
export default function ChatRoomRedirect() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params.roomId) {
      // 채팅 메인 페이지로 리다이렉트하면서 roomId를 쿼리로 전달
      router.replace(`/chat?room=${params.roomId}`)
    }
  }, [params.roomId, router])

  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  )
}
