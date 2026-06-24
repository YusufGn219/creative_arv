export const TOKEN_KEY = 'access_token'
export const REFRESH_KEY = 'refresh_token'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function isLoggedIn(): boolean {
  return !!getAccessToken()
}

export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!refresh) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) { clearTokens(); return null }
    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.access)
    return data.access
  } catch {
    clearTokens()
    return null
  }
}
