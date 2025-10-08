import { useEffect, useState } from 'react'
import { fetchTechStacks } from '@/lib/api'
import type { TechStackConfig, TechStackResponseData } from '@/types/tech-stack'

interface TechStackState {
  config: TechStackConfig | null
  assignments: Record<string, string[]>
  loading: boolean
  error: string | null
}

export function useTechStackConfig(username: string) {
  const [state, setState] = useState<TechStackState>({
    config: null,
    assignments: {},
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await fetchTechStacks(username)
        const data: TechStackResponseData | null = response?.data ?? null

        if (!isMounted) return

        if (data) {
          setState({
            config: {
              categories: Array.isArray(data.categories) ? data.categories : [],
              updatedAt: data.updatedAt ?? null,
            },
            assignments: data.projectAssignments ?? {},
            loading: false,
            error: null,
          })
        } else {
          setState({
            config: { categories: [], updatedAt: null },
            assignments: {},
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        if (!isMounted) return
        setState({
          config: { categories: [], updatedAt: null },
          assignments: {},
          loading: false,
          error: error instanceof Error ? error.message : '加载技术栈配置失败',
        })
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [username])

  return state
}
