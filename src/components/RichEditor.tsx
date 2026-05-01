"use client";

import { EditorContent, Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

interface RichEditorProps {
  editor: Editor | null;
  pageWidthPx: number;
  pageHeightPx: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  showPageNumbers?: boolean;
}

export default function RichEditor({
  editor,
  pageWidthPx,
  pageHeightPx,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  showPageNumbers = true,
}: RichEditorProps) {
  const [numPages, setNumPages] = useState(1);

  useEffect(() => {
    if (!editor || !editor.options.element) return;
    
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height + paddingTop + paddingBottom;
        const pages = Math.max(1, Math.ceil(height / pageHeightPx));
        setNumPages(pages);
      }
    });

    obs.observe(editor.options.element);
    return () => obs.disconnect();
  }, [editor, pageHeightPx, paddingTop, paddingBottom]);

  if (!editor) {
    return (
      <div 
        className="bg-white shadow-xl animate-pulse" 
        style={{ width: pageWidthPx, height: pageHeightPx }} 
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Camada de Páginas (Background) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {Array.from({ length: numPages }).map((_, i) => (
          <div 
            key={i}
            className="bg-white shadow-[0_10px_50px_rgba(0,0,0,0.1)] border border-paper-dark"
            style={{
              width: `${pageWidthPx}px`,
              height: `${pageHeightPx}px`,
              marginBottom: "20px",
              position: "relative",
            }}
          >
            {showPageNumbers && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-sans font-bold text-ink-300">
                — {i + 1} —
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Camada do Editor */}
      <div
        className="text-ink cursor-text z-10 transition-all duration-300 ease-in-out"
        style={{
          width: `${pageWidthPx}px`,
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom + 100}px`,
          paddingLeft: `${paddingLeft}px`,
          paddingRight: `${paddingRight}px`,
          minHeight: `${pageHeightPx}px`,
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Numeração Lateral */}
      {showPageNumbers && (
        <div className="absolute left-[calc(100%+20px)] top-0 h-full pointer-events-none hidden lg:block">
          {Array.from({ length: numPages }).map((_, i) => (
            <div 
              key={i} 
              className="text-ink-200 font-sans text-[9px] font-bold uppercase tracking-widest"
              style={{ position: "absolute", top: `${(i * (pageHeightPx + 20)) + 40}px` }}
            >
              Página {i + 1}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
