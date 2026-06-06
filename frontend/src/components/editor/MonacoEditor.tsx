'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { EditorProps, OnMount } from '@monaco-editor/react'
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

interface MonacoEditorProps {
  starterFiles: SubmissionFile[]
  activeFileId: string
}

export function MonacoEditor({ starterFiles, activeFileId }: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const modelsRef = useRef<Map<string, editor.ITextModel>>(new Map())
  const { upsertFile } = useWorkspace()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance
    for (const file of starterFiles) {
      if (!modelsRef.current.has(file.name)) {
        const model = monaco.editor.createModel(file.content, langFromFilename(file.name))
        modelsRef.current.set(file.name, model)
      }
    }
    const model = modelsRef.current.get(activeFileId)
    if (model) editorInstance.setModel(model)
  }

  useEffect(() => {
    const editorInstance = editorRef.current
    if (!editorInstance) return
    const model = modelsRef.current.get(activeFileId)
    if (model) editorInstance.setModel(model)
  }, [activeFileId])

  useEffect(() => {
    const debounce = debounceRef
    const models = modelsRef
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
      models.current.forEach((m) => m.dispose())
    }
  }, [])

  return (
    <MonacoEditorDynamic
      theme="vs-dark"
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
