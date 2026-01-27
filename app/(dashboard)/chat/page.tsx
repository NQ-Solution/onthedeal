'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge, Button } from '@/components/ui'
import { MessageSquare, Clock, AlertTriangle, CheckCircle, Eye, Loader2 } from 'lucide-react'

interface ChatRoom {
  id: string
  status: string
  createdAt: string
  expiresAt: string
  dealConfirmedAt: string | null
  rfq: {
    id: string
    title: string
    category: string
  } | null
  quote: {
    id: string
    totalPrice: number
  } | null
  buyer: {
    id: string
    companyName: string
  } | null
  supplier: {
    id: string
    companyName: string
  } | null
  lastMessage: {
    content: string
    createdAt: string
    isRead: boolean
    senderId: string
  } | null
  unreadCount: number
}

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR')
}

function getTimeRemaining(expiresAt: string | null): { text: string; isUrgent: boolean } {
  if (!expiresAt) return { text: '', isUrgent: false }

  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires.getTime() - now.getTime()

  if (diffMs <= 0) return { text: '만료됨', isUrgent: true }

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return { text: `${days}일 ${hours % 24}시간 남음`, isUrgent: days < 1 }
  }
  return { text: `${hours}시간 남음`, isUrgent: true }
}

export default function ChatListPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'confirmed'>('all')

  useEffect(() => {
    fetchChatRooms()
  }, [])

  const fetchChatRooms = async () => {
    try {
      const res = await fetch('/api/chat/rooms')
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter(room => {
    if (filter === 'all') return true
    if (filter === 'active') return room.status === 'active'
    if (filter === 'confirmed') return room.status === 'deal_confirmed'
    return true
  })

  const activeCount = rooms.filter(r => r.status === 'active').length
  const confirmedCount = rooms.filter(r => r.status === 'deal_confirmed').length
  const totalUnread = rooms.reduce((sum, r) => sum + r.unreadCount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">채팅</h1>
        <p className="text-lg text-gray-500 mt-1">공급자/구매자와 실시간으로 소통하세요</p>
      </div>

      {/* 만료 경고 배너 */}
      {rooms.some(r => r.status === 'active' && r.expiresAt && getTimeRemaining(r.expiresAt).isUrgent) && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-yellow-800">채팅방 만료 예정</h3>
              <p className="text-lg text-yellow-700 mt-1">
                일부 채팅방이 곧 만료됩니다. 거래를 확정하지 않으면 채팅 내용이 삭제됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 벤토 그리드 - 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`hover:shadow-lg transition-all cursor-pointer ${filter === 'active' ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => setFilter(filter === 'active' ? 'all' : 'active')}
        >
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">진행중</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">{activeCount}</p>
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`hover:shadow-lg transition-all cursor-pointer ${filter === 'confirmed' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setFilter(filter === 'confirmed' ? 'all' : 'confirmed')}
        >
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">딜 확정</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{confirmedCount}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">안 읽은 메시지</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{totalUnread}</p>
              </div>
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <Eye className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 채팅 목록 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">채팅 목록</h2>
          {filter !== 'all' && (
            <Button variant="outline" size="md" onClick={() => setFilter('all')}>
              전체 보기
            </Button>
          )}
        </div>

        {filteredRooms.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">진행 중인 채팅이 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRooms.map((room) => {
              const timeRemaining = room.status === 'active' ? getTimeRemaining(room.expiresAt) : null

              return (
                <Link key={room.id} href={room.status !== 'expired' ? `/chat/${room.id}` : '#'}>
                  <Card className={`hover:shadow-xl transition-all cursor-pointer ${
                    room.status === 'expired' ? 'opacity-60' : ''
                  } ${room.unreadCount > 0 ? 'border-l-4 border-l-primary-500' : ''}`}>
                    <CardContent className="py-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* 상태 및 만료 시간 */}
                          <div className="flex items-center gap-3 mb-3">
                            <Badge
                              variant={
                                room.status === 'deal_confirmed' ? 'success' :
                                room.status === 'expired' ? 'error' : 'default'
                              }
                              className="text-base px-4 py-2"
                            >
                              {room.status === 'deal_confirmed' ? '딜 확정' :
                               room.status === 'expired' ? '만료됨' : '진행중'}
                            </Badge>
                            {timeRemaining && (
                              <span className={`flex items-center gap-1 text-base ${
                                timeRemaining.isUrgent ? 'text-red-600 font-bold' : 'text-gray-500'
                              }`}>
                                <Clock className="w-5 h-5" />
                                {timeRemaining.text}
                              </span>
                            )}
                            {room.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                {room.unreadCount}
                              </span>
                            )}
                          </div>

                          {/* 제목 */}
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.rfq?.title}</h3>

                          {/* 참여자 */}
                          <p className="text-lg text-gray-600 mb-2">
                            {room.buyer?.companyName} ↔ {room.supplier?.companyName}
                          </p>

                          {/* 마지막 메시지 */}
                          {room.lastMessage && (
                            <p className="text-base text-gray-500 truncate">
                              {room.lastMessage.content}
                            </p>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <p className="text-base text-gray-400">
                            {formatRelativeTime(room.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* 만료 경고 */}
                      {room.status === 'active' && timeRemaining?.isUrgent && (
                        <div className="mt-4 pt-4 border-t-2 border-gray-100">
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-base font-medium">
                              거래를 확정하지 않으면 {timeRemaining.text} 후 채팅 내용이 삭제됩니다
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* 안내 문구 */}
      <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <Clock className="w-8 h-8 text-gray-400 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-gray-700">채팅 만료 안내</h4>
              <p className="text-base text-gray-600 mt-1">
                채팅 시작 후 3일 이내에 거래를 확정하지 않으면 모든 채팅 내용이 자동 삭제됩니다.
                원활한 거래를 위해 빠른 협의를 권장합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
