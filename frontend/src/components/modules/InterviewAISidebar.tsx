'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { ChatMessage } from '@/types'
import { Button } from '@/components/ui/Button'

interface InterviewAISidebarProps {
  messages: ChatMessage[]
  isStreaming: boolean
  moduleId: string
  onSendMessage: (content: string, moduleId: string) => Promise<void>
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <span className="text-xs font-medium text-muted font-mono-labels">
        {isUser ? 'You' : 'AI Assistant'}
      </span>
      <div
        className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white'
            : 'bg-surface-raised text-foreground border border-border'
        }`}
      >
        {message.content || <span className="animate-pulse text-muted">▋</span>}
      </div>
    </div>
  )
}

export function InterviewAISidebar({ messages, isStreaming, moduleId, onSendMessage }: InterviewAISidebarProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    void onSendMessage(text, moduleId)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <aside className="flex h-full w-80 flex-shrink-0 flex-col overflow-hidden border-l border-border">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-success" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted font-mono-labels">
          AI Debugging Assistant
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-muted leading-relaxed px-2">
            Ask me anything about the bug. Tip: specific questions get better answers than "fix my code".
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the bug… (Enter to send)"
          rows={3}
          disabled={isStreaming}
          className="w-full resize-none rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none disabled:opacity-50"
        />
        <div className="mt-2 flex justify-end">
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            isLoading={isStreaming}
            className="text-xs"
          >
            Send
          </Button>
        </div>
      </div>
    </aside>
  )
}
