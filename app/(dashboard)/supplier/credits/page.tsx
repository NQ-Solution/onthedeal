'use client'

import { useState } from 'react'
import { Coins, Plus, History, Wallet, Info, CreditCard, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input } from '@/components/ui'

// Mock data - 1:1 크레딧 시스템 (1크레딧 = 1원)
const creditBalance = 150000  // 15만원
const creditHistory = [
  {
    id: '1',
    type: 'charge',
    amount: 200000,
    description: '크레딧 충전',
    created_at: '2024-02-01',
  },
  {
    id: '2',
    type: 'use',
    amount: -15000,
    description: '견적 제출 선차감: 한우 등심 대량 구매',
    created_at: '2024-02-02',
  },
  {
    id: '3',
    type: 'refund',
    amount: 15000,
    description: '거래 미확정 환불: 한우 등심 대량 구매',
    created_at: '2024-02-05',
  },
  {
    id: '4',
    type: 'use',
    amount: -18000,
    description: '견적 제출 선차감: 유기농 채소 세트',
    created_at: '2024-02-06',
  },
  {
    id: '5',
    type: 'confirm',
    amount: 0,
    description: '거래 확정: 유기농 채소 세트 (환불 불가)',
    created_at: '2024-02-08',
  },
  {
    id: '6',
    type: 'use',
    amount: -12000,
    description: '견적 제출 선차감: 수입 과일 모음',
    created_at: '2024-02-09',
  },
]

// 빠른 충전 금액 (최소 10만원)
const quickAmounts = [
  { amount: 100000, label: '10만원' },
  { amount: 200000, label: '20만원' },
  { amount: 300000, label: '30만원' },
  { amount: 500000, label: '50만원' },
]

const MIN_CHARGE_AMOUNT = 100000 // 최소 충전 금액 10만원

export default function SupplierCreditsPage() {
  const [chargeAmount, setChargeAmount] = useState<string>('')
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null)

  const handleQuickSelect = (index: number, amount: number) => {
    setSelectedQuick(index)
    setChargeAmount(amount.toString())
  }

  const handleCustomAmount = (value: string) => {
    // 숫자만 입력 가능
    const numericValue = value.replace(/[^0-9]/g, '')
    setChargeAmount(numericValue)
    setSelectedQuick(null)
  }

  const handlePurchase = () => {
    const amount = parseInt(chargeAmount)
    if (amount && amount >= MIN_CHARGE_AMOUNT) {
      alert(`${amount.toLocaleString()}원 충전을 진행합니다.\n(${amount.toLocaleString()} 크레딧이 충전됩니다)`)
    } else {
      alert(`최소 충전 금액은 ${MIN_CHARGE_AMOUNT.toLocaleString()}원입니다.`)
    }
  }

  const displayAmount = chargeAmount ? parseInt(chargeAmount) : 0

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">크레딧 관리</h1>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-xl">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-lg">보유 크레딧</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-5xl font-bold">{creditBalance.toLocaleString()}</p>
                <span className="text-2xl text-primary-100">원</span>
              </div>
              <p className="text-primary-200 mt-2">1 크레딧 = 1원</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4">
              <Wallet className="w-16 h-16 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Purchase Credits */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              크레딧 충전
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 빠른 선택 */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">빠른 선택</label>
              <div className="grid grid-cols-2 gap-4">
                {quickAmounts.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleQuickSelect(index, item.amount)}
                    className={`p-5 border-2 rounded-2xl transition-all text-center ${
                      selectedQuick === index
                        ? 'border-primary-500 bg-primary-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <p className="text-2xl font-bold text-gray-900">{item.label}</p>
                    <p className="text-base text-gray-500 mt-1">
                      {item.amount.toLocaleString()} 크레딧
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 직접 입력 */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                직접 입력
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={chargeAmount ? parseInt(chargeAmount).toLocaleString() : ''}
                  onChange={(e) => handleCustomAmount(e.target.value.replace(/,/g, ''))}
                  placeholder="충전할 금액을 입력하세요"
                  className="text-xl pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  원
                </span>
              </div>
              <p className="text-base text-gray-500 mt-2">
                최소 충전 금액: <strong className="text-primary-600">{MIN_CHARGE_AMOUNT.toLocaleString()}원</strong>
              </p>
            </div>

            {/* 충전 금액 확인 */}
            {displayAmount >= MIN_CHARGE_AMOUNT && (
              <div className="bg-primary-50 rounded-2xl p-5 border-2 border-primary-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-700">충전 금액</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {displayAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-primary-200">
                  <span className="text-lg text-gray-700">충전 크레딧</span>
                  <span className="text-2xl font-bold text-primary-600">
                    +{displayAmount.toLocaleString()} 크레딧
                  </span>
                </div>
              </div>
            )}

            <Button
              size="xl"
              className="w-full"
              disabled={displayAmount < MIN_CHARGE_AMOUNT}
              onClick={handlePurchase}
            >
              <CreditCard className="w-6 h-6 mr-2" />
              {displayAmount >= MIN_CHARGE_AMOUNT
                ? `${displayAmount.toLocaleString()}원 충전하기`
                : `최소 ${MIN_CHARGE_AMOUNT.toLocaleString()}원 이상 입력하세요`
              }
            </Button>
          </CardContent>
        </Card>

        {/* Credit History */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-gray-600" />
              </div>
              사용 내역
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {creditHistory.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between py-4 px-4 rounded-xl ${
                    item.type === 'refund' ? 'bg-green-50' :
                    item.type === 'confirm' ? 'bg-yellow-50' :
                    item.type === 'charge' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.type === 'refund' && <RefreshCw className="w-5 h-5 text-green-600" />}
                    {item.type === 'confirm' && <CheckCircle className="w-5 h-5 text-yellow-600" />}
                    {item.type === 'charge' && <Plus className="w-5 h-5 text-blue-600" />}
                    {item.type === 'use' && <XCircle className="w-5 h-5 text-red-500" />}
                    <div>
                      <p className="text-lg font-medium text-gray-900">{item.description}</p>
                      <p className="text-base text-gray-500">{item.created_at}</p>
                    </div>
                  </div>
                  {item.amount !== 0 && (
                    <span
                      className={`text-xl font-bold ${
                        item.amount > 0 ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}원
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 환불 정책 */}
      <Card className="shadow-lg border-2 border-green-200 bg-green-50">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-900">환불 정책</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h4 className="text-lg font-bold text-green-800">환불 가능</h4>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>3일 내 거래 미확정 시 <strong className="text-green-700">전액 환불</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>충전 후 미사용 크레딧 환불 가능</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <h4 className="text-lg font-bold text-red-800">환불 불가</h4>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>거래 확정 시 <strong className="text-red-700">환불 불가</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>구매자가 거래를 확정하면 크레딧 차감 유지</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="shadow-lg border-2">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">크레딧 안내</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">크레딧이란?</h4>
              <ul className="space-y-3 text-lg text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>1 크레딧 = 1원 (1:1 비율)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>견적 제출 시 선차감됩니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>최소 충전 금액: <strong>{MIN_CHARGE_AMOUNT.toLocaleString()}원</strong></span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">수수료 안내</h4>
              <ul className="space-y-3 text-lg text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>견적 제출 시: <strong>구매 희망가(최소)의 3%</strong> 선차감</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>크레딧 유효기간: 충전일로부터 1년</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 수수료 플로우 안내 */}
          <div className="mt-6 bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
            <h4 className="text-lg font-bold text-blue-900 mb-4">수수료 플로우</h4>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center p-4 bg-white rounded-xl flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="font-bold text-gray-900">견적 제출</p>
                <p className="text-sm text-gray-500 mt-1">구매 희망가의 3%<br/>선차감</p>
              </div>
              <div className="text-2xl text-gray-300">→</div>
              <div className="text-center p-4 bg-white rounded-xl flex-1">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-600 font-bold">2</span>
                </div>
                <p className="font-bold text-gray-900">거래 협의</p>
                <p className="text-sm text-gray-500 mt-1">채팅으로 협의<br/>(3일 기한)</p>
              </div>
              <div className="text-2xl text-gray-300">→</div>
              <div className="text-center p-4 bg-white rounded-xl flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <p className="font-bold text-gray-900">결과</p>
                <p className="text-sm text-gray-500 mt-1">확정 시 유지<br/>미확정 시 환불</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
