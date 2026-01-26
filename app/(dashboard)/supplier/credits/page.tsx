'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Coins, Plus, History, Wallet, Info, CreditCard, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input } from '@/components/ui'

interface CreditLog {
  id: string
  amount: number
  type: string
  description: string | null
  balanceAfter: number
  createdAt: string
}

// 빠른 충전 금액 (최소 10만원)
const quickAmounts = [
  { amount: 100000, label: '10만원' },
  { amount: 200000, label: '20만원' },
  { amount: 300000, label: '30만원' },
  { amount: 500000, label: '50만원' },
]

const MIN_CHARGE_AMOUNT = 100000 // 최소 충전 금액 10만원

export default function SupplierCreditsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [creditBalance, setCreditBalance] = useState(0)
  const [creditHistory, setCreditHistory] = useState<CreditLog[]>([])
  const [chargeAmount, setChargeAmount] = useState<string>('')
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null)
  const [charging, setCharging] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchCreditData()
    }
  }, [session])

  const fetchCreditData = async () => {
    try {
      const res = await fetch('/api/supplier/credits')
      if (res.ok) {
        const data = await res.json()
        setCreditBalance(data.balance || 0)
        setCreditHistory(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch credit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSelect = (index: number, amount: number) => {
    setSelectedQuick(index)
    setChargeAmount(amount.toString())
  }

  const handleCustomAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setChargeAmount(numericValue)
    setSelectedQuick(null)
  }

  const handlePurchase = async () => {
    const amount = parseInt(chargeAmount)
    if (!amount || amount < MIN_CHARGE_AMOUNT) {
      alert(`최소 충전 금액은 ${MIN_CHARGE_AMOUNT.toLocaleString()}원입니다.`)
      return
    }

    setCharging(true)
    try {
      const res = await fetch('/api/supplier/credits/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(`${amount.toLocaleString()}원이 충전되었습니다.`)
        setChargeAmount('')
        setSelectedQuick(null)
        fetchCreditData() // 데이터 새로고침
      } else {
        // PG 연동 전이면 테스트 모드로 처리
        if (data.testMode) {
          alert(`[테스트 모드] ${amount.toLocaleString()}원이 충전되었습니다.\n\n실제 결제는 PG 연동 후 가능합니다.`)
          fetchCreditData()
        } else {
          alert(data.error || '충전에 실패했습니다.')
        }
      }
    } catch (error) {
      alert('충전 처리 중 오류가 발생했습니다.')
    } finally {
      setCharging(false)
    }
  }

  const displayAmount = chargeAmount ? parseInt(chargeAmount) : 0

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    })
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
            {/* PG 연동 전 안내 */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 font-medium">
                현재 테스트 모드입니다. PG 연동 후 실제 결제가 가능합니다.
              </p>
            </div>

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
              disabled={displayAmount < MIN_CHARGE_AMOUNT || charging}
              onClick={handlePurchase}
            >
              {charging ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-6 h-6 mr-2" />
              )}
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
            {creditHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">아직 사용 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {creditHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between py-4 px-4 rounded-xl ${
                      item.type === 'refund' ? 'bg-green-50' :
                      item.type === 'charge' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.type === 'refund' && <RefreshCw className="w-5 h-5 text-green-600" />}
                      {item.type === 'charge' && <Plus className="w-5 h-5 text-blue-600" />}
                      {item.type === 'use' && <XCircle className="w-5 h-5 text-red-500" />}
                      <div>
                        <p className="text-lg font-medium text-gray-900">{item.description || '크레딧 변동'}</p>
                        <p className="text-base text-gray-500">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xl font-bold ${
                          item.amount > 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}원
                      </span>
                      <p className="text-sm text-gray-500">
                        잔액: {item.balanceAfter.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 수수료 안내 */}
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
                  <span>거래 성사 시 수수료가 차감됩니다.</span>
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
                  <span>거래 성사 시: <strong>거래금액의 3%</strong> 차감</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>구매자는 수수료 없음</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
