'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button, Input, Textarea, ImageUpload } from '@/components/ui'
import { UserPlus, ShoppingCart, Factory, Building2, User, MapPin, FileText, Camera } from 'lucide-react'
import { DEMO_MODE, DEMO_MESSAGES } from '@/lib/demo-mode'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'buyer'

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // 기본 정보
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    // 사업자 정보
    companyName: '',
    businessNumber: '',
    representativeName: '',
    businessType: '',
    businessCategory: '',
    // 담당자 정보
    contactName: '',
    phone: '',
    fax: '',
    // 주소 정보
    postalCode: '',
    storeAddress: '',
    storeDetailAddress: '',
    // 추가 정보
    website: '',
    introduction: '',
    // 이미지
    profileImage: '',
    businessLicenseImage: '',
    storeImages: [] as string[],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 데모 모드: 실제 가입 대신 안내 메시지 표시
    if (DEMO_MODE) {
      alert(DEMO_MESSAGES.register)
      router.push('/login')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다')
      }

      router.push('/login?message=registered')
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('필수 항목을 모두 입력해주세요')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다')
        return
      }
      if (formData.password.length < 8) {
        setError('비밀번호는 8자 이상이어야 합니다')
        return
      }
    }
    if (step === 2) {
      if (!formData.companyName || !formData.businessNumber || !formData.contactName || !formData.phone) {
        setError('필수 항목을 모두 입력해주세요 (회사명, 사업자등록번호, 담당자명, 연락처)')
        return
      }
      // 사업자등록번호 형식 검증 (간단한 체크)
      const bizNumRegex = /^\d{3}-\d{2}-\d{5}$/
      if (!bizNumRegex.test(formData.businessNumber)) {
        setError('사업자등록번호 형식이 올바르지 않습니다 (예: 123-45-67890)')
        return
      }
    }
    setError('')
    setStep(step + 1)
  }

  const prevStep = () => {
    setError('')
    setStep(step - 1)
  }

  return (
    <div className="space-y-6">
      {/* 데모 모드 배너 */}
      {DEMO_MODE && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-700 font-medium text-lg">
            현재 데모 버전입니다. 서비스 오픈 후 회원가입이 가능합니다.
          </p>
        </div>
      )}

      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">회원가입</h1>
        <p className="text-xl text-gray-500">OnTheDeal과 함께 새로운 거래를 시작하세요</p>
      </div>

      {/* 진행 단계 표시 */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                step >= s
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step > s ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-8 text-base text-gray-600 mb-6">
        <span className={step === 1 ? 'font-bold text-primary-600' : ''}>기본정보</span>
        <span className={step === 2 ? 'font-bold text-primary-600' : ''}>사업자정보</span>
        <span className={step === 3 ? 'font-bold text-primary-600' : ''}>추가정보</span>
      </div>

      {/* Step 1: 역할 선택 & 기본 정보 */}
      {step === 1 && (
        <>
          {/* 역할 선택 카드 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'buyer' })}
              className={`p-6 rounded-2xl border-2 transition-all ${
                formData.role === 'buyer'
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <ShoppingCart className={`w-12 h-12 mx-auto mb-3 ${
                formData.role === 'buyer' ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <p className={`text-xl font-bold ${
                formData.role === 'buyer' ? 'text-primary-600' : 'text-gray-600'
              }`}>구매자</p>
              <p className={`text-base mt-1 ${
                formData.role === 'buyer' ? 'text-primary-500' : 'text-gray-400'
              }`}>식자재 구매</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'supplier' })}
              className={`p-6 rounded-2xl border-2 transition-all ${
                formData.role === 'supplier'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Factory className={`w-12 h-12 mx-auto mb-3 ${
                formData.role === 'supplier' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <p className={`text-xl font-bold ${
                formData.role === 'supplier' ? 'text-green-600' : 'text-gray-600'
              }`}>공급자</p>
              <p className={`text-base mt-1 ${
                formData.role === 'supplier' ? 'text-green-500' : 'text-gray-400'
              }`}>식자재 판매</p>
            </button>
          </div>

          <Card className="shadow-xl border-2">
            <CardContent className="pt-8 space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">기본 정보</h2>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 text-lg rounded-xl border-2 border-red-200">
                  {error}
                </div>
              )}

              <Input
                label="이메일 *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="비밀번호 *"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="8자 이상 입력"
                  required
                />
                <Input
                  label="비밀번호 확인 *"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="비밀번호 다시 입력"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-2 pb-8">
              <Button type="button" size="xl" onClick={nextStep}>
                다음 단계
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Step 2: 사업자 정보 */}
      {step === 2 && (
        <Card className="shadow-xl border-2">
          <CardContent className="pt-8 space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">사업자 정보</h2>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-lg rounded-xl border-2 border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="회사명 *"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="회사명을 입력하세요"
                required
              />
              <Input
                label="사업자등록번호 *"
                value={formData.businessNumber}
                onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                placeholder="000-00-00000"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="대표자명"
                value={formData.representativeName}
                onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                placeholder="대표자명을 입력하세요"
              />
              <Input
                label="담당자명 *"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="담당자 이름을 입력하세요"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="업종"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                placeholder="예: 도소매업"
              />
              <Input
                label="업태"
                value={formData.businessCategory}
                onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                placeholder="예: 식자재, 농산물"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="연락처 *"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
                required
              />
              <Input
                label="팩스번호"
                type="tel"
                value={formData.fax}
                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                placeholder="02-1234-5678"
              />
            </div>

            <div className="border-t border-gray-200 pt-5 mt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">사업장 주소</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Input
                  label="우편번호"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="12345"
                />
                <div className="md:col-span-2">
                  <Input
                    label="주소"
                    value={formData.storeAddress}
                    onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                    placeholder="주소를 입력하세요"
                  />
                </div>
              </div>

              <Input
                label="상세주소"
                value={formData.storeDetailAddress}
                onChange={(e) => setFormData({ ...formData, storeDetailAddress: e.target.value })}
                placeholder="상세주소를 입력하세요"
                className="mt-5"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-3 pt-2 pb-8">
            <Button type="button" variant="outline" size="xl" onClick={prevStep}>
              이전 단계
            </Button>
            <Button type="button" size="xl" onClick={nextStep}>
              다음 단계
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: 추가 정보 & 이미지 */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <Card className="shadow-xl border-2">
            <CardContent className="pt-8 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">추가 정보 및 이미지</h2>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 text-lg rounded-xl border-2 border-red-200">
                  {error}
                </div>
              )}

              <Input
                label="웹사이트"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.example.com"
              />

              <Textarea
                label="회사/매장 소개"
                value={formData.introduction}
                onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                placeholder="회사나 매장에 대한 간단한 소개를 입력하세요"
                rows={4}
              />

              <div className="border-t border-gray-200 pt-5 mt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">이미지 업로드</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUpload
                    label="프로필 이미지"
                    value={formData.profileImage}
                    onChange={(value) => setFormData({ ...formData, profileImage: value as string })}
                    placeholder="프로필 사진 업로드"
                  />
                  <ImageUpload
                    label="사업자등록증"
                    value={formData.businessLicenseImage}
                    onChange={(value) => setFormData({ ...formData, businessLicenseImage: value as string })}
                    placeholder="사업자등록증 업로드"
                  />
                </div>

                <ImageUpload
                  label="매장/사업장 사진"
                  value={formData.storeImages}
                  onChange={(value) => setFormData({ ...formData, storeImages: value as string[] })}
                  multiple
                  maxFiles={5}
                  placeholder="매장 사진 업로드 (최대 5장)"
                  className="mt-6"
                />
              </div>

              {/* 입력 정보 요약 */}
              <div className="border-t border-gray-200 pt-5 mt-5">
                <h3 className="text-xl font-bold text-gray-900 mb-4">입력 정보 확인</h3>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">회원 유형</span>
                    <span className="font-medium">{formData.role === 'buyer' ? '구매자' : '공급자'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이메일</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">회사명</span>
                    <span className="font-medium">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">사업자등록번호</span>
                    <span className="font-medium">{formData.businessNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">담당자</span>
                    <span className="font-medium">{formData.contactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연락처</span>
                    <span className="font-medium">{formData.phone}</span>
                  </div>
                  {formData.storeAddress && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">주소</span>
                      <span className="font-medium">{formData.storeAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2 pb-8">
              <div className="flex justify-between gap-3 w-full">
                <Button type="button" variant="outline" size="xl" onClick={prevStep}>
                  이전 단계
                </Button>
                <Button type="submit" size="xl" isLoading={loading}>
                  <UserPlus className="w-6 h-6 mr-2" />
                  회원가입 완료
                </Button>
              </div>
              <p className="text-lg text-center text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-primary-600 hover:underline font-bold">
                  로그인
                </Link>
              </p>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-gray-500">로딩 중...</p>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
