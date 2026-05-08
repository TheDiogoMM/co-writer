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

const PAGE_GAP = 24; // gap between pages in pixels

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

  // The printable area height inside a single page
  const contentAreaHeight = pageHeightPx - paddingTop - paddingBottom;

  const [pageCount, setPageCount] = useState(1);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // ── Page break engine ──────────────────────────────────────────────
  // Walk every top-level block in the rendered editor DOM.
  // If a block's bottom edge would exceed the current page's content
  // area, inject a margin-top on that block to push it to the next
  // page's content area.
  const applyPageBreaks = useCallback(() => {
    if (!editorWrapperRef.current) return;
    const tiptapEl = editorWrapperRef.current.querySelector(".tiptap") as HTMLElement | null;
    if (!tiptapEl) return;

    const blocks = tiptapEl.children;
    if (!blocks.length) { setPageCount(1); return; }

    // Reset all previously injected spacing
    for (let i = 0; i < blocks.length; i++) {
      (blocks[i] as HTMLElement).style.marginTop = "";
    }

    // Force a reflow so measurements are fresh
    void tiptapEl.offsetHeight;

    // The top of the editor content in viewport coords
    const editorTop = tiptapEl.getBoundingClientRect().top;

    let currentPage = 1;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i] as HTMLElement;
      const blockRect = block.getBoundingClientRect();

      // Block's position relative to the editor content start
      const blockTop = blockRect.top - editorTop;
      const blockBottom = blockRect.bottom - editorTop;

      // Where the current page's content area ends
      // Pages stack: page N's content area starts at
      //   (N-1) * (contentAreaHeight + paddingTop + paddingBottom + PAGE_GAP) + paddingTop
      // and ends at that + contentAreaHeight
      const pageContentStart = (currentPage - 1) * (pageHeightPx + PAGE_GAP) + paddingTop;
      const pageContentEnd = pageContentStart + contentAreaHeight;

      // If the block's bottom exceeds the page content area...
      if (blockBottom > pageContentEnd && blockTop < pageContentEnd) {
        // Push this block to the next page's content start
        const nextPageContentStart = currentPage * (pageHeightPx + PAGE_GAP) + paddingTop;
        const pushAmount = nextPageContentStart - blockTop;
        if (pushAmount > 0) {
          block.style.marginTop = `${pushAmount}px`;
        }
        currentPage++;
      } else if (blockTop >= (currentPage) * (pageHeightPx + PAGE_GAP)) {
        // Block is already past the current page entirely
        currentPage = Math.floor(blockTop / (pageHeightPx + PAGE_GAP)) + 1;
      }
    }

    // Determine total pages needed
    const lastBlock = blocks[blocks.length - 1] as HTMLElement;
    const lastBlockBottom = lastBlock.getBoundingClientRect().bottom - editorTop;
    const totalPages = Math.max(1, Math.ceil(lastBlockBottom / (pageHeightPx + PAGE_GAP)));
    setPageCount(totalPages);
  }, [contentAreaHeight, pageHeightPx, paddingTop, paddingBottom]);

  // Run the page break engine on every editor update and resize
  useEffect(() => {
    if (!editor) return;

    const run = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyPageBreaks);
    };

    // Initial run after mount
    const timer = setTimeout(run, 150);
    editor.on("update", run);
    editor.on("selectionUpdate", run);

    // Watch for resize changes
    let ro: ResizeObserver | null = null;
    if (editorWrapperRef.current) {
      ro = new ResizeObserver(run);
      const tiptap = editorWrapperRef.current.querySelector(".tiptap");
      if (tiptap) ro.observe(tiptap);
    }

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
      editor.off("update", run);
      editor.off("selectionUpdate", run);
      ro?.disconnect();
    };
  }, [editor, applyPageBreaks]);

  // ── Render ─────────────────────────────────────────────────────────
  if (!editor) {
    return (
      <div
        className="bg-white shadow-lg animate-pulse rounded"
        style={{ width: pageWidthPx, height: pageHeightPx }}
      />
    );
  }

  // Total canvas height including gaps
  const totalHeight = pageCount * pageHeightPx + (pageCount - 1) * PAGE_GAP;

  return (
    <div
      className={`relative ${isRoteiro ? "writing-mode-roteiro" : ""}`}
      style={{ width: pageWidthPx, minHeight: totalHeight }}
    >
      {/* ── Page backgrounds ─────────────────────────────────────── */}
      {Array.from({ length: pageCount }).map((_, i) => (
        <div
          key={`page-bg-${i}`}
          className="absolute left-0 bg-white"
          style={{
            width: pageWidthPx,
            height: pageHeightPx,
            top: i * (pageHeightPx + PAGE_GAP),
            boxShadow: "0 1px 4px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* ── Margin guides (subtle dashed lines) ──── */}
          {/* Top margin line */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: paddingTop,
              marginLeft: paddingLeft,
              marginRight: paddingRight,
              borderBottom: "1px dashed rgba(184,149,106,0.15)",
            }}
          />
          {/* Bottom margin line */}
          <div
            className="absolute left-0 right-0"
            style={{
              bottom: paddingBottom,
              marginLeft: paddingLeft,
              marginRight: paddingRight,
              borderTop: "1px dashed rgba(184,149,106,0.15)",
            }}
          />

          {/* ── Page number ──── */}
          {showPageNumbers && (isRoteiro ? i > 0 : true) && (
            <div
              className="absolute select-none pointer-events-none"
              style={{
                top: paddingTop / 2 - 5,
                right: paddingRight,
                fontFamily: isRoteiro ? "'Courier New', monospace" : "inherit",
                fontSize: isRoteiro ? "12pt" : "10px",
                color: "#999",
              }}
            >
              {i + 1}.
            </div>
          )}
        </div>
      ))}

      {/* ── Editor content ────────────────────────────────────────── */}
      <div
        ref={editorWrapperRef}
        className="absolute top-0 left-0"
        style={{
          width: pageWidthPx,
          paddingTop,
          paddingLeft,
          paddingRight,
          // Bottom padding ensures last page has room
          paddingBottom: paddingBottom,
          minHeight: totalHeight,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}