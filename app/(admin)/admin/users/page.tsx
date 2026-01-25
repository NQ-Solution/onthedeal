'use client'

import { useState } from 'react'
import { Search, Check, X, Eye, Filter, UserCheck, UserX, Clock, MoreVertical, Download, Trash2 } from 'lucide-react'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { mockAllUsers, mockPendingUsers } from '@/lib/mock-data'

interface User {
  id: string
  email: string
  role: string
  company_name: string
  business_number?: string
  contact_name: string
  phone: string
  address?: string
  approval_status: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  rfq_count?: number
  order_count?: number
}

// 중앙 mock 데이터 + pending 유저 통합
const allUsers: User[] = [
  ...mockAllUsers.map(u => ({
    ...u,
    business_number: u.business_number || '',
    address: u.address || '',
    rfq_count: u.role === 'buyer' ? 3 : 0,
    order_count: u.role === 'supplier' ? 5 : 2,
  })),
  ...mockPendingUsers.map(u => ({
    ...u,
    business_number: u.business_number || '',
    address: u.address || '',
    rfq_count: 0,
    order_count: 0,
  })),
]

const statusConfig = {
  pending: { label: '대기중', variant: 'warning' as const, icon: Clock },
  approved: { label: '승인됨', variant: 'success' as const, icon: UserCheck },
  rejected: { label: '거절됨', variant: 'error' as const, icon: UserX },
}

const roleLabels = {
  buyer: { label: '구매자', variant: 'info' as const },
  supplier: { label: '공급자', variant: 'success' as const },
  admin: { label: '관리자', variant: 'error' as const },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState(allUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || user.approval_status === statusFilter
    const matchesRole = !roleFilter || user.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const pendingCount = users.filter(u => u.approval_status === 'pending').length
  const approvedCount = users.filter(u => u.approval_status === 'approved').length
  const buyerCount = users.filter(u => u.role === 'buyer').length
  const supplierCount = users.filter(u => u.role === 'supplier').length

  const handleApprove = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, approval_status: 'approved', approved_at: new Date().toISOString() }
        : u
    ))
    setShowModal(false)
    setSelectedUser(null)
  }

  const handleReject = (userId: string) => {
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.')
      return
    }
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, approval_status: 'rejected', rejection_reason: rejectReason }
        : u
    ))
    setShowModal(false)
    setSelectedUser(null)
    setRejectReason('')
  }

  const openUserDetail = (user: User) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 회원</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">승인 대기</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">구매자</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{buyerCount}</p>
              </div>
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">공급자</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{supplierCount}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="회사명, 이메일, 담당자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <Select
              options={[
                { value: '', label: '전체 상태' },
                { value: 'pending', label: '대기중' },
                { value: 'approved', label: '승인됨' },
                { value: 'rejected', label: '거절됨' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40"
            />
            <Select
              options={[
                { value: '', label: '전체 역할' },
                { value: 'buyer', label: '구매자' },
                { value: 'supplier', label: '공급자' },
              ]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-40"
            />
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">회사 정보</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">담당자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">역할</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">사업자번호</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">활동</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const status = statusConfig[user.approval_status as keyof typeof statusConfig]
                  const role = roleLabels[user.role as keyof typeof roleLabels]
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{user.company_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{user.contact_name}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={role.variant}>{role.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-sm">{user.business_number}</td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-600">RFQ: {user.rfq_count || 0}건</p>
                          <p className="text-gray-600">주문: {user.order_count || 0}건</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUserDetail(user)}
                            className="p-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.approval_status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
                                onClick={() => handleApprove(user.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                onClick={() => openUserDetail(user)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <UserX className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>회원 상세 정보</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="py-6 space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">회사명</p>
                  <p className="font-bold text-lg">{selectedUser.company_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">사업자등록번호</p>
                  <p className="font-bold text-lg font-mono">{selectedUser.business_number}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">담당자</p>
                  <p className="font-bold text-lg">{selectedUser.contact_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">연락처</p>
                  <p className="font-bold text-lg">{selectedUser.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">이메일</p>
                  <p className="font-bold text-lg">{selectedUser.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">역할</p>
                  <Badge variant={roleLabels[selectedUser.role as keyof typeof roleLabels].variant} className="text-base">
                    {roleLabels[selectedUser.role as keyof typeof roleLabels].label}
                  </Badge>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">주소</p>
                  <p className="font-bold text-lg">{selectedUser.address}</p>
                </div>
              </div>

              {/* 승인 상태 */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-gray-600">현재 상태:</p>
                  <Badge variant={statusConfig[selectedUser.approval_status as keyof typeof statusConfig].variant} className="text-base px-4 py-1">
                    {statusConfig[selectedUser.approval_status as keyof typeof statusConfig].label}
                  </Badge>
                </div>

                {selectedUser.approval_status === 'rejected' && selectedUser.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
                    <p className="text-red-700">
                      <span className="font-bold">거절 사유:</span> {selectedUser.rejection_reason}
                    </p>
                  </div>
                )}

                {selectedUser.approval_status === 'approved' && selectedUser.approved_at && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-4">
                    <p className="text-green-700">
                      <span className="font-bold">승인일:</span> {new Date(selectedUser.approved_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                )}

                {selectedUser.approval_status === 'pending' && (
                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        거절 사유 (거절 시 필수)
                      </label>
                      <Input
                        placeholder="거절 사유를 입력하세요..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(selectedUser.id)}
                      >
                        <Check className="w-5 h-5 mr-2" />
                        승인하기
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(selectedUser.id)}
                      >
                        <X className="w-5 h-5 mr-2" />
                        거절하기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
