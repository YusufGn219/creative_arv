'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Category, Tag, PaginatedResponse } from '@/lib/types'

function NewForumForm() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', category: '', rules: '' })
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiRequest<PaginatedResponse<Category> | Category[]>('/api/categories/'),
      apiRequest<PaginatedResponse<Tag> | Tag[]>('/api/tags/'),
    ]).then(([cats, tgs]) => {
      setCategories(Array.isArray(cats) ? cats : cats.results ?? [])
      setTags(Array.isArray(tgs) ? tgs : tgs.results ?? [])
    })
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Forum adı gerekli.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await apiRequest<{ slug: string }>('/api/forums/', {
        method: 'POST',
        auth: true,
        body: {
          title: form.title,
          description: form.description,
          rules: form.rules,
          category: form.category ? Number(form.category) : null,
          tags: selectedTags,
        },
      })
      router.push(`/forums/${res.slug}`)
    } catch (e: unknown) {
      const err = e as { data?: Record<string, string[]> }
      setError(err.data ? Object.values(err.data).flat().join(' ') : 'Forum oluşturulamadı.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="font-serif text-2xl text-[var(--text)] mb-6">Forum Aç</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Forum Adı</label>
          <Input placeholder="Forum adı" value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Açıklama</label>
          <Textarea placeholder="Forum hakkında kısa açıklama..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Kurallar (opsiyonel)</label>
          <Textarea placeholder="Forum kuralları..." value={form.rules} onChange={e => set('rules', e.target.value)} rows={4} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Kategori</label>
          <Select value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">Kategori seç...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Etiketler</label>
          <div className="flex flex-wrap gap-2">
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
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Oluşturuluyor...' : 'Forum Oluştur'}</Button>
      </form>
    </div>
  )
}

export default function NewForumPage() {
  return (
    <ProtectedRoute>
      <NewForumForm />
    </ProtectedRoute>
  )
}
