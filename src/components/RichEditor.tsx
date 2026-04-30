"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import { Editor } from "@tiptap/react";
import { Screenplay } from "@/lib/Screenplay";

export interface RichEditorHandle {
  getEditor: () => Editor | null;
}

interface RichEditorProps {
  pageWidthPx: number;
  pageHeightPx: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  initialTitle: string;
  writingMode: string;
  onTitleChange?: (t: string) => void;
  onEditorReady?: (editor: Editor) => void;
}

const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(function RichEditor(
  {
    pageWidthPx,
    pageHeightPx,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    initialTitle,
    writingMode,
    onTitleChange,
    onEditorReady,
  },
  ref
) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Título…";
          return "Comece a escrever…";
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Screenplay,
    ],
    content: `<h1>${initialTitle}</h1><p></p>`,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full",
        spellcheck: "true",
        lang: "pt-BR",
      },
    },
    onUpdate({ editor }) {
      if (!onTitleChange) return;
      const firstNode = editor.state.doc.firstChild;
      if (firstNode && firstNode.type.name === "heading") {
        const title = firstNode.textContent.trim() || "Sem título";
        onTitleChange(title);
      }
    },
    onCreate({ editor }) {
      onEditorReady?.(editor);
    },
  });

  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
  }));

  // Sincronizar modo de escrita
  useEffect(() => {
    if (editor) {
      const isScreenplay = writingMode === "Roteiro Cinema";
      if ((editor.commands as any).setScreenplayDisabled) {
        (editor.commands as any).setScreenplayDisabled(!isScreenplay);
      }
    }
  }, [editor, writingMode]);

  // Notificar quando editor pronto (fallback)
  useEffect(() => {
    if (editor) onEditorReady?.(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <div
      className="bg-white shadow-[0_4px_32px_rgba(0,0,0,0.18)] text-ink cursor-text"
      style={{
        width: `${pageWidthPx}px`,
        minHeight: `${pageHeightPx}px`,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
      }}
      onClick={() => editor?.chain().focus().run()}
    >
      <EditorContent editor={editor} />
    </div>
  );
});

export default RichEditor;
