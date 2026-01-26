import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface HealthCheckResult {
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

export async function GET() {
  const startTime = Date.now()
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    timezone: 'Asia/Seoul (KST)',
    version: process.env.npm_package_version || '0.1.0',
    checks: {
      database: { status: 'ok' },
      memory: { status: 'ok', used: 0, total: 0, percentage: 0 },
      uptime: process.uptime(),
    },
    environment: process.env.NODE_ENV || 'development',
  }

  // 데이터베이스 연결 체크
  try {
    const dbStartTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    result.checks.database.latency = Date.now() - dbStartTime
  } catch (error) {
    result.checks.database.status = 'error'
    result.checks.database.error = error instanceof Error ? error.message : 'Database connection failed'
    result.status = 'unhealthy'

    // 에러 로깅
    console.error('[Health Check] Database Error:', {
      timestamp: result.timestamp,
      error: result.checks.database.error,
    })
  }

  // 메모리 사용량 체크
  try {
    const memoryUsage = process.memoryUsage()
    const totalMemory = memoryUsage.heapTotal
    const usedMemory = memoryUsage.heapUsed
    const percentage = Math.round((usedMemory / totalMemory) * 100)

    result.checks.memory = {
      status: percentage > 90 ? 'error' : percentage > 70 ? 'warning' : 'ok',
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage,
    }

    if (result.checks.memory.status === 'error') {
      result.status = 'unhealthy'
      console.error('[Health Check] Memory Critical:', {
        timestamp: result.timestamp,
        percentage: `${percentage}%`,
        used: `${result.checks.memory.used}MB`,
      })
    } else if (result.checks.memory.status === 'warning') {
      if (result.status === 'healthy') result.status = 'degraded'
      console.warn('[Health Check] Memory Warning:', {
        timestamp: result.timestamp,
        percentage: `${percentage}%`,
      })
    }
  } catch (error) {
    result.checks.memory.status = 'error'
    console.error('[Health Check] Memory Check Error:', error)
  }

  // 전체 상태 로깅
  if (result.status !== 'healthy') {
    console.error('[Health Check] System Status:', {
      status: result.status,
      timestamp: result.timestamp,
      checks: result.checks,
    })
  }

  const statusCode = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503

  return NextResponse.json(result, { status: statusCode })
}

// 강제 동적 렌더링
export const dynamic = 'force-dynamic'
