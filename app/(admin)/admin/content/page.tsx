'use client'

import { useState } from 'react'
import { FileText, Edit, Eye, Save, X, Globe, Shield, FileCheck } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, Input, Badge } from '@/components/ui'

interface ContentPage {
  id: string
  title: string
  slug: string
  description: string
  content: string
  lastUpdated: string
  status: 'published' | 'draft'
}

const mockPages: ContentPage[] = [
  {
    id: 'terms',
    title: '이용약관',
    slug: '/terms',
    description: '서비스 이용약관 페이지',
    content: '제1조 (목적)\n본 약관은 온더딜(OnTheDeal, 이하 "회사")이 제공하는 B2B 식자재 거래 플랫폼 서비스의 이용과 관련하여...',
    lastUpdated: '2024-02-01',
    status: 'published',
  },
  {
    id: 'privacy',
    title: '개인정보처리방침',
    slug: '/privacy',
    description: '개인정보 처리방침 페이지',
    content: '온더딜(OnTheDeal, 이하 "회사")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다...',
    lastUpdated: '2024-02-01',
    status: 'published',
  },
  {
    id: 'about',
    title: '회사소개',
    slug: '/about',
    description: '온더딜 회사 소개 페이지',
    content: 'OnTheDeal은 B2B 식자재 거래의 혁신을 이끄는 플랫폼입니다...',
    lastUpdated: '2024-01-28',
    status: 'published',
  },
  {
    id: 'faq',
    title: '자주 묻는 질문',
    slug: '/faq',
    description: 'FAQ 페이지',
    content: 'Q: 가입 후 바로 거래할 수 있나요?\nA: 회원가입 후 사업자 승인 과정이 필요합니다...',
    lastUpdated: '2024-02-05',
    status: 'draft',
  },
]

export default function AdminContentPage() {
  const [pages, setPages] = useState(mockPages)
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleEdit = (page: ContentPage) => {
    setSelectedPage(page)
    setEditContent(page.content)
    setEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedPage) return
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    setPages(pages.map(p =>
      p.id === selectedPage.id
        ? { ...p, content: editContent, lastUpdated: new Date().toISOString().split('T')[0] }
        : p
    ))

    setSaving(false)
    setEditMode(false)
    setSelectedPage(null)
  }

  const handlePublish = (pageId: string) => {
    setPages(pages.map(p =>
      p.id === pageId
        ? { ...p, status: p.status === 'published' ? 'draft' : 'published' }
        : p
    ))
  }

  const publishedCount = pages.filter(p => p.status === 'published').length
  const draftCount = pages.filter(p => p.status === 'draft').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 페이지</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pages.length}</p>
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
                <p className="text-3xl font-bold text-green-600 mt-1">{publishedCount}</p>
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
                <p className="text-3xl font-bold text-yellow-600 mt-1">{draftCount}</p>
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
          <div className="divide-y divide-gray-100">
            {pages.map((page) => (
              <div key={page.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      {page.id === 'terms' && <FileText className="w-6 h-6 text-primary-600" />}
                      {page.id === 'privacy' && <Shield className="w-6 h-6 text-primary-600" />}
                      {page.id === 'about' && <Globe className="w-6 h-6 text-primary-600" />}
                      {page.id === 'faq' && <FileCheck className="w-6 h-6 text-primary-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">{page.title}</h3>
                        <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
                          {page.status === 'published' ? '게시됨' : '초안'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{page.slug}</p>
                      <p className="text-sm text-gray-400 mt-1">최종 수정: {page.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublish(page.id)}
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
            ))}
          </div>
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
                    value={selectedPage.title}
                    disabled
                  />
                  <Input
                    label="URL 경로"
                    value={selectedPage.slug}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    페이지 내용
                  </label>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="페이지 내용을 입력하세요..."
                  />
                </div>
                <p className="text-sm text-gray-500">
                  * 실제 페이지는 React 컴포넌트로 작성되어 있습니다. 여기서 수정하면 데이터베이스의 콘텐츠가 업데이트됩니다.
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
                isLoading={saving}
              >
                <Save className="w-4 h-4 mr-2" />
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
            <li>• 이용약관, 개인정보처리방침 등 법적 문서는 변경 시 사용자에게 공지가 필요합니다.</li>
            <li>• '초안' 상태의 페이지는 사용자에게 표시되지 않습니다.</li>
            <li>• 페이지 URL 경로는 변경할 수 없습니다. 새 페이지가 필요한 경우 개발팀에 문의하세요.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
