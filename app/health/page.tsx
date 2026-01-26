'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, HardDrive, Clock, Server } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  timezone: string
  version: string
  checks: {
    database: {
      status: 'ok' | 'error'
      latency?: number
      error?: string
    }
    memory: {
      status: 'ok' | 'warning' | 'error'
      used: number
      total: number
      percentage: number
    }
    uptime: number
  }
  environment: string
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (days > 0) parts.push(`${days}일`)
  if (hours > 0) parts.push(`${hours}시간`)
  if (minutes > 0) parts.push(`${minutes}분`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}초`)

  return parts.join(' ')
}

function StatusIcon({ status }: { status: 'ok' | 'warning' | 'error' | 'healthy' | 'degraded' | 'unhealthy' }) {
  switch (status) {
    case 'ok':
    case 'healthy':
      return <CheckCircle className="w-6 h-6 text-green-500" />
    case 'warning':
    case 'degraded':
      return <AlertTriangle className="w-6 h-6 text-yellow-500" />
    case 'error':
    case 'unhealthy':
      return <XCircle className="w-6 h-6 text-red-500" />
    default:
      return null
  }
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    healthy: 'bg-green-100 text-green-700 border-green-200',
    degraded: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    unhealthy: 'bg-red-100 text-red-700 border-red-200',
    ok: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
  }

  const labels = {
    healthy: '정상',
    degraded: '주의',
    unhealthy: '비정상',
    ok: '정상',
    warning: '주의',
    error: '오류',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[status as keyof typeof colors] || colors.error}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<string>('')

  const fetchHealth = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
      setLastChecked(new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }))
    } catch (err) {
      setError('헬스 체크 데이터를 가져오는데 실패했습니다.')
      console.error('[Health Page] Fetch Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()

    // 30초마다 자동 새로고침
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">시스템 상태</h1>
            <p className="text-gray-600 mt-1">OnTheDeal 서비스 헬스 체크</p>
          </div>
          <Button onClick={fetchHealth} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8 text-center">
              <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-red-700 font-medium">{error}</p>
              <Button onClick={fetchHealth} className="mt-4">
                다시 시도
              </Button>
            </CardContent>
          </Card>
        ) : loading && !health ? (
          <Card>
            <CardContent className="py-16 text-center">
              <RefreshCw className="w-12 h-12 mx-auto text-primary-500 animate-spin mb-4" />
              <p className="text-gray-600">상태 확인 중...</p>
            </CardContent>
          </Card>
        ) : health ? (
          <div className="space-y-6">
            {/* 전체 상태 */}
            <Card className={`border-2 ${
              health.status === 'healthy' ? 'border-green-200 bg-green-50' :
              health.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'
            }`}>
              <CardContent className="py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      health.status === 'healthy' ? 'bg-green-100' :
                      health.status === 'degraded' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      <StatusIcon status={health.status} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {health.status === 'healthy' ? '모든 시스템 정상' :
                         health.status === 'degraded' ? '일부 시스템 주의' :
                         '시스템 문제 발생'}
                      </h2>
                      <p className="text-gray-600">마지막 확인: {lastChecked}</p>
                    </div>
                  </div>
                  <StatusBadge status={health.status} />
                </div>
              </CardContent>
            </Card>

            {/* 상세 체크 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 데이터베이스 */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">데이터베이스</h3>
                        <p className="text-sm text-gray-500">PostgreSQL</p>
                      </div>
                    </div>
                    <StatusBadge status={health.checks.database.status} />
                  </div>
                  {health.checks.database.status === 'ok' ? (
                    <p className="text-sm text-gray-600">
                      응답 시간: <span className="font-medium">{health.checks.database.latency}ms</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">
                      오류: {health.checks.database.error}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* 메모리 */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">메모리</h3>
                        <p className="text-sm text-gray-500">Heap Usage</p>
                      </div>
                    </div>
                    <StatusBadge status={health.checks.memory.status} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">사용량</span>
                      <span className="font-medium">{health.checks.memory.used}MB / {health.checks.memory.total}MB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          health.checks.memory.percentage > 90 ? 'bg-red-500' :
                          health.checks.memory.percentage > 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${health.checks.memory.percentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-right">{health.checks.memory.percentage}%</p>
                  </div>
                </CardContent>
              </Card>

              {/* 업타임 */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">업타임</h3>
                      <p className="text-sm text-gray-500">서버 가동 시간</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatUptime(health.checks.uptime)}</p>
                </CardContent>
              </Card>

              {/* 서버 정보 */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Server className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">서버 정보</h3>
                      <p className="text-sm text-gray-500">환경 설정</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">환경</span>
                      <span className="font-medium capitalize">{health.environment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">버전</span>
                      <span className="font-medium">{health.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">시간대</span>
                      <span className="font-medium">{health.timezone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 시스템 시간 */}
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">서버 시간 (한국 표준시)</p>
                  <p className="text-3xl font-bold text-gray-900">{health.timestamp}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
