import { useEffect, useState } from 'react'

export default function useApiList(fetcher, params = {}) {
  const [state, setState] = useState({
    data: [],
    pagination: { count: 0, next: null, previous: null },
    loading: true,
    error: null,
  })
  useEffect(() => {
    let mounted = true

    fetcher(params)
      .then((response) => {
        if (!mounted) return
        const results = response?.results ?? []
        setState({
          data: results,
          pagination: {
            count: response?.count ?? results.length,
            next: response?.next ?? null,
            previous: response?.previous ?? null,
          },
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (!mounted) return
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
      })

    return () => {
      mounted = false
    }
  }, [fetcher, params])

  return state
}
