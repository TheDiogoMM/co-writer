"use client";

import { EditorContent, Editor } from "@tiptap/react";
import { useEffect, useRef, useState, useCallback } from "react";

interface RichEditorProps {
  editor: Editor | null;
  pageWidthPx: number;
  pageHeightPx: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  writingMode: string;
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
  writingMode,
  showPageNumbers = true,
}: RichEditorProps) {
  const isRoteiro = writingMode === "Roteiro Cinema";
  const contentAreaHeight = pageHeightPx - paddingTop - paddingBottom;
  const [pageCount, setPageCount] = useState(1);
  const measureRef = useRef<HTMLDivElement>(null);

  // Measure actual content height and calculate pages
  const recalcPages = useCallback(() => {
    if (!measureRef.current) return;
    const editorEl = measureRef.current.querySelector(".tiptap");
    if (!editorEl) return;
    const contentHeight = editorEl.scrollHeight;
    const pages = Math.max(1, Math.ceil(contentHeight / contentAreaHeight));
    setPageCount(pages);
  }, [contentAreaHeight]);

  useEffect(() => {
    if (!editor) return;
    // Initial measure after mount
    const timer = setTimeout(recalcPages, 100);
    editor.on("update", recalcPages);
    editor.on("selectionUpdate", recalcPages);
    
    // Also observe resizes
    const ro = new ResizeObserver(recalcPages);
    if (measureRef.current) {
      const tiptap = measureRef.current.querySelector(".tiptap");
      if (tiptap) ro.observe(tiptap);
    }

    return () => {
      clearTimeout(timer);
      editor.off("update", recalcPages);
      editor.off("selectionUpdate", recalcPages);
      ro.disconnect();
    };
  }, [editor, recalcPages]);

  if (!editor) {
    return (
      <div
        className="bg-white shadow-lg animate-pulse rounded"
        style={{ width: pageWidthPx, height: pageHeightPx }}
      />
    );
  }

  const totalHeight = pageCount * pageHeightPx;

  return (
    <div
      className={`relative ${isRoteiro ? "writing-mode-roteiro" : ""}`}
      style={{ width: pageWidthPx, minHeight: totalHeight }}
    >
      {/* Page backgrounds */}
      {Array.from({ length: pageCount }).map((_, i) => (
        <div
          key={`page-${i}`}
          className="absolute left-0 bg-white shadow-lg"
          style={{
            width: pageWidthPx,
            height: pageHeightPx,
            top: i * pageHeightPx,
            borderLeft: "1px solid #d4d4d4",
            borderRight: "1px solid #d4d4d4",
            borderBottom: "1px solid #c8c8c8",
          }}
        >
          {/* Page number */}
          {showPageNumbers && (
            <div
              className="absolute text-xs font-mono select-none"
              style={{
                top: paddingTop / 2 - 6,
                right: paddingRight,
                color: "#999",
              }}
            >
              {i + 1}
            </div>
          )}

          {/* Footer line (margin indicator) */}
          <div
            className="absolute left-0 right-0"
            style={{
              bottom: paddingBottom,
              marginLeft: paddingLeft,
              marginRight: paddingRight,
              borderBottom: "1px dashed rgba(184,149,106,0.2)",
            }}
          />
        </div>
      ))}

      {/* Page separators (visual gap between pages) */}
      {Array.from({ length: Math.max(0, pageCount - 1) }).map((_, i) => (
        <div
          key={`sep-${i}`}
          className="absolute left-0 pointer-events-none"
          style={{
            width: pageWidthPx,
            top: (i + 1) * pageHeightPx - 1,
            height: 2,
            background: "linear-gradient(to right, transparent 10%, #b8956a44 50%, transparent 90%)",
            zIndex: 5,
          }}
        />
      ))}

      {/* Editor content — sits inside the pages with proper padding */}
      <div
        ref={measureRef}
        className="absolute top-0 left-0"
        style={{
          width: pageWidthPx,
          paddingTop,
          paddingLeft,
          paddingRight,
          paddingBottom: paddingBottom + (pageCount - 1) * (paddingTop + paddingBottom),
          minHeight: totalHeight,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}