import React, { useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { MonacoBinding } from 'y-monaco'

interface CodeEditorProps {
  language?: string
  theme?: 'light' | 'vs-dark'
  yTextRef: React.RefObject<any>
  providerRef: React.RefObject<any>
}

const injectCursorStyle = (clientId: number, color: string, name: string) => {
  const styleId = `cursor-style-${clientId}`
  if (document.getElementById(styleId)) return // already added
  const style = document.createElement('style')
  style.id = styleId
  style.innerHTML = `
    .remote-cursor-${clientId} {
    background-color: ${color};
    width: 2px;
    height: 100%;
  }
  .remote-cursor-${clientId}::after {
  content: '${name}';
  position: absolute;
  background: ${color};
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
  transform: translateY(100%);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none; /* so it doesn't block mouse events */
  transition: opacity 0.2s ease;
}

.remote-cursor-${clientId}:hover::after {
  opacity: 1;
  pointer-events: auto;
}
  `
  document.head.appendChild(style)
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, theme, yTextRef, providerRef }) => {
  const editorRef = useRef<any>(null)
  const monacoBindingRef = useRef<MonacoBinding | null>(null)

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
  
    const model = editor.getModel()
    const awareness = providerRef.current?.awareness
    if (!model || !yTextRef.current || !providerRef.current || !awareness) return
  
    // Set up Monaco binding
    monacoBindingRef.current = new MonacoBinding(
      yTextRef.current,
      model,
      new Set([editor]),
      awareness
    )
  
    // Track cursor position
    const updateCursor = () => {
      const selection = editor.getSelection()
      if (selection) {
        awareness.setLocalStateField('cursor', {
          position: selection.getPosition(),
          selection: {
            start: selection.getStartPosition(),
            end: selection.getEndPosition(),
          }
        })
      }
    }
  
    const disposable = editor.onDidChangeCursorPosition(updateCursor)
    updateCursor()
  
    // Decorations for remote cursors
    const decorationsRef = { current: [] as string[] }
    monaco.editor.defineTheme('my-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#35982c',
      },
    })
  
    const renderCursors = () => {
      const states = Array.from(awareness.getStates().entries()) as [number, any][]
      const currentClientID = awareness.clientID
  
      const otherCursors = states.filter(([clientId]) => clientId !== currentClientID)
  
      const newDecorations = otherCursors.map(([clientId, state]) => {
        const { cursor, user } = state
        if (!cursor || !user) return null
  
        const className = `remote-cursor remote-cursor-${clientId}`
        injectCursorStyle(clientId, user.hex, user.name)
  
        return {
          range: new monaco.Range(
            cursor.position.lineNumber,
            cursor.position.column,
            cursor.position.lineNumber,
            cursor.position.column
          ),
          options: {
            className,
            afterContentClassName: className,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
          }
        }
      }).filter(Boolean) as monaco.editor.IModelDeltaDecoration[]
  
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], newDecorations)
      if (!otherCursors.length) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [])
      }
    }
  
    awareness.on('change', renderCursors)
  
    // Cleanup
    return () => {
      monacoBindingRef.current?.destroy()
      disposable.dispose()
      awareness.off('change', renderCursors)
    }
  }
  

  return (
      <Editor
        height="100%"
        language={language === 'react' ? 'javascript' : language || 'javascript'} 
        theme={theme}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: 'on',
        }}
      />
  )
}

export default CodeEditor
