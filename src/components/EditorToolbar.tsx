"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Minus,
  Clapperboard,
  Settings,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  BookOpen,
  Feather,
  LayoutGrid,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor | null;
  pageLabel: string;
  writingMode: string;
  onOpenPageSettings: () => void;
}

interface ToolBtn {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  active?: boolean;
  disabled?: boolean;
}

export default function EditorToolbar({ editor, pageLabel, writingMode, onOpenPageSettings }: ToolbarProps) {
  if (!editor) return null;

  const btn = (props: ToolBtn) => (
    <button
      key={props.label}
      onClick={props.action}
      disabled={props.disabled}
      title={props.label}
      className={`p-1.5 rounded transition-colors ${
        props.active
          ? "bg-bronze/20 text-bronze-dark"
          : "text-ink-700 hover:bg-paper-dark"
      } ${props.disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {props.icon}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-paper-dark mx-1 shrink-0" />;

  return (
    <div className="h-12 border-b border-paper-dark bg-paper flex items-center px-4 gap-1 shrink-0 overflow-x-auto">

      {/* Estilo de bloco */}
      <select
        value={
          editor.isActive("heading", { level: 1 }) ? "h1"
          : editor.isActive("heading", { level: 2 }) ? "h2"
          : editor.isActive("heading", { level: 3 }) ? "h3"
          : "paragraph"
        }
        onChange={(e) => {
          const v = e.target.value;
          if (v === "paragraph") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: Number(v[1]) as 1 | 2 | 3 }).run();
        }}
        className="font-sans text-sm border border-paper-dark rounded px-2 py-1 bg-white text-ink outline-none focus:border-bronze shrink-0 mr-1"
      >
        <option value="paragraph">Parágrafo</option>
        <option value="h1">Título 1</option>
        <option value="h2">Título 2</option>
        <option value="h3">Título 3</option>
      </select>

      <Divider />

      {/* Inline */}
      {btn({ icon: <Bold size={15} />, label: "Negrito (Ctrl+B)", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") })}
      {btn({ icon: <Italic size={15} />, label: "Itálico (Ctrl+I)", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") })}
      {btn({ icon: <UnderlineIcon size={15} />, label: "Sublinhado (Ctrl+U)", action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline") })}
      {btn({ icon: <Strikethrough size={15} />, label: "Tachado", action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike") })}

      <Divider />

      {/* Alinhamento */}
      {btn({ icon: <AlignLeft size={15} />, label: "Alinhar à esquerda", action: () => editor.chain().focus().setTextAlign("left").run(), active: editor.isActive({ textAlign: "left" }) })}
      {btn({ icon: <AlignCenter size={15} />, label: "Centralizar", action: () => editor.chain().focus().setTextAlign("center").run(), active: editor.isActive({ textAlign: "center" }) })}
      {btn({ icon: <AlignRight size={15} />, label: "Alinhar à direita", action: () => editor.chain().focus().setTextAlign("right").run(), active: editor.isActive({ textAlign: "right" }) })}
      {btn({ icon: <AlignJustify size={15} />, label: "Justificar", action: () => editor.chain().focus().setTextAlign("justify").run(), active: editor.isActive({ textAlign: "justify" }) })}

      <Divider />

      {/* Listas */}
      {btn({ icon: <List size={15} />, label: "Lista com marcadores", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") })}
      {btn({ icon: <ListOrdered size={15} />, label: "Lista numerada", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") })}
      {btn({ icon: <Quote size={15} />, label: "Citação", action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") })}
      {btn({ icon: <Minus size={15} />, label: "Linha horizontal", action: () => editor.chain().focus().setHorizontalRule().run() })}

      <Divider />

      {/* Histórico */}
      {btn({ icon: <Undo2 size={15} />, label: "Desfazer (Ctrl+Z)", action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo() })}
      {btn({ icon: <Redo2 size={15} />, label: "Refazer (Ctrl+Y)", action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo() })}

      {/* Menu Específico por Modo */}
      {writingMode !== "Prosa" && (
        <>
          <Divider />
          <div className="flex items-center gap-1 shrink-0">
            {writingMode === "Roteiro Cinema" && (
              <>
                <Clapperboard size={14} className="text-forest ml-1" />
                <select
                  onChange={(e) => e.target.value && (editor.commands as any).setScreenplayType(e.target.value)}
                  className="font-sans text-xs border border-paper-dark rounded px-2 py-1 bg-white text-ink outline-none focus:border-forest shrink-0"
                  defaultValue=""
                >
                  <option value="" disabled>Roteiro Cinema</option>
                  <option value="scene">Cabeçalho (Alt+1)</option>
                  <option value="action">Ação (Alt+2)</option>
                  <option value="character">Personagem (Alt+3)</option>
                  <option value="dialogue">Diálogo (Alt+4)</option>
                  <option value="parenthetical">Parentético (Alt+5)</option>
                  <option value="transition">Transição (Alt+6)</option>
                </select>
              </>
            )}

            {writingMode === "Roteiro HQ" && (
              <>
                <LayoutGrid size={14} className="text-blue-600 ml-1" />
                <select
                  onChange={(e) => e.target.value && (editor.commands as any).setScreenplayType(e.target.value)}
                  className="font-sans text-xs border border-paper-dark rounded px-2 py-1 bg-white text-ink outline-none focus:border-blue-600 shrink-0"
                  defaultValue=""
                >
                  <option value="" disabled>Roteiro HQ</option>
                  <option value="scene">Página</option>
                  <option value="action">Painel</option>
                  <option value="character">Personagem</option>
                  <option value="dialogue">Balão de Fala</option>
                  <option value="transition">Recordatório</option>
                </select>
              </>
            )}

            {writingMode === "Livro" && (
              <>
                <BookOpen size={14} className="text-bronze ml-1" />
                <select
                  className="font-sans text-xs border border-paper-dark rounded px-2 py-1 bg-white text-ink outline-none focus:border-bronze shrink-0"
                  defaultValue=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "capitulo") editor.chain().focus().toggleHeading({ level: 2 }).run();
                    if (v === "prologo") editor.chain().focus().toggleHeading({ level: 1 }).run();
                    if (v === "dialogo") (editor.commands as any).setScreenplayType("dialogue");
                    if (v === "cena") editor.chain().focus().setHorizontalRule().run();
                  }}
                >
                  <option value="" disabled>Estrutura Livro</option>
                  <option value="prologo">Prólogo / Título</option>
                  <option value="capitulo">Novo Capítulo</option>
                  <option value="dialogo">Diálogo</option>
                  <option value="cena">Quebra de Cena (***)</option>
                </select>
              </>
            )}

            {writingMode === "Poesia" && (
              <>
                <Feather size={14} className="text-violet ml-1" />
                <select
                  className="font-sans text-xs border border-paper-dark rounded px-2 py-1 bg-white text-ink outline-none focus:border-violet shrink-0"
                  defaultValue=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "estrofe") editor.chain().focus().setParagraph().setTextAlign("center").run();
                    if (v === "verso") editor.chain().focus().setParagraph().run();
                  }}
                >
                  <option value="" disabled>Poesia</option>
                  <option value="estrofe">Nova Estrofe (Centro)</option>
                  <option value="verso">Verso</option>
                  <option value="dialogo">Diálogo</option>
                </select>
              </>
            )}
          </div>
        </>
      )}


      {/* Configurações de Página (direita) */}
      <div className="ml-auto shrink-0">
        <button
          onClick={onOpenPageSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-paper-dark rounded transition-colors border border-paper-dark"
        >
          <Settings size={14} />
          {pageLabel}
        </button>
      </div>
    </div>
  );
}
