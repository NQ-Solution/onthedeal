'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Printer, Loader2, ArrowLeft } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import Link from 'next/link'

interface InvoiceItem {
  name: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
}

interface InvoiceDetail {
  id: string
  invoiceNumber: string
  orderId: string
  productAmount: number
  commissionRate: number
  commissionAmount: number
  totalAmount: number
  isRepeatTrade: boolean
  status: string
  issuedAt: string
  confirmedAt: string | null
  cancelledAt: string | null
  notes: string | null
  items: InvoiceItem[]
  order: {
    id: string
    status: string
    paymentMethod: string
    createdAt: string
    rfq: {
      title: string
      category: string
      quantity: number
      unit: string
      deliveryDate: string
      deliveryAddress: string
    }
  }
  buyer: {
    id: string
    companyName: string
    contactName: string
    phone: string
    businessNumber: string | null
    representativeName: string | null
    address: string | null
    storeAddress: string | null
    fax: string | null
  }
  supplier: {
    id: string
    companyName: string
    contactName: string
    phone: string
    businessNumber: string | null
    representativeName: string | null
    address: string | null
    storeAddress: string | null
    fax: string | null
  }
}

const formatPrice = (price: number) => `${price.toLocaleString()}원`
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string)
    }
  }, [params.id])

  const fetchInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`)
      if (res.ok) {
        const data = await res.json()
        setInvoice(data)
      } else {
        const errData = await res.json()
        setError(errData.error || '명세표를 불러올 수 없습니다')
      }
    } catch (err) {
      setError('명세표를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-red-500">{error || '명세표를 찾을 수 없습니다'}</p>
        <Link href="/" className="text-primary-600 hover:underline mt-4 inline-block">
          돌아가기
        </Link>
      </div>
    )
  }

  const items = (invoice.items || []) as InvoiceItem[]

  return (
    <>
      {/* 인쇄용 스타일 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 15mm;
            size: A4;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* 상단 액션 바 */}
        <div className="flex items-center justify-between no-print">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">뒤로가기</span>
          </button>
          <Button onClick={handlePrint} size="lg">
            <Printer className="w-5 h-5 mr-2" />
            인쇄하기
          </Button>
        </div>

        {/* 명세표 본문 */}
        <div className="print-area">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 lg:p-12">
              {/* 헤더 */}
              <div className="text-center mb-10 border-b-4 border-gray-900 pb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">거 래 명 세 표</h1>
                <div className="flex items-center justify-center gap-6 text-lg text-gray-600">
                  <span className="font-mono whitespace-nowrap">{invoice.invoiceNumber}</span>
                  <span className="whitespace-nowrap">{formatDate(invoice.issuedAt)}</span>
                  {invoice.isRepeatTrade && (
                    <Badge variant="success">연속거래</Badge>
                  )}
                </div>
              </div>

              {/* 거래 당사자 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* 공급자 (발행자) */}
                <div className="border-2 border-gray-300 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 whitespace-nowrap">공급자 (발행자)</h3>
                  <div className="space-y-2 text-base">
                    <div className="flex">
                      <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">상호</span>
                      <span className="font-medium text-gray-900 break-keep">{invoice.supplier.companyName}</span>
                    </div>
                    {invoice.supplier.representativeName && (
                      <div className="flex">
                        <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">대표자</span>
                        <span className="text-gray-900">{invoice.supplier.representativeName}</span>
                      </div>
                    )}
                    {invoice.supplier.businessNumber && (
                      <div className="flex">
                        <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">사업자번호</span>
                        <span className="font-mono text-gray-900">{invoice.supplier.businessNumber}</span>
                      </div>
                    )}
                    {(invoice.supplier.storeAddress || invoice.supplier.address) && (
                      <div className="flex">
                        <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">주소</span>
                        <span className="text-gray-900 break-keep">{invoice.supplier.storeAddress || invoice.supplier.address}</span>
                      </div>
                    )}
                    <div className="flex">
                      <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">연락처</span>
                      <span className="text-gray-900">{invoice.supplier.phone}</span>
                    </div>
                    {invoice.supplier.fax && (
                      <div className="flex">
                        <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">팩스</span>
                        <span className="text-gray-900">{invoice.supplier.fax}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 구매자 */}
                <div className="border-2 border-gray-300 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 whitespace-nowrap">구매자</h3>
                  <div className="space-y-2 text-base">
                    <div className="flex">
                      <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">상호</span>
                      <span className="font-medium text-gray-900 break-keep">{invoice.buyer.companyName}</span>
                    </div>
                    {invoice.buyer.representativeName && (
                      <div className="flex">
                        <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">대표자</span>
                        <span className="text-gray-900">{invoice.buyer.representativeName}</span>
                      </div>
                    )}
                    {invoice.buyer.businessNumber && (
                      <div className="flex">
                        <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">사업자번호</span>
                        <span className="font-mono text-gray-900">{invoice.buyer.businessNumber}</span>
                      </div>
                    )}
                    {(invoice.buyer.storeAddress || invoice.buyer.address) && (
                      <div className="flex">
                        <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">주소</span>
                        <span className="text-gray-900 break-keep">{invoice.buyer.storeAddress || invoice.buyer.address}</span>
                      </div>
                    )}
                    <div className="flex">
                      <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">연락처</span>
                      <span className="text-gray-900">{invoice.buyer.phone}</span>
                    </div>
                    {invoice.buyer.fax && (
                      <div className="flex">
                        <span className="w-24 text-gray-500 shrink-0 whitespace-nowrap">팩스</span>
                        <span className="text-gray-900">{invoice.buyer.fax}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 품목 테이블 */}
              <div className="mb-10">
                <h3 className="text-lg font-bold text-gray-900 mb-4 whitespace-nowrap">품목 상세</h3>
                <table className="w-full border-collapse border-2 border-gray-400">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-700 whitespace-nowrap">No.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-700 whitespace-nowrap">품목</th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-700 whitespace-nowrap">단위</th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-sm font-bold text-gray-700 whitespace-nowrap">수량</th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-sm font-bold text-gray-700 whitespace-nowrap">단가</th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-sm font-bold text-gray-700 whitespace-nowrap">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-center text-gray-600">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900 break-keep">{item.name}</td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-gray-600 whitespace-nowrap">{item.unit}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right text-gray-900 whitespace-nowrap">{item.quantity.toLocaleString()}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right text-gray-900 whitespace-nowrap">{formatPrice(item.unitPrice)}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">{formatPrice(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 금액 요약 */}
              <div className="flex justify-end mb-10">
                <div className="w-full max-w-sm">
                  <div className="border-2 border-gray-400 rounded-xl overflow-hidden">
                    <div className="flex justify-between px-6 py-3 border-b border-gray-200">
                      <span className="text-gray-600 whitespace-nowrap">상품 금액</span>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{formatPrice(invoice.productAmount)}</span>
                    </div>
                    <div className="flex justify-between px-6 py-3 border-b border-gray-200">
                      <span className="text-gray-600 whitespace-nowrap">
                        수수료율 ({invoice.isRepeatTrade ? '연속거래' : '첫거래'})
                      </span>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{invoice.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between px-6 py-3 border-b border-gray-200">
                      <span className="text-gray-600 whitespace-nowrap">수수료</span>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{formatPrice(invoice.commissionAmount)}</span>
                    </div>
                    <div className="flex justify-between px-6 py-4 bg-gray-900 text-white">
                      <span className="text-lg font-bold whitespace-nowrap">총 금액</span>
                      <span className="text-lg font-bold whitespace-nowrap">{formatPrice(invoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 비고 */}
              {invoice.notes && (
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 whitespace-nowrap">비고</h3>
                  <p className="text-gray-700 p-4 bg-gray-50 rounded-xl break-keep">{invoice.notes}</p>
                </div>
              )}

              {/* 하단 안내 */}
              <div className="text-center text-sm text-gray-400 pt-8 border-t-2 border-gray-200">
                <p className="break-keep">본 거래명세표는 OnTheDeal 플랫폼을 통해 자동 발행되었습니다.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
