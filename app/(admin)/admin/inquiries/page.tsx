'use client'

import { useState } from 'react'
import { Search, Eye, Trash2, Mail, Clock, CheckCircle, Reply, Download, XCircle } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge, Textarea } from '@/components/ui'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: string
  reply?: string
  replied_at?: string
  created_at: string
}

const mockInquiries: Inquiry[] = [
  {
    id: 'inq1',
    name: '김철수',
    email: 'kim@restaurant.com',
    phone: '010-1234-5678',
    subject: '회원가입 승인 문의',
    message: '회원가입 신청 후 승인이 얼마나 걸리나요? 급하게 식자재가 필요해서요.',
    status: 'pending',
    created_at: '2024-02-10 14:30',
  },
  {
    id: 'inq2',
    name: '이영희',
    email: 'lee@supplier.com',
    phone: '010-2345-6789',
    subject: '수수료 관련 문의',
    message: '거래 수수료가 정확히 어떻게 계산되는지 알고 싶습니다.',
    status: 'replied',
    reply: '안녕하세요. 거래 수수료는 거래 성사 금액의 3%로 계산됩니다. 추가 문의사항 있으시면 말씀해주세요.',
    replied_at: '2024-02-09 10:00',
    created_at: '2024-02-08 16:45',
  },
  {
    id: 'inq3',
    name: '박지민',
    email: 'park@cafe.com',
    phone: '010-3456-7890',
    subject: '결제 관련 문의',
    message: '에스크로 결제 후 환불은 어떻게 처리되나요?',
    status: 'pending',
    created_at: '2024-02-10 09:15',
  },
  {
    id: 'inq4',
    name: '최바다',
    email: 'choi@farm.com',
    phone: '010-4567-8901',
    subject: '채팅 오류 신고',
    message: '채팅 메시지가 전송되지 않는 오류가 있습니다. 확인 부탁드립니다.',
    status: 'in_progress',
    created_at: '2024-02-09 11:30',
  },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'info' }> = {
  pending: { label: '대기', variant: 'warning' },
  in_progress: { label: '처리중', variant: 'info' },
  replied: { label: '답변완료', variant: 'success' },
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState(mockInquiries)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [replyText, setReplyText] = useState('')

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || inquiry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = inquiries.filter(i => i.status === 'pending').length
  const inProgressCount = inquiries.filter(i => i.status === 'in_progress').length
  const repliedCount = inquiries.filter(i => i.status === 'replied').length

  const handleReply = () => {
    if (!replyText.trim()) {
      alert('답변 내용을 입력해주세요.')
      return
    }
    if (selectedInquiry) {
      setInquiries(inquiries.map(i =>
        i.id === selectedInquiry.id
          ? { ...i, status: 'replied', reply: replyText, replied_at: new Date().toISOString() }
          : i
      ))
      setShowModal(false)
      setSelectedInquiry(null)
      setReplyText('')
    }
  }

  const handleDelete = (inquiryId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setInquiries(inquiries.filter(i => i.id !== inquiryId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 문의</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{inquiries.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">대기중</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-200 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">처리중</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Reply className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">답변완료</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{repliedCount}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
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
                  placeholder="이름, 이메일, 제목 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <Select
              options={[
                { value: '', label: '전체 상태' },
                { value: 'pending', label: '대기' },
                { value: 'in_progress', label: '처리중' },
                { value: 'replied', label: '답변완료' },
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

      {/* Inquiry List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">문의자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">제목</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">내용</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">등록일</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInquiries.map((inquiry) => {
                  const status = statusConfig[inquiry.status]
                  return (
                    <tr
                      key={inquiry.id}
                      className={`hover:bg-gray-50 transition-colors ${inquiry.status === 'pending' ? 'bg-yellow-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{inquiry.name}</p>
                        <p className="text-sm text-gray-500">{inquiry.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{inquiry.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 truncate max-w-xs">{inquiry.message}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {inquiry.created_at}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedInquiry(inquiry); setShowModal(true); setReplyText(inquiry.reply || ''); }}
                            className="p-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                            onClick={() => handleDelete(inquiry.id)}
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
            {filteredInquiries.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Detail Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="py-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">문의 상세</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="font-bold">{selectedInquiry.name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">상태</p>
                  <Badge variant={statusConfig[selectedInquiry.status].variant} className="mt-1">
                    {statusConfig[selectedInquiry.status].label}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-bold">{selectedInquiry.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="font-bold">{selectedInquiry.phone}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">제목</p>
                <p className="font-bold text-lg">{selectedInquiry.subject}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">문의 내용</p>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>

              {selectedInquiry.status === 'replied' && selectedInquiry.reply && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-700 font-bold mb-2">답변 내용</p>
                  <p className="text-green-800 whitespace-pre-wrap">{selectedInquiry.reply}</p>
                  <p className="text-sm text-green-600 mt-2">답변일: {selectedInquiry.replied_at}</p>
                </div>
              )}

              {selectedInquiry.status !== 'replied' && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">답변 작성</label>
                  <Textarea
                    placeholder="답변 내용을 입력하세요..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  닫기
                </Button>
                {selectedInquiry.status !== 'replied' && (
                  <Button variant="primary" className="flex-1" onClick={handleReply}>
                    <Reply className="w-4 h-4 mr-2" />
                    답변 보내기
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
