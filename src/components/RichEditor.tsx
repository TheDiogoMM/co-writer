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
  
  const pageContentHeight = pageHeightPx - paddingTop - paddingBottom;
  const [pageCount, setPageCount] = useState(1);
  
  // Calcular capacidade aproximado
  const avgLineHeight = 24;
  const usableWidth = pageWidthPx - paddingLeft - paddingRight;
  const avgCharWidth = 9;
  const charsPerLine = Math.floor(usableWidth / avgCharWidth);
  const linesPerPage = Math.floor(pageContentHeight / avgLineHeight);
  const charsPerPage = charsPerLine * linesPerPage;

  useEffect(() => {
    if (!editor) return;
    
    const check = () => {
      const text = editor.getText();
      const count = Math.max(1, Math.ceil(text.length / charsPerPage) + 1);
      setPageCount(Math.min(count, 40));
    };
    
    check();
    editor.on('update', check);
  }, [editor, charsPerPage]);

  if (!editor) {
    return <div className="bg-white shadow animate-pulse" style={{ width: pageWidthPx, height: pageHeightPx }} />;
  }

  return (
    <div className={`relative ${isRoteiro ? 'writing-mode-roteiro' : ''}`}>
      {/* Páginas A4 */}
      {Array.from({ length: pageCount }).map((_, i) => (
        <div
          key={i}
          className="bg-white shadow-lg border border-gray-300 absolute"
          style={{ width: pageWidthPx, height: pageHeightPx, top: i * pageContentHeight }}
        >
          {/* Margens */}
          <div 
            className="absolute border border-dashed border-amber-300"
            style={{ top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight }}
          />
          
          {/* Número */}
          {showPageNumbers && (
            <div className="absolute text-gray-500" style={{ bottom: paddingBottom / 2, left: '50%', transform: 'translateX(-50%)' }}>
              — {i + 1} —
            </div>
          )}
        </div>
      ))}
      
      {/* Editor */}
      <div className="absolute" style={{ padding: paddingTop, paddingLeft, paddingRight, paddingBottom: pageContentHeight, width: pageWidthPx }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}