import { getAccessToken, refreshAccessToken, clearTokens } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

type RequestOptions = {
  method?: string
  body?: object
  auth?: boolean
}

async function doFetch(endpoint: string, options: RequestOptions, token?: string | null): Promise<Response> {
  const { method = 'GET', body, auth = false } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const accessToken = token ?? (auth ? getAccessToken() : null)
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  return fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  let response = await doFetch(endpoint, options)

  if (response.status === 401 && options.auth !== false) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      response = await doFetch(endpoint, options, newToken)
    } else {
      clearTokens()
    }
  }

  if (response.status === 401) {
    clearTokens()
    throw { status: 401, data: {} }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw { status: response.status, data: error }
  }

  return response.json()
}
