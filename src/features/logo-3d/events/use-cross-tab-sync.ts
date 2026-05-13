import { useEffect, useRef } from 'react'
import { useEventBus } from '@/stores/core/event-bus.store'

const CHANNEL = 'synapse-logo-bus'

export const useCrossTabSync = () => {
  const channelRef = useRef<BroadcastChannel | null>(null)
  const tabId = useRef(`tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`)

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL)
    channelRef.current = channel

    channel.onmessage = (msg) => {
      const { from, event, payload } = msg.data
      if (from === tabId.current) return

      const bus = useEventBus.getState()
      try {
        bus.emit(event, payload)
      } catch {
        // return
      }
    }

    return () => channel.close()
  }, [])

  // send func
  const send = (event: string, payload: unknown) => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        from: tabId.current,
        timestamp: Date.now(),
        event,
        payload,
      })
    }
  }

  return { send }
}