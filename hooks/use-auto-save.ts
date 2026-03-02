'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  delay: number = 1500
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<string>('')
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => { isMountedRef.current = false }
  }, [])

  useEffect(() => {
    const currentData = JSON.stringify(data)
    if (currentData === previousDataRef.current) return
    if (previousDataRef.current === '') {
      previousDataRef.current = currentData
      return
    }
    previousDataRef.current = currentData

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      try {
        setStatus('saving')
        await saveFn(data)
        if (isMountedRef.current) setStatus('saved')
      } catch {
        if (isMountedRef.current) setStatus('error')
      }
    }, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [data, saveFn, delay])

  return status
}
