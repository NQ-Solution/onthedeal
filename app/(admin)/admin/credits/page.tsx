'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Coins, History, Users, Loader2, CheckCircle, Building2 } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Textarea, Select } from '@/components/ui'

interface Supplier {
  id: string
  email: string
  companyName: string
  contactName: string
  credit: {
    balance: number
  } | null
}

interface CreditLog {
  id: string
  amount: number
  type: string
  description: string | null
  balanceAfter: number
  createdAt: string
  supplier: {
    companyName: string
    email: string
  }
}

export default function AdminCreditsPage() {
  const [loading, setLoading] = useState(true)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [recentLogs, setRecentLogs] = useState<CreditLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [chargeAmount, setChargeAmount] = useState('')
  const [chargeDescription, setChargeDescription] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/credits')
      if (res.ok) {
        const data = await res.json()
        setSuppliers(data.suppliers || [])
        setRecentLogs(data.recentLogs || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    // 클라이언트 사이드 검색
    // 실제로는 API에서 검색 가능
  }

  const filteredSuppliers = suppliers.filter(s => {
    if (!searchTerm) return true
    return (
      s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleChargeCredit = async () => {
    if (!selectedSupplier) {
      alert('공급자를 선택해주세요.')
      return
    }

    const amount = parseInt(chargeAmount)
    if (!amount || amount <= 0) {
      alert('유효한 금액을 입력해주세요.')
      return
    }

    if (!chargeDescription.trim()) {
      alert('충전 사유를 입력해주세요.')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier.id,
          amount,
          description: chargeDescription,
        }),
      })

      if (res.ok) {
        setShowSuccess(true)
        setSelectedSupplier(null)
        setChargeAmount('')
        setChargeDescription('')
        fetchData() // 새로고침
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const data = await res.json()
        alert(data.error || '크레딧 충전에 실패했습니다.')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">크레딧 관리</h1>
      </div>

      {/* 성공 메시지 */}
      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <p className="text-green-800 font-medium">크레딧이 성공적으로 충전되었습니다.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 크레딧 충전 */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              크레딧 충전하기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 공급자 검색 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">공급자 검색</label>
              <div className="relative mb-3">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="회사명, 이메일, 담당자명 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>

              {/* 검색 결과 */}
              {searchTerm && (
                <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-xl">
                  {filteredSuppliers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">검색 결과가 없습니다</div>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <button
                        key={supplier.id}
                        onClick={() => {
                          setSelectedSupplier(supplier)
                          setSearchTerm('')
                        }}
                        className="w-full p-4 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                      >
                        <p className="font-bold text-gray-900">{supplier.companyName}</p>
                        <p className="text-sm text-gray-500">{supplier.email}</p>
                        <p className="text-sm text-primary-600 mt-1">
                          현재 잔액: {(supplier.credit?.balance || 0).toLocaleString()}원
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 선택된 공급자 */}
            {selectedSupplier && (
              <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{selectedSupplier.companyName}</p>
                    <p className="text-sm text-gray-600">{selectedSupplier.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">현재 잔액</p>
                    <p className="text-xl font-bold text-primary-600">
                      {(selectedSupplier.credit?.balance || 0).toLocaleString()}원
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                >
                  다른 공급자 선택
                </button>
              </div>
            )}

            {/* 충전 금액 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">충전 금액</label>
              <div className="relative">
                <Input
                  type="text"
                  value={chargeAmount ? parseInt(chargeAmount).toLocaleString() : ''}
                  onChange={(e) => setChargeAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="충전할 금액 입력"
                  className="text-xl pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>

              {/* 빠른 금액 선택 */}
              <div className="flex gap-2 mt-3">
                {[100000, 300000, 500000, 1000000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setChargeAmount(amount.toString())}
                    className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    {(amount / 10000).toLocaleString()}만
                  </button>
                ))}
              </div>
            </div>

            {/* 충전 사유 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">충전 사유</label>
              <Textarea
                value={chargeDescription}
                onChange={(e) => setChargeDescription(e.target.value)}
                placeholder="예: 계좌이체 입금 확인 (입금자: 홍길동)"
                rows={2}
              />
            </div>

            {/* 충전 버튼 */}
            <Button
              size="xl"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleChargeCredit}
              disabled={!selectedSupplier || !chargeAmount || !chargeDescription || processing}
            >
              {processing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Coins className="w-5 h-5 mr-2" />
              )}
              {chargeAmount && parseInt(chargeAmount) > 0
                ? `${parseInt(chargeAmount).toLocaleString()}원 충전하기`
                : '크레딧 충전하기'}
            </Button>
          </CardContent>
        </Card>

        {/* 최근 충전 내역 */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-gray-600" />
              </div>
              최근 충전 내역
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>최근 충전 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{log.supplier.companyName}</p>
                        <p className="text-sm text-gray-500">{log.supplier.email}</p>
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        +{log.amount.toLocaleString()}원
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{log.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(log.createdAt)}</span>
                      <span>잔액: {log.balanceAfter.toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 전체 공급자 목록 */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            공급자 크레딧 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">회사명</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">이메일</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">담당자</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">크레딧 잔액</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">충전</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{supplier.companyName}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{supplier.email}</td>
                    <td className="px-6 py-4 text-gray-600">{supplier.contactName}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-primary-600">
                        {(supplier.credit?.balance || 0).toLocaleString()}원
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSupplier(supplier)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        충전
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {suppliers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                등록된 공급자가 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
