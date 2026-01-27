'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  X,
  UserCheck,
  UserX,
  Clock,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Calendar,
  AlertTriangle,
  Loader2,
  ShoppingCart,
  Package,
  Ban,
  RotateCcw,
  Trash2
} from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Textarea } from '@/components/ui'

interface User {
  id: string
  email: string
  role: string
  companyName: string
  businessNumber?: string
  representativeName?: string
  businessType?: string
  businessCategory?: string
  contactName: string
  phone: string
  fax?: string
  postalCode?: string
  storeAddress?: string
  storeDetailAddress?: string
  address?: string
  website?: string
  introduction?: string
  profileImage?: string
  businessLicenseImage?: string
  storeImages?: string[]
  approvalStatus: string
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
  _count?: {
    rfqs: number
    quotes: number
    buyerOrders: number
    supplierOrders: number
  }
}

const statusConfig = {
  pending: { label: '승인 대기', variant: 'warning' as const, icon: Clock, color: 'yellow' },
  approved: { label: '승인됨', variant: 'success' as const, icon: UserCheck, color: 'green' },
  rejected: { label: '거절됨', variant: 'error' as const, icon: UserX, color: 'red' },
  suspended: { label: '정지됨', variant: 'error' as const, icon: Ban, color: 'red' },
}

const roleLabels = {
  buyer: { label: '구매자', variant: 'info' as const, color: 'blue' },
  supplier: { label: '공급자', variant: 'success' as const, color: 'green' },
  admin: { label: '관리자', variant: 'error' as const, color: 'red' },
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showSuspendForm, setShowSuspendForm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      router.push('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'approve' }),
      })
      if (res.ok) {
        fetchUser()
      }
    } catch (error) {
      console.error('Failed to approve user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.')
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'reject', rejectionReason: rejectReason }),
      })
      if (res.ok) {
        fetchUser()
        setShowRejectForm(false)
        setRejectReason('')
      }
    } catch (error) {
      console.error('Failed to reject user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      alert('정지 사유를 입력해주세요.')
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'suspend', rejectionReason: suspendReason }),
      })
      if (res.ok) {
        fetchUser()
        setShowSuspendForm(false)
        setSuspendReason('')
      }
    } catch (error) {
      console.error('Failed to suspend user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivate = async () => {
    if (!confirm('이 회원을 다시 활성화하시겠습니까?')) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'approve' }),
      })
      if (res.ok) {
        fetchUser()
      }
    } catch (error) {
      console.error('Failed to reactivate user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 회원을 삭제하시겠습니까?\n\n⚠️ 주의: 이 작업은 되돌릴 수 없습니다.\n회원의 모든 데이터(주문, 제안, 채팅 등)가 함께 삭제됩니다.')) return
    if (!confirm('마지막 확인: 정말로 삭제하시겠습니까?')) return

    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        alert('회원이 삭제되었습니다.')
        router.push('/admin/users')
      } else {
        const data = await res.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">회원 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const status = statusConfig[user.approvalStatus as keyof typeof statusConfig]
  const role = roleLabels[user.role as keyof typeof roleLabels]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              목록으로
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.companyName}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={role?.variant || 'default'} className="text-base px-4 py-1">
            {role?.label || user.role}
          </Badge>
          <Badge variant={status?.variant || 'default'} className="text-base px-4 py-1">
            {status?.label || user.approvalStatus}
          </Badge>
        </div>
      </div>

      {/* Status Alert */}
      {user.approvalStatus === 'pending' && (
        <Card className="border-2 border-yellow-300 bg-yellow-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-200 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-800">승인 대기 중</h3>
                <p className="text-yellow-700">이 회원의 가입 요청을 검토해주세요.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user.approvalStatus === 'rejected' && user.rejectionReason && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-200 rounded-2xl flex items-center justify-center">
                <UserX className="w-7 h-7 text-red-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800">거절됨</h3>
                <p className="text-red-700">사유: {user.rejectionReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user.approvalStatus === 'suspended' && user.rejectionReason && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-200 rounded-2xl flex items-center justify-center">
                <Ban className="w-7 h-7 text-red-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800">계정 정지됨</h3>
                <p className="text-red-700">사유: {user.rejectionReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                사업자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">회사명</p>
                  <p className="font-bold text-gray-900">{user.companyName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">사업자등록번호</p>
                  <p className="font-bold font-mono text-gray-900">{user.businessNumber || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">대표자명</p>
                  <p className="font-bold text-gray-900">{user.representativeName || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">업종 / 업태</p>
                  <p className="font-bold text-gray-900">{user.businessType || '-'} / {user.businessCategory || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 담당자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                담당자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">담당자명</p>
                  <p className="font-bold text-gray-900">{user.contactName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">이메일</p>
                  <p className="font-bold text-gray-900">{user.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">연락처</p>
                  <p className="font-bold text-gray-900">{user.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">팩스</p>
                  <p className="font-bold text-gray-900">{user.fax || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주소 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                사업장 주소
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">주소</p>
                <p className="font-bold text-gray-900">
                  {user.postalCode && `(${user.postalCode}) `}
                  {user.storeAddress || user.address || '-'}
                  {user.storeDetailAddress && ` ${user.storeDetailAddress}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                추가 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">웹사이트</p>
                {user.website ? (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="font-bold text-primary-600 hover:underline">
                    {user.website}
                  </a>
                ) : (
                  <p className="font-bold text-gray-900">-</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">회사 소개</p>
                <p className="font-bold text-gray-900 whitespace-pre-wrap">{user.introduction || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* 이미지 */}
          {(user.profileImage || user.businessLicenseImage || (user.storeImages && user.storeImages.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  첨부 이미지
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {user.profileImage && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">프로필 사진</p>
                      <img src={user.profileImage} alt="프로필" className="w-full h-40 object-cover rounded-xl border-2 border-gray-200" />
                    </div>
                  )}
                  {user.businessLicenseImage && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">사업자등록증</p>
                      <img src={user.businessLicenseImage} alt="사업자등록증" className="w-full h-40 object-cover rounded-xl border-2 border-gray-200" />
                    </div>
                  )}
                  {user.storeImages && user.storeImages.map((img, i) => (
                    <div key={i}>
                      <p className="text-sm text-gray-500 mb-2">매장 사진 {i + 1}</p>
                      <img src={img} alt={`매장 ${i + 1}`} className="w-full h-40 object-cover rounded-xl border-2 border-gray-200" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* 활동 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-600" />
                활동 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">발주 요청</span>
                <span className="font-bold text-gray-900">{user._count?.rfqs || 0}건</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">제출한 제안</span>
                <span className="font-bold text-gray-900">{user._count?.quotes || 0}건</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">구매 주문</span>
                <span className="font-bold text-gray-900">{user._count?.buyerOrders || 0}건</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">판매 주문</span>
                <span className="font-bold text-gray-900">{user._count?.supplierOrders || 0}건</span>
              </div>
            </CardContent>
          </Card>

          {/* 가입 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                가입 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">가입일</p>
                <p className="font-bold text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
              {user.approvedAt && (
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-600 mb-1">승인일</p>
                  <p className="font-bold text-green-700">{formatDate(user.approvedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 관리 액션 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                회원 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 대기 중인 회원: 승인/거절 */}
              {user.approvalStatus === 'pending' && (
                <>
                  {!showRejectForm ? (
                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleApprove}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                        승인하기
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => setShowRejectForm(true)}
                        disabled={actionLoading}
                      >
                        <X className="w-5 h-5 mr-2" />
                        거절하기
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="거절 사유를 입력하세요..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="lg"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowRejectForm(false)
                            setRejectReason('')
                          }}
                        >
                          취소
                        </Button>
                        <Button
                          size="lg"
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={handleReject}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '거절 확인'}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 승인된 회원: 정지 가능 */}
              {user.approvalStatus === 'approved' && (
                <>
                  {!showSuspendForm ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => setShowSuspendForm(true)}
                      disabled={actionLoading}
                    >
                      <Ban className="w-5 h-5 mr-2" />
                      계정 정지하기
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="정지 사유를 입력하세요..."
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="lg"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowSuspendForm(false)
                            setSuspendReason('')
                          }}
                        >
                          취소
                        </Button>
                        <Button
                          size="lg"
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={handleSuspend}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '정지 확인'}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 거절/정지된 회원: 재활성화 가능 */}
              {(user.approvalStatus === 'rejected' || user.approvalStatus === 'suspended') && (
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleReactivate}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <RotateCcw className="w-5 h-5 mr-2" />}
                  다시 승인하기
                </Button>
              )}

              {/* 회원 삭제 (관리자 본인 제외) */}
              {user.role !== 'admin' && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Trash2 className="w-5 h-5 mr-2" />}
                    회원 삭제
                  </Button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    ⚠️ 삭제 시 모든 데이터가 함께 삭제됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
