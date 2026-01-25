'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  FileText,
  Receipt,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, Badge } from '@/components/ui'
import { mockStats, mockPendingUsers, mockRFQs, mockQuotes } from '@/lib/mock-data'

// 통계 데이터 (중앙 mock 데이터 기반)
const dashboardStats = {
  totalUsers: mockStats.totalVolume > 0 ? mockStats.activeSuppliers + 500 : 1234,
  newUsersToday: mockPendingUsers.length,
  pendingApprovals: mockPendingUsers.length,
  activeRFQs: mockRFQs.filter(r => r.status === 'open').length,
  totalQuotes: mockQuotes.length,
  completedOrders: mockStats.completedDeals > 0 ? Math.floor(mockStats.completedDeals / 100) : 234,
  totalRevenue: 15600000,
  pendingInquiries: 3,
}

const recentActivities = [
  { id: 1, type: 'user', message: `새로운 회원가입: ${mockPendingUsers[0]?.company_name || '새로운 사용자'}`, time: '5분 전', status: 'pending' },
  { id: 2, type: 'rfq', message: `새로운 발주 등록: ${mockRFQs[0]?.title || '발주'}`, time: '15분 전', status: 'new' },
  { id: 3, type: 'order', message: '주문 완료: #ORD-2025-0123', time: '30분 전', status: 'success' },
  { id: 4, type: 'inquiry', message: '새로운 문의: 결제 관련 문의', time: '1시간 전', status: 'pending' },
  { id: 5, type: 'quote', message: `견적 제출: ${mockRFQs[1]?.title || '제품'}`, time: '2시간 전', status: 'new' },
]

const pendingApprovals = mockPendingUsers.map((u, i) => ({
  id: i + 1,
  name: u.company_name,
  type: u.role,
  date: u.created_at,
}))

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">전체 회원</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardStats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  오늘 +{dashboardStats.newUsersToday}
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
                <p className="text-sm text-gray-500 font-medium">활성 RFQ</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardStats.activeRFQs}</p>
                <p className="text-sm text-primary-600 flex items-center gap-1 mt-2">
                  <FileText className="w-4 h-4" />
                  견적 {dashboardStats.totalQuotes}건
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
                <p className="text-sm text-gray-500 font-medium">완료된 주문</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardStats.completedOrders}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                  <CheckCircle className="w-4 h-4" />
                  이번 달 +32
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">총 수수료 수익</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{(dashboardStats.totalRevenue / 10000).toLocaleString()}만</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  +15% vs 지난달
                </p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">승인 대기</h3>
                <p className="text-sm text-yellow-700">{dashboardStats.pendingApprovals}건의 회원가입 승인 대기 중</p>
              </div>
            </div>
            <Link href="/admin/users?filter=pending" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              바로가기 <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Pending Inquiries */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">미답변 문의</h3>
                <p className="text-sm text-blue-700">{dashboardStats.pendingInquiries}건의 문의가 답변 대기 중</p>
              </div>
            </div>
            <Link href="/admin/inquiries" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              바로가기 <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">최근 활동</h2>
                <Link href="/admin" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  전체 보기
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'pending' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'user' && <Users className={`w-5 h-5 ${activity.status === 'pending' ? 'text-yellow-600' : 'text-blue-600'}`} />}
                      {activity.type === 'rfq' && <FileText className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'order' && <Package className="w-5 h-5 text-green-600" />}
                      {activity.type === 'inquiry' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                      {activity.type === 'quote' && <Receipt className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <Badge variant={
                      activity.status === 'success' ? 'success' :
                      activity.status === 'pending' ? 'warning' : 'info'
                    }>
                      {activity.status === 'success' ? '완료' :
                       activity.status === 'pending' ? '대기' : '신규'}
                    </Badge>
                  </div>
                ))}
              </div>
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
            <div className="space-y-4">
              {pendingApprovals.map((user) => (
                <div key={user.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <Badge variant={user.type === 'buyer' ? 'info' : 'success'}>
                      {user.type === 'buyer' ? '구매자' : '공급자'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">신청일: {user.date}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors">
                      승인
                    </button>
                    <button className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors">
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
              <p className="font-bold text-gray-900">RFQ 관리</p>
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
