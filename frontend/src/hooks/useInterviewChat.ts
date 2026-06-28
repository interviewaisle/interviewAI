'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types'
import { getToken } from '@/lib/auth'
import { API_PATHS } from '@/constants/api'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface UseInterviewChatReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  sendMessage: (content: string, moduleId: string) => Promise<void>
}

export function useInterviewChat(): UseInterviewChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = useCallback(async (content: string, moduleId: string) => {
    if (isStreaming) return

    const userMessage: ChatMessage = { role: 'user', content }
    const nextMessages = [...messages, userMessage]

    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setIsStreaming(true)

    try {
      const res = await fetch(`${BASE}${API_PATHS.INTERVIEW_CHAT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken() ?? ''}`,
        },
        body: JSON.stringify({ module_id: moduleId, messages: nextMessages }),
      })

      if (!res.ok || !res.body) {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: 'Error: could not reach AI service.' }
          return updated
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6)) as { type: string; text?: string }
            if (data.type === 'token' && data.text) {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: (updated[updated.length - 1].content) + data.text!,
                }
                return updated
              })
            }
          } catch { /* ignore malformed SSE line */ }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Error: network failure.' }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }, [messages, isStreaming])

  return { messages, isStreaming, sendMessage }
}
