'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Terminal as XTerminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

export interface TerminalHandle {
  write: (text: string) => void
  clear: () => void
}

interface TerminalProps {
  className?: string
}

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  function Terminal({ className = '' }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const termRef = useRef<XTerminal | null>(null)

    useImperativeHandle(ref, () => ({
      write: (text) => termRef.current?.write(text),
      clear: () => termRef.current?.clear(),
    }))

    useEffect(() => {
      if (!containerRef.current) return
      const container = containerRef.current

      const style = getComputedStyle(document.documentElement)
      const bg = style.getPropertyValue('--surface').trim()
      const fg = style.getPropertyValue('--foreground').trim()

      const term = new XTerminal({
        theme: { background: bg || '#09090b', foreground: fg || '#fafafa' },
        fontSize: 13,
        fontFamily: "'Courier New', monospace",
        cursorStyle: 'block',
      })
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(container)
      fitAddon.fit()
      termRef.current = term

      const ro = new ResizeObserver(() => fitAddon.fit())
      ro.observe(container)

      return () => {
        ro.disconnect()
        term.dispose()
        termRef.current = null
      }
    }, [])

    return <div ref={containerRef} className={`h-full w-full ${className}`} />
  }
)
