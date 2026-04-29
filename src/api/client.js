const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function buildUrl(path, params = {}) {
  const url = new URL(path, API_BASE_URL)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}

export async function apiGet(path, params) {
  const response = await fetch(buildUrl(path, params), {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json()
}
