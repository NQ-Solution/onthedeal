'use client'

import { useState } from 'react'
import { Save, Globe, Mail, Phone, MapPin, Percent, Clock, Bell, Shield, Database, CreditCard, Building, Zap, Star, Users, MessageSquare } from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Textarea, Badge } from '@/components/ui'
import { DEFAULT_FEE_SETTINGS, FeeSettings } from '@/types'

interface SiteSettings {
  // 기본 정보
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string

  // 알림 설정
  emailNotifications: boolean
  smsNotifications: boolean
  adminAlertEmail: string

  // 운영 시간
  businessHoursStart: string
  businessHoursEnd: string
  businessDays: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'OnTheDeal',
    siteDescription: 'B2B 식자재 거래 플랫폼',
    contactEmail: 'support@onthedeal.com',
    contactPhone: '02-1234-5678',
    address: '서울특별시 강남구 테헤란로 123 온더딜 빌딩 10층',

    emailNotifications: true,
    smsNotifications: true,
    adminAlertEmail: 'admin@onthedeal.com',

    businessHoursStart: '09:00',
    businessHoursEnd: '18:00',
    businessDays: '월-금',
  })

  // 수수료 설정 (별도 관리)
  const [feeSettings, setFeeSettings] = useState<FeeSettings>(DEFAULT_FEE_SETTINGS)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'fees'>('general')

  const handleSave = async () => {
    setSaving(true)
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChange = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleFeeChange = (category: keyof FeeSettings, key: string, value: number) => {
    setFeeSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [key]: value,
      },
      updatedAt: new Date().toISOString(),
    }))
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">사이트 설정</h2>
          <p className="text-gray-500">플랫폼 전반의 설정을 관리합니다</p>
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
                  <p className="font-medium text-gray-900">이메일 알림</p>
                  <p className="text-sm text-gray-500">새로운 활동에 대한 이메일 알림</p>
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
                  <p className="font-medium text-gray-900">SMS 알림</p>
                  <p className="text-sm text-gray-500">중요한 알림에 대한 SMS 발송</p>
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
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-blue-100">카드 결제 수수료</p>
                    <p className="text-3xl font-bold">{feeSettings.buyer.cardPaymentRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Building className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-green-100">계좌이체 수수료</p>
                    <p className="text-3xl font-bold">{feeSettings.buyer.bankTransferRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-primary-100">기본 제안 수수료</p>
                    <p className="text-3xl font-bold">{feeSettings.supplier.basic}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 opacity-80" />
                  <div>
                    <p className="text-yellow-100">프리미엄 수수료</p>
                    <p className="text-3xl font-bold">{feeSettings.supplier.premium}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 구매자 수수료 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  구매자 수수료
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">카드 결제</p>
                      <p className="text-sm text-gray-500">PG사 수수료 포함</p>
                    </div>
                    <Badge variant="warning" className="ml-auto">준비 중</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={feeSettings.buyer.cardPaymentRate}
                      onChange={(e) => handleFeeChange('buyer', 'cardPaymentRate', Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-24"
                    />
                    <span className="text-gray-500 font-medium">%</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      예: 100만원 → {(1000000 * (1 + feeSettings.buyer.cardPaymentRate / 100)).toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">계좌 이체</p>
                      <p className="text-sm text-gray-500">직접 송금</p>
                    </div>
                    <Badge variant="success" className="ml-auto">활성</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={feeSettings.buyer.bankTransferRate}
                      onChange={(e) => handleFeeChange('buyer', 'bankTransferRate', Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-24"
                    />
                    <span className="text-gray-500 font-medium">%</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      예: 100만원 → {(1000000 * (1 + feeSettings.buyer.bankTransferRate / 100)).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 공급자 수수료 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-primary-600" />
                  공급자 수수료 (제안 옵션)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">기본 제안</p>
                      <p className="text-sm text-gray-500">일반 노출</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={feeSettings.supplier.basic}
                      onChange={(e) => handleFeeChange('supplier', 'basic', Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-24"
                    />
                    <span className="text-gray-500 font-medium">%</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      예: 100만원 거래 → {(1000000 * feeSettings.supplier.basic / 100).toLocaleString()}원 차감
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">상위 노출 (프리미엄)</p>
                      <p className="text-sm text-gray-500">구매자 채팅창 우선 표시</p>
                    </div>
                    <Badge variant="warning" className="ml-auto">추천</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={feeSettings.supplier.premium}
                      onChange={(e) => handleFeeChange('supplier', 'premium', Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-24"
                    />
                    <span className="text-gray-500 font-medium">%</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      예: 100만원 거래 → {(1000000 * feeSettings.supplier.premium / 100).toLocaleString()}원 차감
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 채팅 설정 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  채팅 설정
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
                        <p className="font-bold text-gray-900">채팅 만료일</p>
                        <p className="text-sm text-gray-500">거래 미확정 시 자동 삭제</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={feeSettings.chat.expiryDays}
                        onChange={(e) => handleFeeChange('chat', 'expiryDays', Number(e.target.value))}
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
                        <p className="font-bold text-gray-900">시간당 제안 제한</p>
                        <p className="text-sm text-gray-500">0 = 무제한 (초기 오픈)</p>
                      </div>
                      {feeSettings.chat.maxProposalsPerHour === 0 && (
                        <Badge variant="info" className="ml-auto">무제한</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={feeSettings.chat.maxProposalsPerHour}
                        onChange={(e) => handleFeeChange('chat', 'maxProposalsPerHour', Number(e.target.value))}
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

          {/* 마지막 업데이트 */}
          <div className="text-center text-sm text-gray-400">
            마지막 수정: {new Date(feeSettings.updatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
          </div>
        </div>
      )}
    </div>
  )
}
