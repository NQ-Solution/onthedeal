'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button, Input, Badge } from '@/components/ui'
import { User, Building, Phone, Mail, MapPin, CreditCard, Save, Edit2 } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { mockSupplierAccount } from '@/lib/mock-data'

export default function ProfilePage() {
  const { user, currentRole } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    id: user.id,
    email: user.email,
    role: currentRole,
    company_name: user.company_name,
    business_number: user.business_number || '',
    contact_name: user.contact_name,
    phone: user.phone,
    address: user.store_address || user.address || '',
    created_at: user.created_at,
  })
  const [bankAccount, setBankAccount] = useState(mockSupplierAccount)

  // 역할 변경 시 프로필 업데이트
  useEffect(() => {
    setProfile({
      id: user.id,
      email: user.email,
      role: currentRole,
      company_name: user.company_name,
      business_number: user.business_number || '',
      contact_name: user.contact_name,
      phone: user.phone,
      address: user.store_address || user.address || '',
      created_at: user.created_at,
    })
  }, [user, currentRole])

  const handleSaveProfile = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setIsEditing(false)
    alert('프로필이 저장되었습니다.')
  }

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
            <Button size="lg" onClick={handleSaveProfile} isLoading={loading}>
              <Save className="w-5 h-5 mr-2" />
              저장
            </Button>
          </div>
        )}
      </div>

      {/* 역할 뱃지 */}
      <div className="flex items-center gap-4">
        <Badge
          variant={currentRole === 'buyer' ? 'info' : 'success'}
          className="text-base px-4 py-2"
        >
          {currentRole === 'buyer' ? '구매자' : '공급자'}
        </Badge>
        <span className="text-base text-gray-500">가입일: {profile.created_at}</span>
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
                    value={profile.contact_name}
                    onChange={(e) => setProfile({ ...profile, contact_name: e.target.value })}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">담당자명</label>
                    <p className="text-lg text-gray-900">{profile.contact_name}</p>
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
                    <p className="text-lg text-gray-900">{profile.phone}</p>
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
                    value={profile.company_name}
                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">회사명 (상호)</label>
                    <p className="text-lg text-gray-900">{profile.company_name}</p>
                  </>
                )}
              </div>
              <div>
                {isEditing ? (
                  <Input
                    label="사업자등록번호"
                    value={profile.business_number}
                    onChange={(e) => setProfile({ ...profile, business_number: e.target.value })}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">사업자등록번호</label>
                    <p className="text-lg text-gray-900">{profile.business_number}</p>
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
                    <p className="text-lg text-gray-900">{profile.address}</p>
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
                      value={bankAccount.bank_name}
                      onChange={(e) => setBankAccount({ ...bankAccount, bank_name: e.target.value })}
                    />
                  ) : (
                    <>
                      <label className="block text-base font-medium text-gray-500 mb-2">은행명</label>
                      <p className="text-lg text-gray-900">{bankAccount.bank_name}</p>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      label="계좌번호"
                      value={bankAccount.account_number}
                      onChange={(e) => setBankAccount({ ...bankAccount, account_number: e.target.value })}
                    />
                  ) : (
                    <>
                      <label className="block text-base font-medium text-gray-500 mb-2">계좌번호</label>
                      <p className="text-lg text-gray-900">{bankAccount.account_number}</p>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      label="예금주"
                      value={bankAccount.account_holder}
                      onChange={(e) => setBankAccount({ ...bankAccount, account_holder: e.target.value })}
                    />
                  ) : (
                    <>
                      <label className="block text-base font-medium text-gray-500 mb-2">예금주</label>
                      <p className="text-lg text-gray-900">{bankAccount.account_holder}</p>
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
