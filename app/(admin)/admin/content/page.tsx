'use client'

import { useState, useEffect } from 'react'
import { FileText, Edit, Eye, Save, X, Globe, Shield, FileCheck, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, Input, Badge } from '@/components/ui'

interface Page {
  id: string
  slug: string
  title: string
  description: string | null
  content: string
  status: 'published' | 'draft'
  createdAt: string
  updatedAt: string
}

interface Stats {
  total: number
  published: number
  draft: number
}

const pageIcons: Record<string, any> = {
  terms: FileText,
  privacy: Shield,
  about: Globe,
  faq: FileCheck,
}

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<Page[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/content')
      if (res.ok) {
        const data = await res.json()
        setPages(data.pages)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (page: Page) => {
    setSelectedPage(page)
    setEditContent(page.content)
    setEditTitle(page.title)
    setEditDescription(page.description || '')
    setEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedPage) return
    setSaving(true)

    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPage.id,
          title: editTitle,
          description: editDescription,
          content: editContent,
        }),
      })

      if (res.ok) {
        fetchPages()
        setEditMode(false)
        setSelectedPage(null)
      }
    } catch (error) {
      console.error('Failed to save page:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async (page: Page) => {
    try {
      const newStatus = page.status === 'published' ? 'draft' : 'published'
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: page.id, status: newStatus }),
      })

      if (res.ok) {
        fetchPages()
      }
    } catch (error) {
      console.error('Failed to update page status:', error)
    }
  }

  const handleDelete = async (pageId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/content?id=${pageId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchPages()
      }
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
  }

  const getPageIcon = (slug: string) => {
    const iconKey = slug.replace('/', '')
    const Icon = pageIcons[iconKey] || FileText
    return Icon
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
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 페이지</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">게시됨</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.published || 0}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <Globe className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">초안</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.draft || 0}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <FileCheck className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page List */}
      <Card>
        <CardHeader>
          <CardTitle>콘텐츠 페이지 관리</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pages.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg">등록된 페이지가 없습니다</p>
              <p className="text-sm mt-2">시드 데이터를 실행하여 기본 페이지를 생성하세요</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pages.map((page) => {
                const Icon = getPageIcon(page.slug)
                return (
                  <div key={page.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900">{page.title}</h3>
                            <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
                              {page.status === 'published' ? '게시됨' : '초안'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{page.slug}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            최종 수정: {new Date(page.updatedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublish(page)}
                        >
                          {page.status === 'published' ? '비게시' : '게시'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(page.slug, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEdit(page)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          편집
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editMode && selectedPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>{selectedPage.title} 편집</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setEditMode(false); setSelectedPage(null); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="페이지 제목"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <Input
                    label="URL 경로"
                    value={selectedPage.slug}
                    disabled
                  />
                </div>
                <Input
                  label="설명"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="페이지 설명"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    페이지 내용
                  </label>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={20}
                    className="text-sm"
                    placeholder="페이지 내용을 입력하세요..."
                  />
                </div>
                <p className="text-sm text-gray-500">
                  * 일반 텍스트로 작성하면 자동으로 단락이 구분됩니다. 빈 줄로 단락을 나눌 수 있습니다.
                </p>
              </div>
            </CardContent>
            <div className="border-t p-4 flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setEditMode(false); setSelectedPage(null); }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                저장
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-6">
          <h3 className="font-bold text-blue-800 mb-2">콘텐츠 관리 안내</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="break-keep">• 이용약관, 개인정보처리방침 등 법적 문서는 변경 시 사용자에게 공지가 필요합니다.</li>
            <li className="break-keep">• '초안' 상태의 페이지는 사용자에게 표시되지 않습니다.</li>
            <li className="break-keep">• 페이지 URL 경로는 변경할 수 없습니다. 새 페이지가 필요한 경우 개발팀에 문의하세요.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
