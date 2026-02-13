'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, Trash2, Mail, Clock, CheckCircle, Reply, Loader2, XCircle } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge, Textarea } from '@/components/ui'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: string
  response: string | null
  respondedAt: string | null
  createdAt: string
}

interface Stats {
  total: number
  pending: number
  inProgress: number
  resolved: number
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'info' }> = {
  pending: { label: '대기', variant: 'warning' },
  in_progress: { label: '처리중', variant: 'info' },
  resolved: { label: '답변완료', variant: 'success' },
  closed: { label: '종료', variant: 'default' },
}

export default function AdminInquiriesPage() {
  const [loading, setLoading] = useState(true)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchInquiries()
  }, [statusFilter])

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setInquiries(data.inquiries)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchInquiries()
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedInquiry) {
      alert('답변 내용을 입력해주세요.')
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId: selectedInquiry.id, response: replyText }),
      })
      if (res.ok) {
        fetchInquiries()
        setShowModal(false)
        setSelectedInquiry(null)
        setReplyText('')
      }
    } catch (error) {
      console.error('Failed to reply:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (inquiryId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      const res = await fetch(`/api/admin/inquiries?id=${inquiryId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchInquiries()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Failed to delete inquiry:', error)
    }
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    if (!searchTerm) return true
    return inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
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
                <p className="text-sm text-gray-500 whitespace-nowrap">전체 문의</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
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
                <p className="text-sm text-yellow-700 whitespace-nowrap">대기중</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pending || 0}</p>
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
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats?.inProgress || 0}</p>
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
                <p className="text-sm text-gray-500 whitespace-nowrap">답변완료</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.resolved || 0}</p>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12"
                />
              </div>
            </div>
            <Select
              options={[
                { value: '', label: '전체 상태' },
                { value: 'pending', label: '대기' },
                { value: 'in_progress', label: '처리중' },
                { value: 'resolved', label: '답변완료' },
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

      {/* Inquiry List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">문의자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">제목</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">내용</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap">등록일</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInquiries.map((inquiry) => {
                  const status = statusConfig[inquiry.status] || statusConfig.pending
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
                        {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedInquiry(inquiry); setShowModal(true); setReplyText(inquiry.response || ''); }}
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
                <p className="text-lg">문의가 없습니다</p>
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
                  <Badge variant={statusConfig[selectedInquiry.status]?.variant || 'default'} className="mt-1">
                    {statusConfig[selectedInquiry.status]?.label || selectedInquiry.status}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-bold">{selectedInquiry.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="font-bold">{selectedInquiry.phone || '-'}</p>
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

              {selectedInquiry.status === 'resolved' && selectedInquiry.response && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-700 font-bold mb-2">답변 내용</p>
                  <p className="text-green-800 whitespace-pre-wrap">{selectedInquiry.response}</p>
                  {selectedInquiry.respondedAt && (
                    <p className="text-sm text-green-600 mt-2">답변일: {new Date(selectedInquiry.respondedAt).toLocaleDateString('ko-KR')}</p>
                  )}
                </div>
              )}

              {selectedInquiry.status !== 'resolved' && (
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
                {selectedInquiry.status !== 'resolved' && (
                  <Button variant="primary" className="flex-1" onClick={handleReply} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Reply className="w-4 h-4 mr-2" />}
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
