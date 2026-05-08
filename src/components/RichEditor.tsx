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

const PAGE_GAP = 32; // visible gap between page cards

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
  // "stride" = distance from start of one page's content to start of next page's content
  const stride = contentAreaHeight + paddingBottom + PAGE_GAP + paddingTop;

  const [pageCount, setPageCount] = useState(1);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // ── Page break engine ──────────────────────────────────────────────
  // Walks every top-level block in the Tiptap DOM.
  // If a block's bottom edge would exceed the current page's printable
  // area, injects margin-top to push it to the next page's content area.
  const applyPageBreaks = useCallback(() => {
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return;
    const tiptapEl = wrapper.querySelector(".tiptap") as HTMLElement | null;
    if (!tiptapEl) return;
    const blocks = tiptapEl.children;
    if (!blocks.length) { setPageCount(1); return; }

    // 1. Reset all previously injected page-break spacing
    for (let i = 0; i < blocks.length; i++) {
      const el = blocks[i] as HTMLElement;
      if (el.dataset.pageBreakMargin) {
        el.style.marginTop = "";
        delete el.dataset.pageBreakMargin;
      }
    }

    // 2. Force reflow
    void tiptapEl.offsetHeight;

    // 3. Get the top of the content area (the .tiptap element)
    const contentTop = tiptapEl.getBoundingClientRect().top;

    // 4. Walk blocks and inject breaks
    // Track how much extra space we've injected so far
    let injectedSpace = 0;
    let currentPage = 1;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i] as HTMLElement;
      const rect = block.getBoundingClientRect();

      // Block position relative to content start, minus injected space
      // = the "natural" position without page breaks
      const naturalTop = rect.top - contentTop - injectedSpace;
      const naturalBottom = rect.bottom - contentTop - injectedSpace;

      // Where does the current page's content area end (in natural coords)?
      const pageEnd = (currentPage - 1) * contentAreaHeight + contentAreaHeight;

      // If block crosses the page boundary...
      if (naturalBottom > pageEnd && naturalTop < pageEnd) {
        // Push this block to the start of the next page's content area
        const nextPageStart = currentPage * contentAreaHeight;
        // The actual push in rendered pixels must also account for
        // the gap (bottom margin + visual gap + top margin)
        const gapPixels = paddingBottom + PAGE_GAP + paddingTop;
        const pushAmount = (nextPageStart - naturalTop) + (currentPage * gapPixels);
        // But we already injected some space, so the actual CSS margin is:
        const cssMargin = pushAmount - injectedSpace + (injectedSpace > 0 ? 0 : 0);

        // Simpler: compute desired rendered position
        const desiredRenderedTop = currentPage * stride;
        const currentRenderedTop = rect.top - contentTop;
        const margin = desiredRenderedTop - currentRenderedTop;

        if (margin > 0) {
          block.style.marginTop = `${margin}px`;
          block.dataset.pageBreakMargin = "true";
          injectedSpace += margin;
        }
        currentPage++;
      } else if (naturalTop >= pageEnd) {
        // Block is entirely past the current page — advance page counter
        while (currentPage * contentAreaHeight <= naturalTop) {
          currentPage++;
        }
      }
    }

    // 5. Calculate total pages from the last block's rendered position
    const lastBlock = blocks[blocks.length - 1] as HTMLElement;
    const lastBottom = lastBlock.getBoundingClientRect().bottom - contentTop;
    const totalPages = Math.max(1, Math.ceil(lastBottom / stride) || 1);
    setPageCount(totalPages);
  }, [contentAreaHeight, stride, paddingTop, paddingBottom]);

  // Run the page break engine on every editor update
  useEffect(() => {
    if (!editor) return;

    const run = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyPageBreaks);
    };

    const timer = setTimeout(run, 200);
    editor.on("update", run);
    editor.on("selectionUpdate", run);

    // ResizeObserver for dynamic changes
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

  const totalHeight = pageCount * pageHeightPx + (pageCount - 1) * PAGE_GAP;

  return (
    <div
      className={`relative ${isRoteiro ? "writing-mode-roteiro" : ""}`}
      style={{ width: pageWidthPx, minHeight: totalHeight }}
    >
      {/* ── Page cards ────────────────────────────────────────────── */}
      {Array.from({ length: pageCount }).map((_, i) => (
        <div
          key={`page-${i}`}
          className="absolute left-0 bg-white"
          style={{
            width: pageWidthPx,
            height: pageHeightPx,
            top: i * (pageHeightPx + PAGE_GAP),
            boxShadow: "0 1px 4px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* Bottom margin indicator */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              bottom: paddingBottom,
              marginLeft: paddingLeft,
              marginRight: paddingRight,
              borderTop: "1px dashed rgba(184,149,106,0.2)",
            }}
          />

          {/* Page number */}
          {showPageNumbers && (isRoteiro ? i > 0 : true) && (
            <div
              className="absolute select-none pointer-events-none"
              style={{
                top: paddingTop / 2 - 5,
                right: paddingRight,
                fontFamily: isRoteiro ? "'Courier New', monospace" : "var(--font-sans)",
                fontSize: isRoteiro ? "12pt" : "10px",
                color: "#aaa",
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
          paddingBottom,
          minHeight: totalHeight,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}