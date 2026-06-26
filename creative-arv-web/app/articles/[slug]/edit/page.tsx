'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/input'
import { Article, Category, Tag, PaginatedResponse } from '@/lib/types'

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function EditArticle() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { user } = useAuth()

  const [article, setArticle] = useState<Article | null>(null)
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Yazmaya başla...' }),
    ],
    editorProps: {
      attributes: {
        class: 'prose max-w-none outline-none min-h-[400px] text-[var(--text)] leading-relaxed',
      },
    },
  })

  useEffect(() => {
    Promise.all([
      apiRequest<Article>(`/api/articles/${slug}/`),
      apiRequest<PaginatedResponse<Category> | Category[]>('/api/categories/'),
      apiRequest<PaginatedResponse<Tag> | Tag[]>('/api/tags/'),
    ]).then(([art, cats, tgs]) => {
      setArticle(art)
      setTitle(art.title)
      setCategoryId(art.category?.id?.toString() ?? '')
      setSelectedTags(art.tags.map(t => t.id))
      setCategories(Array.isArray(cats) ? cats : cats.results ?? [])
      setTags(Array.isArray(tgs) ? tgs : tgs.results ?? [])
    }).catch(() => setError('Makale yüklenemedi.')).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (editor && article?.content && !editor.isEmpty) return
    if (editor && article?.content) {
      editor.commands.setContent(article.content)
    }
  }, [editor, article])

  useEffect(() => {
    if (!loading && article && user && article.author?.username !== user.username) {
      router.replace('/')
    }
  }, [loading, article, user, router])

  const wordCount = countWords(editor?.getText() ?? '')
  const readingTime = Math.max(1, Math.round(wordCount / 200))

  async function save(publish: boolean) {
    if (!title.trim()) { setError('Başlık gerekli.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await apiRequest<{ slug: string }>(`/api/articles/${slug}/`, {
        method: 'PATCH',
        auth: true,
        body: {
          title,
          content: editor?.getJSON() ?? {},
          category: categoryId ? Number(categoryId) : null,
          tags: selectedTags,
          is_published: publish,
        },
      })
      router.push(`/articles/${res.slug}`)
    } catch (e: unknown) {
      const err = e as { data?: Record<string, string[]> }
      setError(err.data ? Object.values(err.data).flat().join(' ') : 'Kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return <p className="text-red-400 text-sm p-6">{error}</p>

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)] px-6 py-3 flex items-center gap-3">
        <div className="flex-1">
          <span className="text-xs text-[var(--text3)]">{wordCount} kelime · {readingTime} dk okuma</span>
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
        <Button variant="ghost" size="sm" onClick={() => save(false)} disabled={saving}>Taslak Kaydet</Button>
        <Button size="sm" onClick={() => save(true)} disabled={saving}>Yayımla</Button>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <input
          className="w-full text-3xl font-serif text-[var(--text)] bg-transparent outline-none placeholder:text-[var(--text3)] mb-6"
          placeholder="Başlık..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="flex gap-3 mb-6">
          <Select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="flex-1">
            <option value="">Kategori seç...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTags(prev =>
                prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]
              )}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                selectedTags.includes(tag.id)
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text2)] hover:border-[var(--accent)]'
              }`}
            >
              #{tag.name}
            </button>
          ))}
        </div>
        <div className="border-t border-[var(--border)] pt-6">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default function EditArticlePage() {
  return (
    <ProtectedRoute>
      <EditArticle />
    </ProtectedRoute>
  )
}
