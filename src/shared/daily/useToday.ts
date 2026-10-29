import { useEffect, useState } from 'react'
import { dayKeyOf, msUntilNextPuzzle, type DayKey } from './day'

/** Today's UTC day key; re-renders when a new puzzle unlocks. */
export function useToday(): DayKey {
  const [today, setToday] = useState(() => dayKeyOf(new Date()))
  useEffect(() => {
    const timer = window.setTimeout(() => setToday(dayKeyOf(new Date())), msUntilNextPuzzle(new Date()) + 50)
    return () => window.clearTimeout(timer)
  }, [today])
  return today
}

/** Milliseconds until the next puzzle, updated every second. */
export function useCountdown(): number {
  const [msLeft, setMsLeft] = useState(() => msUntilNextPuzzle(new Date()))
  useEffect(() => {
    const timer = window.setInterval(() => setMsLeft(msUntilNextPuzzle(new Date())), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return msLeft
}
