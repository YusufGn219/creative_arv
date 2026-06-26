'use client'
import { useState, useEffect } from 'react'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/input'

interface Session {
  id: string
  device: string
  ip: string
  last_active: string
  is_current: boolean
}

function ProfileSettings() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState({
    first_name: '', last_name: '', username: '', bio: '',
  })
  const [email, setEmail] = useState('')
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm: '' })
  const [sessions, setSessions] = useState<Session[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ section: string; text: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!user) return
    apiRequest<{ first_name: string; last_name: string; username: string; bio: string | null; email: string }>(
      '/api/users/me/', { auth: true }
    ).then(data => {
      setProfile({
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        username: data.username,
        bio: data.bio ?? '',
      })
      setEmail(data.email)
    })
    apiRequest<Session[]>('/api/users/me/sessions/', { auth: true })
      .then(setSessions)
      .catch(() => {})
  }, [user])

  function notify(section: string, text: string, ok = true) {
    setMsg({ section, text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  async function saveProfile() {
    setSaving('profile')
    try {
      if (avatarFile) {
        const fd = new FormData()
        fd.append('avatar', avatarFile)
        fd.append('first_name', profile.first_name)
        fd.append('last_name', profile.last_name)
        fd.append('username', profile.username)
        fd.append('bio', profile.bio)
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/`, {
          method: 'PATCH',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        })
      } else {
        await apiRequest('/api/users/me/', { method: 'PATCH', auth: true, body: profile })
      }
      notify('profile', 'Profil güncellendi.')
    } catch {
      notify('profile', 'Güncellenemedi.', false)
    } finally {
      setSaving(null)
    }
  }

  async function saveEmail() {
    setSaving('email')
    try {
      await apiRequest('/api/users/me/', { method: 'PATCH', auth: true, body: { email } })
      notify('email', 'Email güncellendi.')
    } catch {
      notify('email', 'Güncellenemedi.', false)
    } finally {
      setSaving(null)
    }
  }

  async function savePassword() {
    if (passwords.new_password !== passwords.confirm) {
      notify('password', 'Şifreler eşleşmiyor.', false)
      return
    }
    setSaving('password')
    try {
      await apiRequest('/api/auth/password/change/', {
        method: 'POST',
        auth: true,
        body: { old_password: passwords.old_password, new_password: passwords.new_password },
      })
      setPasswords({ old_password: '', new_password: '', confirm: '' })
      notify('password', 'Şifre güncellendi.')
    } catch {
      notify('password', 'Güncellenemedi. Eski şifrenizi kontrol edin.', false)
    } finally {
      setSaving(null)
    }
  }

  async function revokeSession(id: string) {
    try {
      await apiRequest(`/api/users/me/sessions/${id}/`, { method: 'DELETE', auth: true })
      setSessions(prev => prev.filter(s => s.id !== id))
    } catch {
      notify('sessions', 'Oturum sonlandırılamadı.', false)
    }
  }

  async function revokeAllSessions() {
    try {
      await apiRequest('/api/users/me/sessions/', { method: 'DELETE', auth: true })
      logout()
    } catch {
      notify('sessions', 'Oturumlar sonlandırılamadı.', false)
    }
  }

  const section = (id: string) => (
    msg?.section === id
      ? <p className={`text-xs mt-2 ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>
      : null
  )

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-10">
      <h1 className="font-serif text-2xl text-[var(--text)]">Profil Ayarları</h1>

      {/* Profil Bilgileri */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text2)] border-b border-[var(--border)] pb-2">Profil Bilgileri</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--accent)] overflow-hidden">
            {avatarFile
              ? <img src={URL.createObjectURL(avatarFile)} alt="avatar" className="w-full h-full object-cover" />
              : user?.avatar_url
              ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              : null
            }
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text2)] block mb-1">Avatar</label>
            <input type="file" accept="image/*" className="text-xs text-[var(--text3)]"
              onChange={e => setAvatarFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text2)]">Ad</label>
            <Input value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text2)]">Soyad</label>
            <Input value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Kullanıcı Adı</label>
          <Input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Bio</label>
          <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} />
        </div>
        <Button onClick={saveProfile} disabled={saving === 'profile'}>
          {saving === 'profile' ? 'Kaydediliyor...' : 'Profili Kaydet'}
        </Button>
        {section('profile')}
      </section>

      {/* Email */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text2)] border-b border-[var(--border)] pb-2">Email Değiştir</h2>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Email</label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <Button onClick={saveEmail} disabled={saving === 'email'}>
          {saving === 'email' ? 'Kaydediliyor...' : 'Email Kaydet'}
        </Button>
        {section('email')}
      </section>

      {/* Şifre */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text2)] border-b border-[var(--border)] pb-2">Şifre Değiştir</h2>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Mevcut Şifre</label>
          <Input type="password" value={passwords.old_password} onChange={e => setPasswords(p => ({ ...p, old_password: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Yeni Şifre</label>
          <Input type="password" value={passwords.new_password} onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text2)]">Şifre Tekrar</label>
          <Input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
        </div>
        <Button onClick={savePassword} disabled={saving === 'password'}>
          {saving === 'password' ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
        </Button>
        {section('password')}
      </section>

      {/* Oturumlar */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text2)] border-b border-[var(--border)] pb-2">Aktif Oturumlar</h2>
        {sessions.length === 0 ? (
          <p className="text-xs text-[var(--text3)]">Oturum bilgisi yok.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <div>
                  <p className="text-sm text-[var(--text)]">{s.device}</p>
                  <p className="text-xs text-[var(--text3)]">{s.ip} · {new Date(s.last_active).toLocaleDateString('tr-TR')}</p>
                  {s.is_current && <span className="text-xs text-green-400">Bu cihaz</span>}
                </div>
                {!s.is_current && (
                  <Button variant="danger" size="sm" onClick={() => revokeSession(s.id)}>Çıkış</Button>
                )}
              </div>
            ))}
          </div>
        )}
        {section('sessions')}
        <Button variant="danger" onClick={revokeAllSessions}>Tüm cihazlardan çık</Button>
      </section>
    </div>
  )
}

export default function MePage() {
  return (
    <ProtectedRoute>
      <ProfileSettings />
    </ProtectedRoute>
  )
}
