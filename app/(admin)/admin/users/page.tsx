'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Check, X, Eye, UserCheck, UserX, Clock, Download, Loader2, Ban } from 'lucide-react'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

interface User {
  id: string
  email: string
  role: string
  // 사업자 정보
  companyName: string
  businessNumber?: string
  representativeName?: string
  businessType?: string
  businessCategory?: string
  // 담당자 정보
  contactName: string
  phone: string
  fax?: string
  // 주소 정보
  postalCode?: string
  storeAddress?: string
  storeDetailAddress?: string
  address?: string
  // 추가 정보
  website?: string
  introduction?: string
  // 이미지
  profileImage?: string
  businessLicenseImage?: string
  storeImages?: string[]
  // 승인 상태
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
  suspended: { label: '정지됨', variant: 'error' as const, icon: Ban },
}

const roleLabels = {
  buyer: { label: '구매자', variant: 'info' as const },
  supplier: { label: '판매자', variant: 'success' as const },
  admin: { label: '관리자', variant: 'error' as const },
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
    // 10초마다 새 회원가입 확인 (실시간 업데이트)
    const interval = setInterval(fetchUsers, 10000)
    return () => clearInterval(interval)
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
      }
    } catch (error) {
      console.error('Failed to approve user:', error)
    } finally {
      setActionLoading(false)
    }
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

  // 승인 대기 중인 회원만 필터
  const pendingUsers = users.filter(u => u.approvalStatus === 'pending')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>
      </div>

      {/* 승인 대기 회원 섹션 */}
      {pendingUsers.length > 0 && (
        <Card className="shadow-lg border-2 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center animate-pulse">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              승인 대기 중인 회원
              <Badge variant="warning" className="ml-2 text-lg px-3 py-1">{pendingUsers.length}명</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((user) => {
                const role = roleLabels[user.role as keyof typeof roleLabels]
                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl p-4 border-2 border-yellow-200 hover:border-yellow-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-bold text-lg text-gray-900">{user.companyName}</p>
                          <Badge variant={role?.variant || 'default'}>{role?.label}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p className="text-gray-600">
                            <span className="text-gray-500">이메일:</span> {user.email}
                          </p>
                          <p className="text-gray-600">
                            <span className="text-gray-500">담당자:</span> {user.contactName}
                          </p>
                          <p className="text-gray-600">
                            <span className="text-gray-500">연락처:</span> {user.phone}
                          </p>
                          <p className="text-gray-600">
                            <span className="text-gray-500">사업자번호:</span> {user.businessNumber || '-'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          가입일: {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        {/* 사업자등록증 미리보기 */}
                        {user.businessLicenseImage ? (
                          <Link href={`/admin/users/${user.id}`} className="flex-shrink-0">
                            <img
                              src={user.businessLicenseImage}
                              alt="사업자등록증"
                              className="w-24 h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-primary-400 transition-colors cursor-pointer"
                            />
                            <p className="text-xs text-center text-gray-500 mt-1">클릭하여 확대</p>
                          </Link>
                        ) : (
                          <div className="w-24 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                            <p className="text-xs text-gray-400 text-center px-2">사업자등록증<br/>미등록</p>
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button size="sm" variant="outline" className="w-full">
                              <Eye className="w-4 h-4 mr-1" />
                              상세보기
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 w-full"
                            onClick={() => handleApprove(user.id)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                승인
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                  <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">사업자등록증</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">회사 정보</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">담당자</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">역할</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">사업자번호</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">상태</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">활동</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const status = statusConfig[user.approvalStatus as keyof typeof statusConfig]
                  const role = roleLabels[user.role as keyof typeof roleLabels]
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/admin/users/${user.id}`}
                    >
                      <td className="px-4 py-3 text-center">
                        {user.businessLicenseImage ? (
                          <Link href={`/admin/users/${user.id}`}>
                            <img
                              src={user.businessLicenseImage}
                              alt="사업자등록증"
                              className="w-12 h-16 object-cover rounded border border-gray-200 hover:border-primary-400 transition-colors mx-auto"
                            />
                          </Link>
                        ) : (
                          <div className="w-12 h-16 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center mx-auto">
                            <span className="text-xs text-gray-400">없음</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-gray-900">{user.companyName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-900">{user.contactName}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={role?.variant || 'default'}>{role?.label || user.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-sm">{user.businessNumber || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status?.variant || 'default'}>{status?.label || user.approvalStatus}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-gray-600">RFQ: {user._count?.rfqs || 0}건</p>
                          <p className="text-gray-600">주문: {(user._count?.buyerOrders || 0) + (user._count?.supplierOrders || 0)}건</p>
                        </div>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
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
                              <Link href={`/admin/users/${user.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </Link>
                            </>
                          )}
                          {user.approvalStatus === 'approved' && (
                            <Link href={`/admin/users/${user.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2"
                                title="정지하기"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            </Link>
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

    </div>
  )
}
