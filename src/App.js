import React, { useCallback, useState, useMemo } from "react";
import { createEditor, Editor, Transforms, Text } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

const customEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(
      editor,
      {
        match: n => n.bold === true,
        universal: true
      }
    )

    return !!match
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(
      editor,
      { match: n => n.type === 'code' }
    )
    return !!match
  },
  toggleCodeBlock(editor) {
    const isActive = customEditor.isCodeBlockActive(editor)

    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    )
  },
  toggleBoldMark(editor) {
    const isActive = customEditor.isBoldMarkActive(editor)
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: n => Text.isText(n), split: true }
    )
  }
}
const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}
const DefaultElement = (props) => {
  return (
    <>
      <p {...props.attributes}> {props.children}</p>
    </>

  )
}
const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  )
}

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = useState(
    JSON.parse(localStorage.getItem('content')) || [
      {
        type: 'paragraph',
        children: [{ text: 'A line of text in a paragraph.' }],
      },
    ]
  )

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  // Define a leaf rendering function that is memoized with `useCallback`.
  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])

  return (
    <Slate editor={editor} value={value} onChange={value => {
      setValue(value)
      const isAstChange = editor.operations.some(
        op => 'set_selection' !== op.type
      )
      if (isAstChange) {
        // Save the value to Local Storage.
        const content = JSON.stringify(value)
        localStorage.setItem('content', content)
      }
    }}>
      <button onClick={(event) => {
        event.preventDefault()
        customEditor.toggleCodeBlock(editor)
      }
      }>
        codeBlock
      </button>

      <button onClick={(event) => {
        event.preventDefault()
        customEditor.toggleBoldMark(editor)
      }}>
        bold
      </button>
      <Editable
        renderElement={renderElement}
        // Pass in the `renderLeaf` function.
        renderLeaf={renderLeaf}
        onKeyDown={event => {
          if (!event.ctrlKey) {
            return
          }

          switch (event.key) {
            case '`':
              event.preventDefault()
              customEditor.toggleCodeBlock(editor)
              break
            case 'b':
              event.preventDefault()
              customEditor.toggleBoldMark(editor)
              break
            default:
              return
          }
        }}
      />
    </Slate>
  )
}
export default App;
