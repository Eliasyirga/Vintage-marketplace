import { useState, useEffect } from 'react'

/**
 * Custom hook that delays updating a value until after a specified delay.
 * Default delay is 400ms (within the recommended 300–500ms range).
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
