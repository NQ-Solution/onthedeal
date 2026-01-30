'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Coins, Plus, History, Wallet, Info, CreditCard, RefreshCw, CheckCircle, XCircle, Loader2, Building2, Copy, Check } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input } from '@/components/ui'

interface CreditLog {
  id: string
  amount: number
  type: string
  description: string | null
  balanceAfter: number
  createdAt: string
}

// 충전 금액 옵션
const quickAmounts = [
  { amount: 100000, label: '10만원' },
  { amount: 300000, label: '30만원' },
  { amount: 500000, label: '50만원' },
  { amount: 1000000, label: '100만원' },
]

const MIN_CHARGE_AMOUNT = 100000 // 최소 충전 금액 10만원

interface BankInfo {
  bank: string
  account: string
  holder: string
}

export default function SupplierCreditsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [creditBalance, setCreditBalance] = useState(0)
  const [creditHistory, setCreditHistory] = useState<CreditLog[]>([])
  const [chargeAmount, setChargeAmount] = useState<string>('')
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null)
  const [charging, setCharging] = useState(false)
  const [showDepositInfo, setShowDepositInfo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bank: '',
    account: '',
    holder: '',
  })

  useEffect(() => {
    fetchBankInfo()
    if (session?.user?.id) {
      fetchCreditData()
    }
  }, [session])

  const fetchBankInfo = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setBankInfo({
          bank: data.bankName || '계좌 정보 미등록',
          account: data.bankAccount || '-',
          holder: data.bankHolder || '-',
        })
      }
    } catch (error) {
      console.error('Failed to fetch bank info:', error)
    }
  }

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

  const handlePurchase = () => {
    const amount = parseInt(chargeAmount)
    if (!amount || amount < MIN_CHARGE_AMOUNT) {
      alert(`최소 충전 금액은 ${MIN_CHARGE_AMOUNT.toLocaleString()}원입니다.`)
      return
    }
    // 입금 정보 표시
    setShowDepositInfo(true)
  }

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(bankInfo.account)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDepositComplete = async () => {
    const amount = parseInt(chargeAmount)
    if (!amount) return

    setCharging(true)
    try {
      const res = await fetch('/api/supplier/credits/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('입금 확인 요청이 접수되었습니다.\n관리자 확인 후 크레딧이 충전됩니다.')
        setShowDepositInfo(false)
        setChargeAmount('')
        setSelectedQuick(null)
        fetchCreditData() // 데이터 새로고침
      } else {
        alert(data.error || '요청에 실패했습니다.')
      }
    } catch (error) {
      alert('요청 중 오류가 발생했습니다.')
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
            {/* 계좌이체 안내 */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <p className="text-blue-800 font-bold">계좌이체로 충전</p>
              </div>
              <p className="text-blue-700 text-sm">
                PG 결제 연동 준비 중입니다. 아래 계좌로 입금 후 크레딧이 충전됩니다.
              </p>
            </div>

            {!showDepositInfo ? (
              <>
                {/* 금액 선택 */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">충전 금액 선택</label>
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
                  <Building2 className="w-6 h-6 mr-2" />
                  {displayAmount >= MIN_CHARGE_AMOUNT
                    ? `입금 정보 확인하기`
                    : `최소 ${MIN_CHARGE_AMOUNT.toLocaleString()}원 이상 선택하세요`
                  }
                </Button>
              </>
            ) : (
              /* 입금 정보 표시 */
              <div className="space-y-6">
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    입금 정보
                  </h4>

                  <div className="space-y-4">
                    {/* 입금 계좌 */}
                    <div className="bg-white rounded-xl p-4 border border-green-200">
                      <p className="text-sm text-gray-500 mb-1">입금 계좌</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-gray-900">
                          {bankInfo.bank} {bankInfo.account}
                        </p>
                        <button
                          onClick={copyAccountNumber}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? '복사됨' : '복사'}
                        </button>
                      </div>
                      <p className="text-base text-gray-600 mt-1">예금주: {bankInfo.holder}</p>
                    </div>

                    {/* 입금자 정보 */}
                    <div className="bg-white rounded-xl p-4 border border-green-200">
                      <p className="text-sm text-gray-500 mb-1">입금자명 (필수)</p>
                      <p className="text-xl font-bold text-gray-900">
                        {session?.user?.companyName || session?.user?.name || '-'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">회원 ID</p>
                      <p className="text-base font-mono text-gray-700">{session?.user?.email}</p>
                    </div>

                    {/* 입금 금액 */}
                    <div className="bg-white rounded-xl p-4 border border-green-200">
                      <p className="text-sm text-gray-500 mb-1">입금 금액</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {displayAmount.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>안내:</strong> 위 정보로 입금해 주시면, 확인 후 바로 크레딧이 충전됩니다.
                      영업시간 내 평균 30분 이내 처리됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDepositInfo(false)}
                  >
                    금액 다시 선택
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleDepositComplete}
                    disabled={charging}
                  >
                    {charging ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    )}
                    {charging ? '요청 중...' : '입금 완료'}
                  </Button>
                </div>
              </div>
            )}
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

      {/* 크레딧 안내 */}
      <Card className="shadow-lg border-2">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">크레딧 안내</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 크레딧이란? */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">크레딧이란?</h4>
              <p className="text-gray-600 mb-4">
                판매자가 발주에 금액을 제안하고 거래에 참여하기 위한 금액입니다.
              </p>
              <ul className="space-y-3 text-lg text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>1 크레딧 = 1원</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>제안 시 거래금액의 <strong>3%</strong>가 크레딧으로 차감됩니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>거래가 성사되지 않으면 차감된 크레딧은 <strong>환불</strong>됩니다</span>
                </li>
              </ul>
            </div>

            {/* 수수료 안내 */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">수수료 안내</h4>
              <ul className="space-y-3 text-lg text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>별도 입점비·광고비는 <strong>없습니다</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>성사된 거래에만 <strong>3%</strong>의 크레딧이 차감됩니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>거래 이력은 판매자 신뢰도와 향후 혜택의 기준이 됩니다</span>
                </li>
              </ul>
            </div>

            {/* 초기 판매자 혜택 */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <h4 className="text-lg font-bold text-orange-700 mb-3">초기 판매자 혜택</h4>
              <div className="bg-white/80 rounded-xl p-4 mb-4">
                <p className="text-2xl font-bold text-orange-600 mb-1">첫 크레딧 충전 시 +30% 추가 지급</p>
                <p className="text-gray-600">예) 10만원 충전 → <strong className="text-orange-600">13만원</strong> 크레딧</p>
              </div>
              <ul className="space-y-2 text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>추가 지급분은 거래에 동일하게 사용 가능</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>환불 시 이벤트 지급분은 제외</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
