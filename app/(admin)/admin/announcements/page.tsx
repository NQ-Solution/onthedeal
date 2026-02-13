'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Pin,
  Eye,
  EyeOff,
  Search,
  Loader2,
  X,
  Megaphone,
  Save,
} from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge, Textarea } from '@/components/ui'

interface Announcement {
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

const emptyForm = {
  title: '',
  content: '',
  category: 'general',
  isPinned: false,
  isPublished: false,
}

export default function AdminAnnouncementsPage() {
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [page, statusFilter, categoryFilter])

  const fetchAnnouncements = async () => {
    try {
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', '20')
      if (statusFilter) params.append('status', statusFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (searchTerm) params.append('search', searchTerm)

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
    setLoading(true)
    fetchAnnouncements()
  }

  const handleCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id)
    setForm({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      isPinned: announcement.isPinned,
      isPublished: announcement.isPublished,
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setActionLoading(true)
    try {
      const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingId(null)
        setForm(emptyForm)
        fetchAnnouncements()
      } else {
        const data = await res.json()
        alert(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to save announcement:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAnnouncements()
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error)
      alert('삭제에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleTogglePublish = async (announcement: Announcement) => {
    const newPublished = !announcement.isPublished
    const action = newPublished ? '발행' : '발행 취소'
    if (!confirm(`공지사항을 ${action}하시겠습니까?${newPublished ? '\n발행 시 모든 사용자에게 알림이 전송됩니다.' : ''}`)) return

    try {
      const res = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newPublished }),
      })
      if (res.ok) {
        fetchAnnouncements()
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const res = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !announcement.isPinned }),
      })
      if (res.ok) {
        fetchAnnouncements()
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="w-7 h-7 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900">공지사항 관리</h2>
          <Badge variant="info">{total}건</Badge>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          새 공지사항
        </Button>
      </div>

      {/* 필터 */}
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
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                options={[
                  { value: '', label: '전체 상태' },
                  { value: 'published', label: '발행됨' },
                  { value: 'draft', label: '임시저장' },
                ]}
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

      {/* 작성/수정 폼 */}
      {showForm && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? '공지사항 수정' : '새 공지사항 작성'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingId(null) }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">제목</label>
                <Input
                  placeholder="공지사항 제목을 입력하세요"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">카테고리</label>
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  options={[
                    { value: 'general', label: '일반' },
                    { value: 'update', label: '업데이트' },
                    { value: 'maintenance', label: '점검' },
                    { value: 'event', label: '이벤트' },
                    { value: 'policy', label: '정책' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">내용</label>
                <Textarea
                  placeholder="공지사항 내용을 입력하세요"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">상단 고정</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">즉시 발행</span>
                </label>
              </div>
              {form.isPublished && !editingId && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  발행 시 모든 승인된 사용자에게 알림이 전송됩니다.
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <Button size="sm" onClick={handleSubmit} isLoading={actionLoading}>
                  <Save className="w-4 h-4 mr-1" />
                  {editingId ? '수정' : '저장'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingId(null) }}
                >
                  취소
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 목록 */}
      <Card>
        <CardContent className="p-0">
          {announcements.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">공지사항이 없습니다</p>
              <p className="text-sm mt-1">새 공지사항을 작성해보세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">상태</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">카테고리</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">제목</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">조회수</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">작성일</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((announcement) => {
                    const catConfig = categoryConfig[announcement.category] || categoryConfig.general
                    return (
                      <tr key={announcement.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {announcement.isPinned && (
                              <Pin className="w-4 h-4 text-amber-500" />
                            )}
                            <Badge variant={announcement.isPublished ? 'success' : 'default'}>
                              {announcement.isPublished ? '발행됨' : '임시저장'}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={catConfig.variant}>{catConfig.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{announcement.title}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {announcement.viewCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(announcement.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleTogglePublish(announcement)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title={announcement.isPublished ? '발행 취소' : '발행'}
                            >
                              {announcement.isPublished ? (
                                <EyeOff className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-green-500" />
                              )}
                            </button>
                            <button
                              onClick={() => handleTogglePin(announcement)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title={announcement.isPinned ? '고정 해제' : '상단 고정'}
                            >
                              <Pin className={`w-4 h-4 ${announcement.isPinned ? 'text-amber-500' : 'text-gray-400'}`} />
                            </button>
                            <button
                              onClick={() => handleEdit(announcement)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="수정"
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(announcement.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600 px-4">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
