'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  Calendar,
  Pin,
  Loader2,
  Megaphone,
} from 'lucide-react'
import { Card, CardContent, Badge, Button } from '@/components/ui'

interface AnnouncementDetail {
  id: string
  title: string
  content: string
  category: string
  isPinned: boolean
  isPublished: boolean
  viewCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

const categoryConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  general: { label: '일반', variant: 'default' },
  update: { label: '업데이트', variant: 'info' },
  maintenance: { label: '점검', variant: 'warning' },
  event: { label: '이벤트', variant: 'success' },
  policy: { label: '정책', variant: 'error' },
}

export default function AnnouncementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchAnnouncement()
    }
  }, [params.id])

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch(`/api/announcements/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setAnnouncement(data.announcement)
      } else {
        setError('공지사항을 찾을 수 없습니다.')
      }
    } catch (err) {
      console.error('Failed to fetch announcement:', err)
      setError('공지사항을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="space-y-6">
        <Link href="/announcements">
          <Button size="sm" variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>
        <Card>
          <CardContent>
            <div className="text-center py-16 text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">{error || '공지사항을 찾을 수 없습니다.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const catConfig = categoryConfig[announcement.category] || categoryConfig.general

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Link href="/announcements">
        <Button size="sm" variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로 돌아가기
        </Button>
      </Link>

      {/* 공지사항 상세 */}
      <Card>
        <CardContent>
          {/* 헤더 */}
          <div className="border-b border-gray-100 pb-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              {announcement.isPinned && (
                <Pin className="w-4 h-4 text-amber-500" />
              )}
              <Badge variant={catConfig.variant}>{catConfig.label}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4 break-keep">
              {announcement.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(announcement.publishedAt || announcement.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>조회 {announcement.viewCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="prose max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
              {announcement.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
