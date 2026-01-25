'use client'

import { useState, useEffect } from 'react'
import { Search, Check, X, Eye, UserCheck, UserX, Clock, Download, Loader2 } from 'lucide-react'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

interface User {
  id: string
  email: string
  role: string
  companyName: string
  businessNumber?: string
  contactName: string
  phone: string
  address?: string
  approvalStatus: string
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
  _count?: {
    rfqs: number
    buyerOrders: number
    supplierOrders: number
  }
}

interface Stats {
  total: number
  pending: number
  approved: number
  buyers: number
  suppliers: number
}

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
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [statusFilter, roleFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (roleFilter) params.append('role', roleFilter)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchUsers()
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const matchesSearch =
      user.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contactName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleApprove = async (userId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' }),
      })
      if (res.ok) {
        fetchUsers()
        setShowModal(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Failed to approve user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (userId: string) => {
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.')
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reject', rejectionReason: rejectReason }),
      })
      if (res.ok) {
        fetchUsers()
        setShowModal(false)
        setSelectedUser(null)
        setRejectReason('')
      }
    } catch (error) {
      console.error('Failed to reject user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const openUserDetail = (user: User) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

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
                <p className="text-sm text-gray-500">전체 회원</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
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
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pending || 0}</p>
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
                <p className="text-3xl font-bold text-primary-600 mt-1">{stats?.buyers || 0}</p>
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
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.suppliers || 0}</p>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
            <Button variant="outline" className="gap-2" onClick={handleSearch}>
              <Search className="w-4 h-4" />
              검색
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
                  const status = statusConfig[user.approvalStatus as keyof typeof statusConfig]
                  const role = roleLabels[user.role as keyof typeof roleLabels]
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{user.companyName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{user.contactName}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={role?.variant || 'default'}>{role?.label || user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-sm">{user.businessNumber || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={status?.variant || 'default'}>{status?.label || user.approvalStatus}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-600">RFQ: {user._count?.rfqs || 0}건</p>
                          <p className="text-gray-600">주문: {(user._count?.buyerOrders || 0) + (user._count?.supplierOrders || 0)}건</p>
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
                          {user.approvalStatus === 'pending' && (
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
                  <p className="font-bold text-lg">{selectedUser.companyName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">사업자등록번호</p>
                  <p className="font-bold text-lg font-mono">{selectedUser.businessNumber || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">담당자</p>
                  <p className="font-bold text-lg">{selectedUser.contactName}</p>
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
                  <Badge variant={roleLabels[selectedUser.role as keyof typeof roleLabels]?.variant || 'default'} className="text-base">
                    {roleLabels[selectedUser.role as keyof typeof roleLabels]?.label || selectedUser.role}
                  </Badge>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">주소</p>
                  <p className="font-bold text-lg">{selectedUser.address || '-'}</p>
                </div>
              </div>

              {/* 승인 상태 */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-gray-600">현재 상태:</p>
                  <Badge variant={statusConfig[selectedUser.approvalStatus as keyof typeof statusConfig]?.variant || 'default'} className="text-base px-4 py-1">
                    {statusConfig[selectedUser.approvalStatus as keyof typeof statusConfig]?.label || selectedUser.approvalStatus}
                  </Badge>
                </div>

                {selectedUser.approvalStatus === 'rejected' && selectedUser.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
                    <p className="text-red-700">
                      <span className="font-bold">거절 사유:</span> {selectedUser.rejectionReason}
                    </p>
                  </div>
                )}

                {selectedUser.approvalStatus === 'approved' && selectedUser.approvedAt && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-4">
                    <p className="text-green-700">
                      <span className="font-bold">승인일:</span> {formatDate(selectedUser.approvedAt)}
                    </p>
                  </div>
                )}

                {selectedUser.approvalStatus === 'pending' && (
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
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                        승인하기
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(selectedUser.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <X className="w-5 h-5 mr-2" />}
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
