'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  FileText,
  Receipt,
  Package,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Coins,
  XCircle
} from 'lucide-react'
import { Card, CardContent, Badge, Button } from '@/components/ui'

interface Stats {
  totalUsers: number
  pendingUsers: number
  buyerCount: number
  supplierCount: number
  newUsersToday: number
  totalRFQs: number
  openRFQs: number
  totalQuotes: number
  totalOrders: number
  completedOrders: number
  pendingInquiries: number
}

interface PendingApproval {
  id: string
  companyName: string
  role: string
  createdAt: string
}

interface RecentActivity {
  id: string
  type: 'user' | 'rfq'
  title: string
  status: string
  createdAt: string
}

interface ChargeRequest {
  id: string
  supplierId: string
  amount: number
  status: string
  paymentMethod: string | null
  createdAt: string
  supplier: {
    id: string
    email: string
    companyName: string
    contactName: string
    credit: { balance: number } | null
  } | null
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [chargeRequests, setChargeRequests] = useState<ChargeRequest[]>([])
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    fetchChargeRequests()
    // 10초마다 실시간 업데이트
    const interval = setInterval(() => {
      fetchData()
      fetchChargeRequests()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setPendingApprovals(data.pendingApprovals || [])

        // 최근 활동 구성
        const activities: RecentActivity[] = []
        data.recentUsers?.forEach((u: any) => {
          activities.push({
            id: u.id,
            type: 'user',
            title: `새로운 회원가입: ${u.companyName}`,
            status: u.approvalStatus,
            createdAt: u.createdAt,
          })
        })
        data.recentRFQs?.forEach((r: any) => {
          activities.push({
            id: r.id,
            type: 'rfq',
            title: `새로운 발주: ${r.title}`,
            status: r.status,
            createdAt: r.createdAt,
          })
        })
        // 시간순 정렬
        activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setRecentActivities(activities.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChargeRequests = async () => {
    try {
      const res = await fetch('/api/admin/credits/requests')
      if (res.ok) {
        const data = await res.json()
        setChargeRequests(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch charge requests:', error)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' }),
      })
      if (res.ok) {
        fetchData() // 새로고침
      }
    } catch (error) {
      console.error('Failed to approve user:', error)
    }
  }

  const handleApproveCharge = async (requestId: string) => {
    if (!confirm('이 충전 요청을 승인하시겠습니까?')) return

    setProcessingRequestId(requestId)
    try {
      const res = await fetch('/api/admin/credits/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'approve' }),
      })

      if (res.ok) {
        alert('충전이 승인되었습니다.')
        fetchData()
        fetchChargeRequests()
      } else {
        const data = await res.json()
        alert(data.error || '승인에 실패했습니다.')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setProcessingRequestId(null)
    }
  }

  const handleRejectCharge = async (requestId: string) => {
    const note = prompt('반려 사유를 입력해주세요 (선택사항):')
    if (note === null) return

    setProcessingRequestId(requestId)
    try {
      const res = await fetch('/api/admin/credits/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject', note }),
      })

      if (res.ok) {
        alert('요청이 반려되었습니다.')
        fetchChargeRequests()
      } else {
        const data = await res.json()
        alert(data.error || '반려에 실패했습니다.')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setProcessingRequestId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium whitespace-nowrap">전체 회원</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  오늘 +{stats?.newUsersToday || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active RFQs */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium whitespace-nowrap">활성 발주</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.openRFQs || 0}</p>
                <p className="text-sm text-primary-600 flex items-center gap-1 mt-2">
                  <FileText className="w-4 h-4" />
                  제안 {stats?.totalQuotes || 0}건
                </p>
              </div>
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium whitespace-nowrap">완료된 주문</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.completedOrders || 0}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                  <CheckCircle className="w-4 h-4" />
                  전체 {stats?.totalOrders || 0}건
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium whitespace-nowrap">승인 대기</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pendingUsers || 0}</p>
                <p className="text-sm text-yellow-600 flex items-center gap-1 mt-2">
                  <Clock className="w-4 h-4" />
                  처리 필요
                </p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 대기 중인 충전 요청 */}
      {chargeRequests.length > 0 && (
        <Card className="shadow-lg border-2 border-orange-300 bg-orange-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center animate-pulse">
                <Coins className="w-6 h-6 text-orange-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 whitespace-nowrap">크레딧 충전 요청</h3>
                <p className="text-sm text-orange-700 break-keep">{chargeRequests.length}건의 충전 요청 대기 중</p>
              </div>
              <Link href="/admin/credits" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                전체 보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {chargeRequests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl p-4 border-2 border-orange-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-900">{req.supplier?.companyName || '알 수 없음'}</p>
                    <p className="text-sm text-gray-500">{formatDate(req.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-orange-600">
                      {req.amount.toLocaleString()}원
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 px-2"
                        onClick={() => handleRejectCharge(req.id)}
                        disabled={processingRequestId === req.id}
                      >
                        {processingRequestId === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 px-2"
                        onClick={() => handleApproveCharge(req.id)}
                        disabled={processingRequestId === req.id}
                      >
                        {processingRequestId === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Cards */}
      {((stats?.pendingUsers || 0) > 0 || (stats?.pendingInquiries || 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(stats?.pendingUsers || 0) > 0 && (
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="py-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 whitespace-nowrap">승인 대기</h3>
                    <p className="text-sm text-yellow-700 break-keep">{stats?.pendingUsers || 0}건의 회원가입 승인 대기 중</p>
                  </div>
                </div>
                <Link href="/admin/users?filter=pending" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  바로가기 <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          )}

          {(stats?.pendingInquiries || 0) > 0 && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="py-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 whitespace-nowrap">미답변 문의</h3>
                    <p className="text-sm text-blue-700 break-keep">{stats?.pendingInquiries || 0}건의 문의가 답변 대기 중</p>
                  </div>
                </div>
                <Link href="/admin/inquiries" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  바로가기 <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">최근 활동</h2>
              </div>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'user' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {activity.type === 'user' ? (
                          <Users className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                      </div>
                      <Badge variant={
                        activity.status === 'approved' || activity.status === 'open' ? 'success' :
                        activity.status === 'pending' ? 'warning' : 'info'
                      }>
                        {activity.status === 'approved' ? '승인됨' :
                         activity.status === 'pending' ? '대기' :
                         activity.status === 'open' ? '모집중' : activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  최근 활동이 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals List */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">승인 대기 회원</h2>
              <Link href="/admin/users?filter=pending" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                전체 보기
              </Link>
            </div>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((user) => (
                  <div key={user.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-gray-900">{user.companyName}</p>
                      <Badge variant={user.role === 'buyer' ? 'info' : 'success'}>
                        {user.role === 'buyer' ? '구매자' : '공급자'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">신청일: {formatDate(user.createdAt)}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="flex-1 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        승인
                      </button>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors text-center"
                      >
                        상세
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                승인 대기 중인 회원이 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/users">
          <Card className="hover:shadow-lg transition-all hover:border-primary-200 cursor-pointer">
            <CardContent className="py-6 text-center">
              <Users className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <p className="font-bold text-gray-900">회원 관리</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/rfqs">
          <Card className="hover:shadow-lg transition-all hover:border-primary-200 cursor-pointer">
            <CardContent className="py-6 text-center">
              <FileText className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <p className="font-bold text-gray-900">발주 관리</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="hover:shadow-lg transition-all hover:border-primary-200 cursor-pointer">
            <CardContent className="py-6 text-center">
              <Package className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <p className="font-bold text-gray-900">주문 관리</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/settings">
          <Card className="hover:shadow-lg transition-all hover:border-primary-200 cursor-pointer">
            <CardContent className="py-6 text-center">
              <Receipt className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <p className="font-bold text-gray-900">설정</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
