'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { apiRequest } from '@/lib/api'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', password: '', password_confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const { user } = useAuth()
  const router = useRouter()
  const debouncedUsername = useDebounce(form.username, 500)

  useEffect(() => { if (user) router.replace('/') }, [user, router])

  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) { setUsernameStatus('idle'); return }
    setUsernameStatus('checking')
    try {
      const res = await apiRequest<{ results: unknown[] }>(`/api/users/?username=${username}`)
      setUsernameStatus(res.results.length > 0 ? 'taken' : 'available')
    } catch {
      setUsernameStatus('idle')
    }
  }, [])

  useEffect(() => { checkUsername(debouncedUsername) }, [debouncedUsername, checkUsername])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.password_confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (usernameStatus === 'taken') {
      setError('Bu kullanıcı adı alınmış.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await apiRequest('/api/auth/register/', {
        method: 'POST',
        body: {
          first_name: form.first_name,
          last_name: form.last_name,
          username: form.username,
          email: form.email,
          password: form.password,
          password_confirm: form.password_confirm,
        },
      })
      router.push('/login')
    } catch (err: unknown) {
      const e = err as { data?: Record<string, string[]> }
      const msgs = e.data ? Object.values(e.data).flat().join(' ') : 'Kayıt başarısız.'
      setError(msgs)
    } finally {
      setLoading(false)
    }
  }

  const usernameHint =
    usernameStatus === 'checking' ? '...' :
    usernameStatus === 'available' ? '✓ Kullanılabilir' :
    usernameStatus === 'taken' ? '✗ Alınmış' : ''

  const usernameHintColor =
    usernameStatus === 'available' ? 'text-green-400' :
    usernameStatus === 'taken' ? 'text-red-400' : 'text-[var(--text3)]'

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Creative<span className="text-[var(--accent-light)]">Arv</span>
          </h1>
          <p className="text-sm text-[var(--text2)] mt-2">Yeni hesap oluştur</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text2)]">Ad</label>
                <Input placeholder="Ad" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text2)]">Soyad</label>
                <Input placeholder="Soyad" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text2)]">Kullanıcı Adı</label>
              <Input
                placeholder="kullanici_adi"
                value={form.username}
                onChange={e => set('username', e.target.value)}
                required
              />
              {usernameHint && <p className={`text-xs ${usernameHintColor}`}>{usernameHint}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text2)]">Email</label>
              <Input type="email" placeholder="ornek@mail.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text2)]">Şifre</label>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text2)]">Şifre Tekrar</label>
              <Input type="password" placeholder="••••••••" value={form.password_confirm} onChange={e => set('password_confirm', e.target.value)} required />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </Button>
          </form>
          <p className="text-center text-xs text-[var(--text3)] mt-4">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-[var(--accent-light)] hover:underline">Giriş yap</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
