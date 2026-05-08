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

const PAGE_GAP = 32;

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
  const deadZone = paddingBottom + PAGE_GAP + paddingTop;
  const stride = contentAreaHeight + deadZone;

  const [pageCount, setPageCount] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const applyPageBreaks = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const tiptap = wrapper.querySelector(".tiptap") as HTMLElement | null;
    if (!tiptap) return;
    const blocks = Array.from(tiptap.children) as HTMLElement[];
    if (!blocks.length) { setPageCount(1); return; }

    // 1. Clear all injected margins
    for (const b of blocks) {
      if (b.dataset.pb) {
        b.style.marginTop = "";
        delete b.dataset.pb;
      }
    }
    // 2. Reflow
    void tiptap.offsetHeight;

    // 3. Origin = top of .tiptap element
    const originY = tiptap.getBoundingClientRect().top;
    let maxPage = 1;

    // 4. Process blocks sequentially
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Measure block relative to editor top
      let rect = block.getBoundingClientRect();
      let top = rect.top - originY;
      let bottom = rect.bottom - originY;

      // Current page index (1-based)
      const page = Math.floor(top / stride) + 1;
      const pageContentEnd = (page - 1) * stride + contentAreaHeight;

      // If block starts in the dead zone OR straddles the content end boundary
      if (top > pageContentEnd - 1 || (bottom > pageContentEnd + 1 && top < pageContentEnd - 1)) {
        const nextStart = page * stride;
        const push = nextStart - top;
        
        if (push > 0) {
          block.style.marginTop = `${push}px`;
          block.dataset.pb = "1";
          
          // Re-measure after applying margin to affect subsequent blocks
          void tiptap.offsetHeight; 
          rect = block.getBoundingClientRect();
          bottom = rect.bottom - originY;
        }
      }

      // Track max page needed based on the bottom of this block
      const blockBottomPage = Math.floor((bottom - 1) / stride) + 1;
      if (blockBottomPage > maxPage) maxPage = blockBottomPage;
    }

    setPageCount(maxPage);
  }, [contentAreaHeight, stride]);

  useEffect(() => {
    if (!editor) return;
    const run = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyPageBreaks);
    };
    const t = setTimeout(run, 200);
    editor.on("update", run);
    editor.on("selectionUpdate", run);
    let ro: ResizeObserver | null = null;
    if (wrapperRef.current) {
      ro = new ResizeObserver(run);
      const el = wrapperRef.current.querySelector(".tiptap");
      if (el) ro.observe(el);
    }
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
      editor.off("update", run);
      editor.off("selectionUpdate", run);
      ro?.disconnect();
    };
  }, [editor, applyPageBreaks]);

  if (!editor) {
    return <div className="bg-white shadow-lg animate-pulse" style={{ width: pageWidthPx, height: pageHeightPx }} />;
  }

  const totalH = pageCount * pageHeightPx + (pageCount - 1) * PAGE_GAP;

  return (
    <div className={`relative ${isRoteiro ? "writing-mode-roteiro" : ""}`} style={{ width: pageWidthPx, minHeight: totalH }}>
      {/* Page cards */}
      {Array.from({ length: pageCount }).map((_, i) => (
        <div
          key={i}
          className="absolute left-0 bg-white"
          style={{
            width: pageWidthPx,
            height: pageHeightPx,
            top: i * (pageHeightPx + PAGE_GAP),
            boxShadow: "0 1px 4px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* Bottom margin line */}
          <div className="absolute left-0 right-0 pointer-events-none" style={{
            bottom: paddingBottom,
            marginLeft: paddingLeft,
            marginRight: paddingRight,
            borderTop: "1px dashed rgba(184,149,106,0.25)",
          }} />
          {/* Page number */}
          {showPageNumbers && (isRoteiro ? i > 0 : true) && (
            <div className="absolute select-none pointer-events-none" style={{
              top: paddingTop / 2 - 5,
              right: paddingRight,
              fontFamily: isRoteiro ? "'Courier New', monospace" : "var(--font-sans)",
              fontSize: isRoteiro ? "12pt" : "10px",
              color: "#aaa",
            }}>
              {i + 1}.
            </div>
          )}
        </div>
      ))}

      {/* Editor */}
      <div ref={wrapperRef} className="absolute top-0 left-0" style={{
        width: pageWidthPx,
        paddingTop, paddingLeft, paddingRight, paddingBottom,
        minHeight: totalH,
      }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}