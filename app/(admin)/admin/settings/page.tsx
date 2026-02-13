'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, Mail, Phone, MapPin, Percent, Clock, Bell, Shield, Database, CreditCard, Building, Zap, Star, Users, MessageSquare, Briefcase, Landmark } from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Textarea, Badge } from '@/components/ui'
import { DEFAULT_FEE_SETTINGS, FeeSettings } from '@/types'

interface SiteSettings {
  // 기본 정보
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string

  // 사업자 정보
  ceoName: string
  businessNumber: string
  businessAddress: string

  // 입금 계좌 정보
  bankName: string
  bankAccount: string
  bankHolder: string

  // 알림 설정
  emailNotifications: boolean
  smsNotifications: boolean
  adminAlertEmail: string

  // 운영 시간
  businessHoursStart: string
  businessHoursEnd: string
  businessDays: string

  // 수수료 설정
  firstTradeCommissionRate: number
  repeatTradeCommissionRate: number
  buyerCardPaymentRate: number
  buyerBankTransferRate: number
  chatExpiryDays: number
  maxProposalsPerHour: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'OnTheDeal',
    siteDescription: 'B2B 식자재 거래 플랫폼',
    contactEmail: 'support@onthedeal.com',
    contactPhone: '02-1234-5678',
    address: '서울특별시 강남구 테헤란로 123 온더딜 빌딩 10층',

    // 사업자 정보
    ceoName: '',
    businessNumber: '',
    businessAddress: '',

    // 입금 계좌 정보
    bankName: '',
    bankAccount: '',
    bankHolder: '',

    emailNotifications: true,
    smsNotifications: true,
    adminAlertEmail: 'admin@onthedeal.com',

    businessHoursStart: '09:00',
    businessHoursEnd: '18:00',
    businessDays: '월-금',

    // 수수료 설정
    firstTradeCommissionRate: DEFAULT_FEE_SETTINGS.firstTradeCommissionRate,
    repeatTradeCommissionRate: DEFAULT_FEE_SETTINGS.repeatTradeCommissionRate,
    buyerCardPaymentRate: DEFAULT_FEE_SETTINGS.buyerCardPaymentRate,
    buyerBankTransferRate: DEFAULT_FEE_SETTINGS.buyerBankTransferRate,
    chatExpiryDays: DEFAULT_FEE_SETTINGS.chatExpiryDays,
    maxProposalsPerHour: DEFAULT_FEE_SETTINGS.maxProposalsPerHour,
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'fees'>('general')
  const [loading, setLoading] = useState(true)

  // 설정 데이터 로드
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(prev => ({
            ...prev,
            siteName: data.siteName || prev.siteName,
            siteDescription: data.siteDescription || prev.siteDescription,
            contactEmail: data.contactEmail || prev.contactEmail,
            contactPhone: data.contactPhone || prev.contactPhone,
            address: data.address || prev.address,
            ceoName: data.ceoName || '',
            businessNumber: data.businessNumber || '',
            businessAddress: data.businessAddress || '',
            bankName: data.bankName || '',
            bankAccount: data.bankAccount || '',
            bankHolder: data.bankHolder || '',
            emailNotifications: data.emailNotifications ?? prev.emailNotifications,
            smsNotifications: data.smsNotifications ?? prev.smsNotifications,
            adminAlertEmail: data.adminAlertEmail || prev.adminAlertEmail,
            businessHoursStart: data.businessHoursStart || prev.businessHoursStart,
            businessHoursEnd: data.businessHoursEnd || prev.businessHoursEnd,
            businessDays: data.businessDays || prev.businessDays,
            // 수수료 설정
            firstTradeCommissionRate: data.firstTradeCommissionRate ?? prev.firstTradeCommissionRate,
            repeatTradeCommissionRate: data.repeatTradeCommissionRate ?? prev.repeatTradeCommissionRate,
            buyerCardPaymentRate: data.buyerCardPaymentRate ?? prev.buyerCardPaymentRate,
            buyerBankTransferRate: data.buyerBankTransferRate ?? prev.buyerBankTransferRate,
            chatExpiryDays: data.chatExpiryDays ?? prev.chatExpiryDays,
            maxProposalsPerHour: data.maxProposalsPerHour ?? prev.maxProposalsPerHour,
          }))
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleNumberChange = (key: keyof SiteSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">사이트 설정</h2>
          <p className="text-gray-500 break-keep">플랫폼 전반의 설정을 관리합니다</p>
        </div>
        <Button
          size="lg"
          onClick={handleSave}
          isLoading={saving}
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {saved ? (
            <>저장 완료!</>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              설정 저장
            </>
          )}
        </Button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'general'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('general')}
        >
          일반 설정
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
            activeTab === 'fees'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('fees')}
        >
          <Percent className="w-4 h-4" />
          수수료 설정
        </button>
      </div>

      {/* 일반 설정 탭 */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-600" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="사이트 이름"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
              />
              <Textarea
                label="사이트 설명"
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                rows={2}
              />
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                연락처 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="대표 이메일"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                />
                <Input
                  label="대표 전화번호"
                  value={settings.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                />
              </div>
              <Input
                label="주소"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </CardContent>
          </Card>

          {/* 사업자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                사업자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="대표자명"
                  value={settings.ceoName}
                  onChange={(e) => handleChange('ceoName', e.target.value)}
                  placeholder="홍길동"
                />
                <Input
                  label="사업자등록번호"
                  value={settings.businessNumber}
                  onChange={(e) => handleChange('businessNumber', e.target.value)}
                  placeholder="000-00-00000"
                />
              </div>
              <Input
                label="사업자 주소"
                value={settings.businessAddress}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                placeholder="사업자등록증상의 주소"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="대표 전화번호"
                  value={settings.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  placeholder="02-1234-5678"
                />
                <Input
                  label="대표 이메일"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              <p className="text-sm text-gray-500">
                * 입력된 사업자 정보는 사이트 하단 푸터에 표시됩니다.
              </p>
            </CardContent>
          </Card>

          {/* 입금 계좌 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                입금 계좌 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="은행명"
                value={settings.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="예: 신한은행"
              />
              <Input
                label="계좌번호"
                value={settings.bankAccount}
                onChange={(e) => handleChange('bankAccount', e.target.value)}
                placeholder="예: 110-123-456789"
              />
              <Input
                label="예금주"
                value={settings.bankHolder}
                onChange={(e) => handleChange('bankHolder', e.target.value)}
                placeholder="예: (주)온더딜"
              />
              <p className="text-sm text-gray-500">
                * 이 계좌 정보는 공급자 크레딧 충전 시 표시됩니다.
              </p>
            </CardContent>
          </Card>

          {/* 알림 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                알림 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 whitespace-nowrap">이메일 알림</p>
                  <p className="text-sm text-gray-500 break-keep">새로운 활동에 대한 이메일 알림</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 whitespace-nowrap">SMS 알림</p>
                  <p className="text-sm text-gray-500 break-keep">중요한 알림에 대한 SMS 발송</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              <Input
                label="관리자 알림 이메일"
                type="email"
                value={settings.adminAlertEmail}
                onChange={(e) => handleChange('adminAlertEmail', e.target.value)}
              />
            </CardContent>
          </Card>

          {/* 운영 시간 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                운영 시간
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="영업 시작"
                  type="time"
                  value={settings.businessHoursStart}
                  onChange={(e) => handleChange('businessHoursStart', e.target.value)}
                />
                <Input
                  label="영업 종료"
                  type="time"
                  value={settings.businessHoursEnd}
                  onChange={(e) => handleChange('businessHoursEnd', e.target.value)}
                />
              </div>
              <Input
                label="영업일"
                value={settings.businessDays}
                onChange={(e) => handleChange('businessDays', e.target.value)}
                placeholder="예: 월-금"
              />
            </CardContent>
          </Card>

          {/* 시스템 정보 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-600" />
                시스템 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">버전</p>
                  <p className="text-lg font-mono font-bold">v1.0.0</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">데이터베이스</p>
                  <p className="text-lg font-mono font-bold text-green-600">Connected</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">마지막 백업</p>
                  <p className="text-lg font-mono">{new Date().toLocaleDateString('ko-KR')}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">환경</p>
                  <p className="text-lg font-mono text-blue-600">Production</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 수수료 설정 탭 */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* 수수료 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-primary-100 whitespace-nowrap">첫 거래 수수료</p>
                    <p className="text-3xl font-bold">{settings.firstTradeCommissionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-green-100 whitespace-nowrap">연속 거래 수수료</p>
                    <p className="text-3xl font-bold">{settings.repeatTradeCommissionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-blue-100 whitespace-nowrap">카드결제 수수료</p>
                    <p className="text-3xl font-bold">{settings.buyerCardPaymentRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Building className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-yellow-100 whitespace-nowrap">계좌이체 수수료</p>
                    <p className="text-3xl font-bold">{settings.buyerBankTransferRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 공급자 수수료 (거래 수수료) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-primary-600" />
                  거래 수수료 (공급자)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 whitespace-nowrap">첫 거래 수수료율</p>
                      <p className="text-sm text-gray-500 break-keep">해당 구매자와 첫 거래 시 적용</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={settings.firstTradeCommissionRate}
                      onChange={(e) => handleNumberChange('firstTradeCommissionRate', Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-24"
                    />
                    <span className="text-gray-500 font-medium">%</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      예: 100만원 거래 → {(1000000 * settings.firstTradeCommissionRate / 100).toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 whitespace-nowrap">연속 거래 수수료율</p>
                      <p className="text-sm text-gray-500 break-keep">같은 구매자와 재거래 시 할인 적용</p>
                    </div>
                    <Badge variant="success" className="ml-auto">할인</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={settings.repeatTradeCommissionRate}
                      onChange={(e) => handleNumberChange('repeatTradeCommissionRate', Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-24"
                    />
                    <span className="text-gray-500 font-medium">%</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      예: 100만원 거래 → {(1000000 * settings.repeatTradeCommissionRate / 100).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 구매자 수수료 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  결제 수수료 (구매자)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 whitespace-nowrap">카드결제 수수료율</p>
                      <p className="text-sm text-gray-500 break-keep">PG사 수수료 포함</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={settings.buyerCardPaymentRate}
                      onChange={(e) => handleNumberChange('buyerCardPaymentRate', Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-24"
                    />
                    <span className="text-gray-500 font-medium">%</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      예: 100만원 → {(1000000 * (1 + settings.buyerCardPaymentRate / 100)).toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 whitespace-nowrap">계좌이체 수수료율</p>
                      <p className="text-sm text-gray-500 break-keep">직접 송금</p>
                    </div>
                    <Badge variant="success" className="ml-auto">활성</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={settings.buyerBankTransferRate}
                      onChange={(e) => handleNumberChange('buyerBankTransferRate', Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-24"
                    />
                    <span className="text-gray-500 font-medium">%</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      예: 100만원 → {(1000000 * (1 + settings.buyerBankTransferRate / 100)).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 채팅 및 운영 설정 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  채팅 및 운영 설정
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 whitespace-nowrap">채팅방 만료일</p>
                        <p className="text-sm text-gray-500 break-keep">거래 미확정 시 자동 만료</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={settings.chatExpiryDays}
                        onChange={(e) => handleNumberChange('chatExpiryDays', Number(e.target.value))}
                        min={1}
                        max={30}
                        className="w-24"
                      />
                      <span className="text-gray-500 font-medium">일</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 whitespace-nowrap">시간당 최대 제안수</p>
                        <p className="text-sm text-gray-500 break-keep">0 = 무제한 (초기 오픈)</p>
                      </div>
                      {settings.maxProposalsPerHour === 0 && (
                        <Badge variant="info" className="ml-auto">무제한</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={settings.maxProposalsPerHour}
                        onChange={(e) => handleNumberChange('maxProposalsPerHour', Number(e.target.value))}
                        min={0}
                        max={100}
                        className="w-24"
                      />
                      <span className="text-gray-500 font-medium">건/시간</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
