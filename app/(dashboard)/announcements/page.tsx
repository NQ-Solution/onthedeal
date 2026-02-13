'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Megaphone,
  Search,
  Pin,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, Badge, Button, Input, Select } from '@/components/ui'

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  isPinned: boolean
  viewCount: number
  publishedAt: string | null
  createdAt: string
}

const categoryConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  general: { label: '일반', variant: 'default' },
  update: { label: '업데이트', variant: 'info' },
  maintenance: { label: '점검', variant: 'warning' },
  event: { label: '이벤트', variant: 'success' },
  policy: { label: '정책', variant: 'error' },
}

export default function AnnouncementsPage() {
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchAnnouncements()
  }, [page, categoryFilter])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', '10')
      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter) params.append('category', categoryFilter)

      const res = await fetch(`/api/announcements?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchAnnouncements()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Megaphone className="w-7 h-7 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="제목으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-40">
              <Select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
                options={[
                  { value: '', label: '전체 카테고리' },
                  { value: 'general', label: '일반' },
                  { value: 'update', label: '업데이트' },
                  { value: 'maintenance', label: '점검' },
                  { value: 'event', label: '이벤트' },
                  { value: 'policy', label: '정책' },
                ]}
              />
            </div>
            <Button size="sm" variant="secondary" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-1" />
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-16 text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">공지사항이 없습니다</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const catConfig = categoryConfig[announcement.category] || categoryConfig.general
            return (
              <Link key={announcement.id} href={`/announcements/${announcement.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {announcement.isPinned && (
                            <Pin className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <Badge variant={catConfig.variant}>{catConfig.label}</Badge>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {announcement.content}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-gray-400">
                          {formatDate(announcement.publishedAt || announcement.createdAt)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-400">
                          <Eye className="w-3 h-3" />
                          <span>{announcement.viewCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            이전
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            다음
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
