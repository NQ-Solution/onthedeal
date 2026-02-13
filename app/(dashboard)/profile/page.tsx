'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button, Input, Badge, Textarea } from '@/components/ui'
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Save,
  Edit2,
  Loader2,
  Lock,
  Globe,
  FileText,
  X,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react'

interface ProfileData {
  id: string
  email: string
  role: 'buyer' | 'supplier' | 'admin'
  companyName: string
  businessNumber: string
  representativeName: string
  businessType: string
  businessCategory: string
  contactName: string
  phone: string
  fax: string
  postalCode: string
  storeAddress: string
  storeDetailAddress: string
  address: string
  website: string
  introduction: string
  bankName: string
  bankAccount: string
  bankHolder: string
  profileImage: string | null
  businessLicenseImage: string | null
  storeImages: string[]
  approvalStatus: string
  createdAt: string
}

type SectionKey = 'basic' | 'business' | 'address' | 'extra' | 'bank'

interface PasswordValidation {
  minLength: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  specialChar: boolean
}

function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
}

function isPasswordValid(validation: PasswordValidation): boolean {
  return Object.values(validation).every(Boolean)
}

function ValidationItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2 text-base">
      {passed ? (
        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
      )}
      <span className={passed ? 'text-green-700' : 'text-gray-500'}>{label}</span>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null)
  const [sectionDraft, setSectionDraft] = useState<Partial<ProfileData>>({})
  const [sectionLoading, setSectionLoading] = useState<SectionKey | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const passwordValidation = validatePassword(newPassword)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile({
          id: data.id || '',
          email: data.email || '',
          role: data.role as 'buyer' | 'supplier' | 'admin',
          companyName: data.companyName || '',
          businessNumber: data.businessNumber || '',
          representativeName: data.representativeName || '',
          businessType: data.businessType || '',
          businessCategory: data.businessCategory || '',
          contactName: data.contactName || '',
          phone: data.phone || '',
          fax: data.fax || '',
          postalCode: data.postalCode || '',
          storeAddress: data.storeAddress || '',
          storeDetailAddress: data.storeDetailAddress || '',
          address: data.address || '',
          website: data.website || '',
          introduction: data.introduction || '',
          bankName: data.bankName || '',
          bankAccount: data.bankAccount || '',
          bankHolder: data.bankHolder || '',
          profileImage: data.profileImage || null,
          businessLicenseImage: data.businessLicenseImage || null,
          storeImages: data.storeImages || [],
          approvalStatus: data.approvalStatus || '',
          createdAt: data.createdAt || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session?.user?.id, fetchProfile])

  const startEditing = (section: SectionKey) => {
    if (!profile) return
    setEditingSection(section)
    setSuccessMessage(null)
    setErrorMessage(null)

    switch (section) {
      case 'basic':
        setSectionDraft({
          contactName: profile.contactName,
          phone: profile.phone,
          fax: profile.fax,
        })
        break
      case 'business':
        setSectionDraft({
          companyName: profile.companyName,
          businessNumber: profile.businessNumber,
          representativeName: profile.representativeName,
          businessType: profile.businessType,
          businessCategory: profile.businessCategory,
        })
        break
      case 'address':
        setSectionDraft({
          postalCode: profile.postalCode,
          storeAddress: profile.storeAddress,
          storeDetailAddress: profile.storeDetailAddress,
          address: profile.address,
        })
        break
      case 'extra':
        setSectionDraft({
          website: profile.website,
          introduction: profile.introduction,
        })
        break
      case 'bank':
        setSectionDraft({
          bankName: profile.bankName,
          bankAccount: profile.bankAccount,
          bankHolder: profile.bankHolder,
        })
        break
    }
  }

  const cancelEditing = () => {
    setEditingSection(null)
    setSectionDraft({})
  }

  const saveSection = async (section: SectionKey) => {
    setSectionLoading(section)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionDraft),
      })
      if (res.ok) {
        setProfile(prev => prev ? {
          ...prev,
          ...Object.fromEntries(
            Object.entries(sectionDraft).map(([k, v]) => [k, v ?? ''])
          ),
        } : prev)
        setEditingSection(null)
        setSectionDraft({})
        setSuccessMessage('저장되었습니다.')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        const data = await res.json()
        setErrorMessage(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      setErrorMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setSectionLoading(null)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!isPasswordValid(passwordValidation)) {
      setPasswordError('비밀번호 요구사항을 모두 충족해주세요.')
      return
    }

    if (!passwordsMatch) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (res.ok) {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess(false)
        }, 2000)
      } else {
        const data = await res.json()
        setPasswordError(data.error || '비밀번호 변경에 실패했습니다.')
      }
    } catch (error) {
      setPasswordError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const updateDraft = (key: keyof ProfileData, value: string) => {
    setSectionDraft(prev => ({ ...prev, [key]: value }))
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'buyer': return '구매자'
      case 'supplier': return '공급자'
      case 'admin': return '관리자'
      default: return role
    }
  }

  const getRoleBadgeVariant = (role: string): 'info' | 'success' | 'warning' => {
    switch (role) {
      case 'buyer': return 'info'
      case 'supplier': return 'success'
      case 'admin': return 'warning'
      default: return 'info'
    }
  }

  const getApprovalLabel = (status: string) => {
    switch (status) {
      case 'approved': return '승인됨'
      case 'pending': return '승인 대기'
      case 'rejected': return '승인 거부'
      default: return status || '-'
    }
  }

  const getApprovalBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  if (status === 'loading' || !profile) {
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

  const isSupplier = profile.role === 'supplier'

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
        <p className="text-lg text-gray-500 mt-1">계정 및 사업자 정보를 관리합니다</p>
      </div>

      {/* Role and status badges */}
      <div className="flex flex-wrap items-center gap-4">
        <Badge
          variant={getRoleBadgeVariant(profile.role)}
          className="text-base px-4 py-2"
        >
          {getRoleLabel(profile.role)}
        </Badge>
        <Badge
          variant={getApprovalBadgeVariant(profile.approvalStatus)}
          className="text-base px-4 py-2"
        >
          {getApprovalLabel(profile.approvalStatus)}
        </Badge>
        <span className="text-base text-gray-500">가입일: {formatDate(profile.createdAt)}</span>
      </div>

      {/* Success/Error messages */}
      {successMessage && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl px-6 py-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-lg text-green-700">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl px-6 py-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-lg text-red-700">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Basic Info */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                기본 정보
              </CardTitle>
              {editingSection !== 'basic' ? (
                <Button size="sm" variant="outline" onClick={() => startEditing('basic')}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  수정
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveSection('basic')}
                    isLoading={sectionLoading === 'basic'}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    저장
                  </Button>
                </div>
              )}
            </div>
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
                {editingSection === 'basic' ? (
                  <Input
                    label="담당자명"
                    value={sectionDraft.contactName ?? ''}
                    onChange={(e) => updateDraft('contactName', e.target.value)}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">담당자명</label>
                    <p className="text-lg text-gray-900">{profile.contactName || '-'}</p>
                  </>
                )}
              </div>
              <div>
                {editingSection === 'basic' ? (
                  <Input
                    label="연락처"
                    type="tel"
                    value={sectionDraft.phone ?? ''}
                    onChange={(e) => updateDraft('phone', e.target.value)}
                    placeholder="010-0000-0000"
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
              <div>
                {editingSection === 'basic' ? (
                  <Input
                    label="팩스"
                    type="tel"
                    value={sectionDraft.fax ?? ''}
                    onChange={(e) => updateDraft('fax', e.target.value)}
                    placeholder="02-0000-0000"
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">팩스</label>
                    <p className="text-lg text-gray-900">{profile.fax || '-'}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Business Info */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                사업자 정보
              </CardTitle>
              {editingSection !== 'business' ? (
                <Button size="sm" variant="outline" onClick={() => startEditing('business')}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  수정
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveSection('business')}
                    isLoading={sectionLoading === 'business'}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    저장
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {editingSection === 'business' ? (
                  <Input
                    label="회사명 (상호)"
                    value={sectionDraft.companyName ?? ''}
                    onChange={(e) => updateDraft('companyName', e.target.value)}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">회사명 (상호)</label>
                    <p className="text-lg text-gray-900">{profile.companyName || '-'}</p>
                  </>
                )}
              </div>
              <div>
                {editingSection === 'business' ? (
                  <Input
                    label="사업자등록번호"
                    value={sectionDraft.businessNumber ?? ''}
                    onChange={(e) => updateDraft('businessNumber', e.target.value)}
                    placeholder="000-00-00000"
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">사업자등록번호</label>
                    <p className="text-lg text-gray-900">{profile.businessNumber || '-'}</p>
                  </>
                )}
              </div>
              <div>
                {editingSection === 'business' ? (
                  <Input
                    label="대표자명"
                    value={sectionDraft.representativeName ?? ''}
                    onChange={(e) => updateDraft('representativeName', e.target.value)}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">대표자명</label>
                    <p className="text-lg text-gray-900">{profile.representativeName || '-'}</p>
                  </>
                )}
              </div>
              <div>
                {editingSection === 'business' ? (
                  <Input
                    label="업태"
                    value={sectionDraft.businessType ?? ''}
                    onChange={(e) => updateDraft('businessType', e.target.value)}
                    placeholder="예: 도소매"
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">업태</label>
                    <p className="text-lg text-gray-900">{profile.businessType || '-'}</p>
                  </>
                )}
              </div>
              <div className="md:col-span-2">
                {editingSection === 'business' ? (
                  <Input
                    label="업종"
                    value={sectionDraft.businessCategory ?? ''}
                    onChange={(e) => updateDraft('businessCategory', e.target.value)}
                    placeholder="예: 전자상거래"
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">업종</label>
                    <p className="text-lg text-gray-900">{profile.businessCategory || '-'}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Address Info */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                주소 정보
              </CardTitle>
              {editingSection !== 'address' ? (
                <Button size="sm" variant="outline" onClick={() => startEditing('address')}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  수정
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveSection('address')}
                    isLoading={sectionLoading === 'address'}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    저장
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {editingSection === 'address' ? (
                  <Input
                    label="우편번호"
                    value={sectionDraft.postalCode ?? ''}
                    onChange={(e) => updateDraft('postalCode', e.target.value)}
                    placeholder="00000"
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">우편번호</label>
                    <p className="text-lg text-gray-900">{profile.postalCode || '-'}</p>
                  </>
                )}
              </div>
              <div>
                {editingSection === 'address' ? (
                  <Input
                    label="주소"
                    value={sectionDraft.address ?? ''}
                    onChange={(e) => updateDraft('address', e.target.value)}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">주소</label>
                    <p className="text-lg text-gray-900">{profile.address || '-'}</p>
                  </>
                )}
              </div>
              <div>
                {editingSection === 'address' ? (
                  <Input
                    label="매장 주소"
                    value={sectionDraft.storeAddress ?? ''}
                    onChange={(e) => updateDraft('storeAddress', e.target.value)}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">매장 주소</label>
                    <p className="text-lg text-gray-900">{profile.storeAddress || '-'}</p>
                  </>
                )}
              </div>
              <div>
                {editingSection === 'address' ? (
                  <Input
                    label="매장 상세주소"
                    value={sectionDraft.storeDetailAddress ?? ''}
                    onChange={(e) => updateDraft('storeDetailAddress', e.target.value)}
                    placeholder="동, 호수 등"
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">매장 상세주소</label>
                    <p className="text-lg text-gray-900">{profile.storeDetailAddress || '-'}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Extra Info */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                추가 정보
              </CardTitle>
              {editingSection !== 'extra' ? (
                <Button size="sm" variant="outline" onClick={() => startEditing('extra')}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  수정
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveSection('extra')}
                    isLoading={sectionLoading === 'extra'}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    저장
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-6">
              <div>
                {editingSection === 'extra' ? (
                  <Input
                    label="웹사이트"
                    type="url"
                    value={sectionDraft.website ?? ''}
                    onChange={(e) => updateDraft('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      웹사이트
                    </label>
                    <p className="text-lg text-gray-900">
                      {profile.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          {profile.website}
                        </a>
                      ) : '-'}
                    </p>
                  </>
                )}
              </div>
              <div>
                {editingSection === 'extra' ? (
                  <Textarea
                    label="소개"
                    value={sectionDraft.introduction ?? ''}
                    onChange={(e) => updateDraft('introduction', e.target.value)}
                    placeholder="회사 또는 매장에 대한 간단한 소개를 작성해주세요."
                    rows={4}
                  />
                ) : (
                  <>
                    <label className="block text-base font-medium text-gray-500 mb-2">소개</label>
                    <p className="text-lg text-gray-900 whitespace-pre-wrap">{profile.introduction || '-'}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Bank Account (Supplier only) */}
        {isSupplier && (
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  정산 계좌
                </CardTitle>
                {editingSection !== 'bank' ? (
                  <Button size="sm" variant="outline" onClick={() => startEditing('bank')}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    수정
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveSection('bank')}
                      isLoading={sectionLoading === 'bank'}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      저장
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  {editingSection === 'bank' ? (
                    <Input
                      label="은행명"
                      value={sectionDraft.bankName ?? ''}
                      onChange={(e) => updateDraft('bankName', e.target.value)}
                      placeholder="예: 국민은행"
                    />
                  ) : (
                    <>
                      <label className="block text-base font-medium text-gray-500 mb-2">은행명</label>
                      <p className="text-lg text-gray-900">{profile.bankName || '-'}</p>
                    </>
                  )}
                </div>
                <div>
                  {editingSection === 'bank' ? (
                    <Input
                      label="계좌번호"
                      value={sectionDraft.bankAccount ?? ''}
                      onChange={(e) => updateDraft('bankAccount', e.target.value)}
                    />
                  ) : (
                    <>
                      <label className="block text-base font-medium text-gray-500 mb-2">계좌번호</label>
                      <p className="text-lg text-gray-900">{profile.bankAccount || '-'}</p>
                    </>
                  )}
                </div>
                <div>
                  {editingSection === 'bank' ? (
                    <Input
                      label="예금주"
                      value={sectionDraft.bankHolder ?? ''}
                      onChange={(e) => updateDraft('bankHolder', e.target.value)}
                    />
                  ) : (
                    <>
                      <label className="block text-base font-medium text-gray-500 mb-2">예금주</label>
                      <p className="text-lg text-gray-900">{profile.bankHolder || '-'}</p>
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

        {/* Password Change Section */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              비밀번호 변경
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showPasswordModal ? (
              <div>
                <p className="text-base text-gray-500 mb-4">
                  보안을 위해 주기적으로 비밀번호를 변경해주세요.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setShowPasswordModal(true)
                    setPasswordError(null)
                    setPasswordSuccess(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  비밀번호 변경하기
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {passwordSuccess ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl px-6 py-4 flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-lg text-green-700">비밀번호가 성공적으로 변경되었습니다.</span>
                  </div>
                ) : (
                  <>
                    {passwordError && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl px-6 py-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-lg text-red-700">{passwordError}</span>
                      </div>
                    )}

                    {/* Current password */}
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">현재 비밀번호</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-14"
                          placeholder="현재 비밀번호를 입력하세요"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">새 비밀번호</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-14"
                          placeholder="새 비밀번호를 입력하세요"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {/* Real-time password validation */}
                      {newPassword.length > 0 && (
                        <div className="mt-3 bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-2">
                          <ValidationItem label="8자 이상" passed={passwordValidation.minLength} />
                          <ValidationItem label="대문자 포함" passed={passwordValidation.uppercase} />
                          <ValidationItem label="소문자 포함" passed={passwordValidation.lowercase} />
                          <ValidationItem label="숫자 포함" passed={passwordValidation.number} />
                          <ValidationItem label="특수문자 포함" passed={passwordValidation.specialChar} />
                        </div>
                      )}
                    </div>

                    {/* Confirm new password */}
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-5 py-4 text-lg border-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-14 ${
                            confirmPassword.length > 0
                              ? passwordsMatch
                                ? 'border-green-300'
                                : 'border-red-300'
                              : 'border-gray-300'
                          }`}
                          placeholder="새 비밀번호를 다시 입력하세요"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="mt-2 text-base text-red-600">비밀번호가 일치하지 않습니다.</p>
                      )}
                      {confirmPassword.length > 0 && passwordsMatch && (
                        <p className="mt-2 text-base text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          비밀번호가 일치합니다.
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowPasswordModal(false)}
                      >
                        취소
                      </Button>
                      <Button
                        size="lg"
                        onClick={handlePasswordChange}
                        isLoading={passwordLoading}
                        disabled={
                          !currentPassword ||
                          !isPasswordValid(passwordValidation) ||
                          !passwordsMatch
                        }
                      >
                        <Lock className="w-5 h-5 mr-2" />
                        비밀번호 변경
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
