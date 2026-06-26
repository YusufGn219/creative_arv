'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { apiRequest } from '@/lib/api'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Article, PaginatedResponse } from '@/lib/types'

function NewPostForm() {
  const params = useParams()
  const forumSlug = params.slug as string
  const router = useRouter()

  const [forumId, setForumId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [articleSearch, setArticleSearch] = useState('')
  const [articleResults, setArticleResults] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<{ id: number; slug: string }>(`/api/forums/${forumSlug}/`)
      .then(f => setForumId(f.id))
      .catch(() => setError('Forum bulunamadı.'))
  }, [forumSlug])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Postunu yaz...' }),
    ],
    editorProps: {
      attributes: {
        class: 'prose max-w-none outline-none min-h-[400px] text-[var(--text)] leading-relaxed',
      },
    },
  })

  useEffect(() => {
    if (!articleSearch.trim()) { setArticleResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await apiRequest<PaginatedResponse<Article>>(`/api/articles/?search=${articleSearch}`)
        setArticleResults(res.results.slice(0, 5))
      } catch {
        setArticleResults([])
      }
    }, 400)
    return () => clearTimeout(t)
  }, [articleSearch])

  async function handleSubmit() {
    if (!title.trim()) { setError('Başlık gerekli.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await apiRequest<{ id: number }>(`/api/posts/`, {
        method: 'POST',
        auth: true,
        body: {
          title,
          body: JSON.stringify(editor?.getJSON() ?? {}),
          forum_id: forumId,
          article: selectedArticle?.id ?? null,
        },
      })
      router.push(`/forums/${forumSlug}/posts/${res.id}`)
    } catch (e: unknown) {
      const err = e as { data?: Record<string, string[]> }
      setError(err.data ? Object.values(err.data).flat().join(' ') : 'Post oluşturulamadı.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)] px-6 py-3 flex items-center gap-3">
        <div className="flex-1">{error && <span className="text-xs text-red-400">{error}</span>}</div>
        <Button size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Gönderiliyor...' : 'Post Yayımla'}
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Başlık */}
        <input
          className="w-full text-2xl font-serif text-[var(--text)] bg-transparent outline-none placeholder:text-[var(--text3)] mb-6"
          placeholder="Post başlığı..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {/* Makale Referansı */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-medium text-[var(--text2)]">Makale Referansı (opsiyonel)</label>
          {selectedArticle ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--accent)] bg-[var(--surface)]">
              <span className="text-sm text-[var(--text)] flex-1">📄 {selectedArticle.title}</span>
              <button onClick={() => setSelectedArticle(null)} className="text-xs text-[var(--text3)] hover:text-red-400">✕</button>
            </div>
          ) : (
            <div className="relative">
              <Input
                placeholder="Makale ara..."
                value={articleSearch}
                onChange={e => setArticleSearch(e.target.value)}
              />
              {articleResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-lg z-10">
                  {articleResults.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface2)] transition-colors"
                      onClick={() => { setSelectedArticle(a); setArticleSearch(''); setArticleResults([]) }}
                    >
                      {a.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* TipTap */}
        <div className="border-t border-[var(--border)] pt-6">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default function NewPostPage() {
  return (
    <ProtectedRoute>
      <NewPostForm />
    </ProtectedRoute>
  )
}
