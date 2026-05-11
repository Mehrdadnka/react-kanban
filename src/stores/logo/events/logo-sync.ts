// features/logo-3d/events/logo-sync.ts
import { useEffect, useRef } from 'react'
import { useLogoStore } from '../logo-store'

const CHANNEL_NAME = 'synapse-logo-bus'

export const useLogoSync = () => {
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channelRef.current = channel

    // گوش دادن به تب‌های دیگه
    channel.onmessage = (event) => {
      const store = useLogoStore.getState()
      const { type, data } = event.data

      if (type === 'spark') {
        store.addSpark(data.sparkType)
      } else if (type === 'orb') {
        store.addOrb(data)
      }
    }

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [])

  // تابع send که channel باز باشه
  const send = (type: string, data: any) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type, data })
      } catch {
        // channel بسته شده - بی‌خیال
      }
    }
  }

  return { send }
}