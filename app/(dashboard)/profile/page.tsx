'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button, Input, Badge } from '@/components/ui'
import { User, Building, Phone, Mail, MapPin, CreditCard, Save, Edit2, Loader2 } from 'lucide-react'

interface BankAccount {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  })
  const [profile, setProfile] = useState({
    id: '',
    email: '',
    role: 'buyer' as 'buyer' | 'supplier' | 'admin',
    companyName: '',
    businessNumber: '',
    contactName: '',
    phone: '',
    address: '',
    createdAt: '',
  })

  // API에서 프로필 정보 로드
  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile({
          id: data.id || '',
          email: data.email || '',
          role: (data.role as 'buyer' | 'supplier' | 'admin') || 'buyer',
          companyName: data.companyName || '',
          businessNumber: data.businessNumber || '',
          contactName: data.contactName || '',
          phone: data.phone || '',
          address: data.storeAddress || '',
          createdAt: data.createdAt || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  // 공급자인 경우 계좌 정보 로드
  useEffect(() => {
    if (session?.user?.role === 'supplier') {
      fetchBankAccount()
    }
  }, [session])

  const fetchBankAccount = async () => {
    try {
      const res = await fetch('/api/supplier/account')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setBankAccount({
            bankName: data.bankName || '',
            accountNumber: data.accountNumber || '',
            accountHolder: data.accountHolder || '',
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch bank account:', error)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: profile.contactName,
          phone: profile.phone,
          companyName: profile.companyName,
          businessNumber: profile.businessNumber,
          storeAddress: profile.address,
        }),
      })
      if (res.ok) {
        alert('프로필이 저장되었습니다.')
        setIsEditing(false)
      } else {
        alert('프로필 저장에 실패했습니다.')
      }
    } catch (error) {
      alert('프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBankAccount = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/supplier/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankAccount),
      })
      if (res.ok) {
        alert('계좌 정보가 저장되었습니다.')
        setIsEditing(false)
      } else {
        alert('계좌 정보 저장에 실패했습니다.')
      }
    } catch (error) {
      alert('계좌 정보 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">로그인이 필요합니다.</p>
      </div>
    )
  }

  const currentRole = profile.role

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
          <p className="text-lg text-gray-500 mt-1">계정 및 사업자 정보를 관리합니다</p>
        </div>
        {!isEditing ? (
          <Button size="lg" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-5 h-5 mr-2" />
            수정하기
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button size="lg" variant="outline" onClick={() => setIsEditing(false)}>
              취소
            </Button>
            <Button size="lg" onClick={() => { handleSaveProfile(); if (currentRole === 'supplier') handleSaveBankAccount(); }} isLoading={loading}>
              <Save className="w-5 h-5 mr-2" />
              저장
            </Button>
          </div>
        )}
      </div>

      {/* 역할 뱃지 */}
      <div className="flex items-center gap-4">
        <Badge
          variant={currentRole === 'buyer' ? 'info' : currentRole === 'admin' ? 'warning' : 'success'}
          className="text-base px-4 py-2"
        >
          {currentRole === 'buyer' ? '구매자' : currentRole === 'admin' ? '관리자' : '공급자'}
        </Badge>
        <span className="text-base text-gray-500">가입일: {formatDate(profile.createdAt)}</span>
      </div>

      <div className="space-y-6">
        {/* 기본 정보 */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-medium text-gray-500 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  이메일
                </label>
                <p className="text-lg text-gray-900">{profile.email}</p>
              </div>
              <div>
                {isEditing ? (
                  <Input
                    label="담당자명"
                    value={profile.contactName}
                    onChange={(e) => setProfile({ ...profile, contactName: e.target.value })}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">담당자명</label>
                    <p className="text-lg text-gray-900">{profile.contactName || '-'}</p>
                  </>
                )}
              </div>
              <div>
                {isEditing ? (
                  <Input
                    label="연락처"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      연락처
                    </label>
                    <p className="text-lg text-gray-900">{profile.phone || '-'}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 회사 정보 */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              사업자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {isEditing ? (
                  <Input
                    label="회사명 (상호)"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">회사명 (상호)</label>
                    <p className="text-lg text-gray-900">{profile.companyName || '-'}</p>
                  </>
                )}
              </div>
              <div>
                {isEditing ? (
                  <Input
                    label="사업자등록번호"
                    value={profile.businessNumber}
                    onChange={(e) => setProfile({ ...profile, businessNumber: e.target.value })}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">사업자등록번호</label>
                    <p className="text-lg text-gray-900">{profile.businessNumber || '-'}</p>
                  </>
                )}
              </div>
              <div className="md:col-span-2">
                {isEditing ? (
                  <Input
                    label="사업장 주소"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      사업장 주소
                    </label>
                    <p className="text-lg text-gray-900">{profile.address || '-'}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 공급자 전용: 정산 계좌 */}
        {currentRole === 'supplier' && (
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                정산 계좌
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  {isEditing ? (
                    <Input
                      label="은행명"
                      value={bankAccount.bankName}
                      onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })}
                    />
                  ) : (
                    <>
                      <label className="block text-base font-medium text-gray-500 mb-2">은행명</label>
                      <p className="text-lg text-gray-900">{bankAccount.bankName || '-'}</p>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      label="계좌번호"
                      value={bankAccount.accountNumber}
                      onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                    />
                  ) : (
                    <>
                      <label className="block text-base font-medium text-gray-500 mb-2">계좌번호</label>
                      <p className="text-lg text-gray-900">{bankAccount.accountNumber || '-'}</p>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      label="예금주"
                      value={bankAccount.accountHolder}
                      onChange={(e) => setBankAccount({ ...bankAccount, accountHolder: e.target.value })}
                    />
                  ) : (
                    <>
                      <label className="block text-base font-medium text-gray-500 mb-2">예금주</label>
                      <p className="text-lg text-gray-900">{bankAccount.accountHolder || '-'}</p>
                    </>
                  )}
                </div>
              </div>
              <p className="text-base text-gray-500">
                거래 완료 후 정산 금액이 입금되는 계좌입니다.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 비밀번호 변경 */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">비밀번호 변경</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-gray-500 mb-4">
              보안을 위해 주기적으로 비밀번호를 변경해주세요.
            </p>
            <Button variant="outline" size="lg">비밀번호 변경하기</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
