'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, Trash2, MessageSquare, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui'

interface ChatRoom {
  id: string
  rfq: { title: string }
  buyer: { companyName: string }
  supplier: { companyName: string }
  status: string
  expiresAt: string
  createdAt: string
  messages: { content: string; createdAt: string }[]
  _count: { messages: number }
}

interface Stats {
  total: number
  active: number
  dealConfirmed: number
  totalMessages: number
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error' }> = {
  active: { label: '활성', variant: 'success' },
  deal_confirmed: { label: '거래확정', variant: 'success' },
  expired: { label: '만료', variant: 'default' },
  closed: { label: '종료', variant: 'default' },
}

export default function AdminChatsPage() {
  const [loading, setLoading] = useState(true)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchChats()
  }, [statusFilter])

  const fetchChats = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/admin/chats?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setChatRooms(data.chatRooms)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchChats()
  }

  const handleDelete = async (chatId: string) => {
    if (!confirm('정말 삭제하시겠습니까? 모든 채팅 내용이 삭제됩니다.')) return
    try {
      const res = await fetch(`/api/admin/chats?id=${chatId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchChats()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const filteredChats = chatRooms.filter(chat => {
    if (!searchTerm) return true
    return chat.rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.buyer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 whitespace-nowrap">전체 채팅방</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 whitespace-nowrap">활성 채팅</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.active || 0}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 whitespace-nowrap">거래 확정</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{stats?.dealConfirmed || 0}</p>
              </div>
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 whitespace-nowrap">총 메시지</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats?.totalMessages || 0}</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="발주, 구매자, 공급자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12"
                />
              </div>
            </div>
            <Select
              options={[
                { value: '', label: '전체 상태' },
                { value: 'active', label: '활성' },
                { value: 'deal_confirmed', label: '거래확정' },
                { value: 'closed', label: '종료' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40"
            />
            <Button variant="outline" className="gap-2" onClick={handleSearch}>
              <Search className="w-4 h-4" />
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">채팅방</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">구매자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">공급자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">메시지</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">만료일</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredChats.map((chat) => {
                  const status = statusConfig[chat.status] || statusConfig.active
                  const lastMessage = chat.messages[0]
                  return (
                    <tr key={chat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{chat.rfq.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {lastMessage?.content || '메시지 없음'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{chat.buyer.companyName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{chat.supplier.companyName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{chat._count.messages}개</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {chat.status === 'deal_confirmed' ? '영구보관' : new Date(chat.expiresAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedChat(chat); setShowModal(true); }}
                            className="p-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                            onClick={() => handleDelete(chat.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredChats.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">채팅방이 없습니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Detail Modal */}
      {showModal && selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="py-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">채팅방 상세</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">발주</p>
                  <p className="font-bold">{selectedChat.rfq.title}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">상태</p>
                  <Badge variant={statusConfig[selectedChat.status]?.variant || 'default'} className="mt-1">
                    {statusConfig[selectedChat.status]?.label || selectedChat.status}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">구매자</p>
                  <p className="font-bold">{selectedChat.buyer.companyName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">공급자</p>
                  <p className="font-bold">{selectedChat.supplier.companyName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">메시지 수</p>
                  <p className="font-bold text-lg">{selectedChat._count.messages}개</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">만료일</p>
                  <p className="font-bold">
                    {selectedChat.status === 'deal_confirmed' ? '영구보관' : new Date(selectedChat.expiresAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  닫기
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => handleDelete(selectedChat.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  채팅방 삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
