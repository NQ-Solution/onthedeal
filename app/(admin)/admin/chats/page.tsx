'use client'

import { useState } from 'react'
import { Search, Eye, Trash2, MessageSquare, Clock, CheckCircle, AlertTriangle, Download, XCircle } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui'

interface ChatRoom {
  id: string
  rfq_title: string
  buyer: { company_name: string }
  supplier: { company_name: string }
  message_count: number
  last_message: string
  last_message_at: string
  status: string
  expires_at: string
  created_at: string
}

const mockChats: ChatRoom[] = [
  {
    id: 'chat1',
    rfq_title: '한우 등심 대량 구매',
    buyer: { company_name: '맛있는식당' },
    supplier: { company_name: '프리미엄 한우농장' },
    message_count: 24,
    last_message: '네, 내일 오전 배송 가능합니다.',
    last_message_at: '2024-02-10 14:30',
    status: 'deal_confirmed',
    expires_at: '2024-02-13',
    created_at: '2024-02-08',
  },
  {
    id: 'chat2',
    rfq_title: '돼지고기 삼겹살 납품',
    buyer: { company_name: '고기천국' },
    supplier: { company_name: '돼지농장' },
    message_count: 15,
    last_message: '가격 조정 가능할까요?',
    last_message_at: '2024-02-10 10:15',
    status: 'active',
    expires_at: '2024-02-12',
    created_at: '2024-02-09',
  },
  {
    id: 'chat3',
    rfq_title: '닭고기 냉동 대량',
    buyer: { company_name: '치킨마을' },
    supplier: { company_name: '치킨팜' },
    message_count: 8,
    last_message: '샘플 먼저 보내드릴까요?',
    last_message_at: '2024-02-09 16:45',
    status: 'active',
    expires_at: '2024-02-11',
    created_at: '2024-02-08',
  },
  {
    id: 'chat4',
    rfq_title: '수입 소고기 안심',
    buyer: { company_name: '스테이크하우스' },
    supplier: { company_name: '한우마을' },
    message_count: 3,
    last_message: '안녕하세요, 견적 관련 문의드립니다.',
    last_message_at: '2024-02-08 09:00',
    status: 'closed',
    expires_at: '2024-02-10',
    created_at: '2024-02-07',
  },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error' }> = {
  active: { label: '활성', variant: 'success' },
  deal_confirmed: { label: '거래확정', variant: 'success' },
  closed: { label: '종료', variant: 'default' },
}

export default function AdminChatsPage() {
  const [chats, setChats] = useState(mockChats)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null)
  const [showModal, setShowModal] = useState(false)

  const filteredChats = chats.filter(chat => {
    const matchesSearch =
      chat.rfq_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.buyer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || chat.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeCount = chats.filter(c => c.status === 'active').length
  const confirmedCount = chats.filter(c => c.status === 'deal_confirmed').length
  const totalMessages = chats.reduce((sum, c) => sum + c.message_count, 0)

  const handleDelete = (chatId: string) => {
    if (confirm('정말 삭제하시겠습니까? 모든 채팅 내용이 삭제됩니다.')) {
      setChats(chats.filter(c => c.id !== chatId))
    }
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expires = new Date(expiresAt)
    const now = new Date()
    const diff = expires.getTime() - now.getTime()
    const hours = diff / (1000 * 60 * 60)
    return hours > 0 && hours < 24
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 채팅방</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{chats.length}</p>
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
                <p className="text-sm text-gray-500">활성 채팅</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{activeCount}</p>
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
                <p className="text-sm text-gray-500">거래 확정</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{confirmedCount}</p>
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
                <p className="text-sm text-gray-500">총 메시지</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{totalMessages}</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {chats.some(c => c.status === 'active' && isExpiringSoon(c.expires_at)) && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <p className="text-yellow-800">
                <span className="font-bold">주의:</span> 24시간 내 만료되는 채팅방이 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="RFQ, 구매자, 공급자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              내보내기
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
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">채팅방</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">구매자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">공급자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">메시지</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">만료일</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredChats.map((chat) => {
                  const status = statusConfig[chat.status]
                  const expiringSoon = chat.status === 'active' && isExpiringSoon(chat.expires_at)
                  return (
                    <tr key={chat.id} className={`hover:bg-gray-50 transition-colors ${expiringSoon ? 'bg-yellow-50' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{chat.rfq_title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{chat.last_message}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{chat.buyer.company_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{chat.supplier.company_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{chat.message_count}개</p>
                        <p className="text-sm text-gray-500">{chat.last_message_at}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {expiringSoon && (
                          <Badge variant="warning" className="ml-2">만료임박</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {chat.status === 'deal_confirmed' ? (
                          <span className="text-green-600 font-medium">영구보관</span>
                        ) : (
                          chat.expires_at
                        )}
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
                <p className="text-lg">검색 결과가 없습니다</p>
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
                  <p className="text-sm text-gray-500">RFQ</p>
                  <p className="font-bold">{selectedChat.rfq_title}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">상태</p>
                  <Badge variant={statusConfig[selectedChat.status].variant} className="mt-1">
                    {statusConfig[selectedChat.status].label}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">구매자</p>
                  <p className="font-bold">{selectedChat.buyer.company_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">공급자</p>
                  <p className="font-bold">{selectedChat.supplier.company_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">메시지 수</p>
                  <p className="font-bold text-lg">{selectedChat.message_count}개</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">만료일</p>
                  <p className="font-bold">
                    {selectedChat.status === 'deal_confirmed' ? '영구보관' : selectedChat.expires_at}
                  </p>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">마지막 메시지</p>
                  <p className="font-bold">{selectedChat.last_message}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedChat.last_message_at}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  닫기
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => { handleDelete(selectedChat.id); setShowModal(false); }}
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
