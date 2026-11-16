import { useEffect, useState } from 'react'

// Returns `value` only after it has stopped changing for `delay` ms.
// Each keystroke resets the timer, so typing "10001" sends one request, not five.
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
