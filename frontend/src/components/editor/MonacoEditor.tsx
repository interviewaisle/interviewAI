'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { EditorProps, OnMount, Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useWorkspace } from '@/store/workspace'
import type { SubmissionFile } from '@/types'

const MonacoEditorDynamic = dynamic<EditorProps>(
  () => import('@monaco-editor/react'),
  { ssr: false }
)

function langFromFilename(name: string): string {
  const ext = name.split('.').pop() ?? ''
  if (ext === 'py') return 'python'
  if (ext === 'ts') return 'typescript'
  if (ext === 'js') return 'javascript'
  return 'plaintext'
}

// Monaco's theme config can't read CSS variables, so we read the computed
// token values at runtime and build a theme that matches the app surface.
// (Same established pattern as Terminal.tsx.)
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function applyAppTheme(monaco: Monaco): void {
  const isDark = document.documentElement.classList.contains('dark')
  const bg = cssVar('--surface-raised')
  const fg = cssVar('--foreground')
  const muted = cssVar('--muted')
  const overlay = cssVar('--surface-overlay')
  const primary = cssVar('--primary')
  monaco.editor.defineTheme('interviewai', {
    base: isDark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': bg,
      'editor.foreground': fg,
      'editorLineNumber.foreground': muted,
      'editorLineNumber.activeForeground': fg,
      'editor.lineHighlightBackground': overlay,
      'editor.selectionBackground': primary + '3a',
      'editorCursor.foreground': primary,
      'editorGutter.background': bg,
    },
  })
  monaco.editor.setTheme('interviewai')
}

interface MonacoEditorProps {
  starterFiles: SubmissionFile[]
  activeFileId: string
}

export function MonacoEditor({ starterFiles, activeFileId }: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const modelsRef = useRef<Map<string, editor.ITextModel>>(new Map())
  const { upsertFile } = useWorkspace()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance
    monacoRef.current = monaco
    applyAppTheme(monaco)
    for (const file of starterFiles) {
      if (!modelsRef.current.has(file.name)) {
        const model = monaco.editor.createModel(file.content, langFromFilename(file.name))
        modelsRef.current.set(file.name, model)
      }
    }
    const model = modelsRef.current.get(activeFileId)
    if (model) editorInstance.setModel(model)
  }

  // Re-theme when the app light/dark toggle flips the <html> class
  useEffect(() => {
    const obs = new MutationObserver(() => {
      if (monacoRef.current) applyAppTheme(monacoRef.current)
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const editorInstance = editorRef.current
    if (!editorInstance) return
    const model = modelsRef.current.get(activeFileId)
    if (model) editorInstance.setModel(model)
  }, [activeFileId])

  useEffect(() => {
    const debounce = debounceRef
    const models = modelsRef
    const editorRefAtMount = editorRef
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
      // Detach the model before disposing it — otherwise the editor's view
      // can still hold a reference to a model that just got disposed, and a
      // queued resize/layout callback crashes trying to read from it.
      editorRefAtMount.current?.setModel(null)
      models.current.forEach((m) => m.dispose())
    }
  }, [])

  return (
    <MonacoEditorDynamic
      theme="interviewai"
      height="100%"
      onMount={handleMount}
      onChange={(value) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
          upsertFile(activeFileId, { content: value ?? '' })
        }, 300)
      }}
      options={{ minimap: { enabled: false }, fontSize: 14 }}
    />
  )
}
