"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Editor } from "@tiptap/react";
import {
  PenTool,
  FileText,
  Clapperboard,
  Sparkles,
  Wand2,
  Settings,
  FolderOpen,
  Upload,
  FilePlus,
  ArrowLeft,
  ChevronDown,
  X,
  Loader2,
  List,
  LayoutGrid,
} from "lucide-react";
import RichEditor from "@/components/RichEditor";
import EditorToolbar from "@/components/EditorToolbar";
import { generateContent } from "@/app/actions/ai";
import "./editor.css";

type WelcomeView = "main" | "novoDocumento" | "documentosRecentes";

type PageSize = "A4" | "A5" | "Letter" | "Legal" | "Personalizado";

type WritingMode = "Livro" | "Roteiro Cinema" | "Poesia" | "Roteiro HQ";

interface Persona {
  id: string;
  name: string;
  role: "Escritor" | "Roteirista";
  tags: string[];
  avatarLetter: string;
  bio: string;
  knowledge?: string;
}

const INITIAL_PERSONAS: Persona[] = [
  {
    id: "king",
    name: "Stephen King",
    role: "Escritor",
    tags: ["Terror", "Suspense", "Ficção"],
    avatarLetter: "K",
    bio: "Especialista em criar tensão e desenvolvimento profundo de personagens no gênero de terror.",
    knowledge: "Estilo: Frases diretas, foco em detalhes sensoriais viscerais, diálogos coloquiais, ritmo que alterna entre lentidão descritiva e picos de pânico.",
  },
  {
    id: "tarantino",
    name: "Quentin Tarantino",
    role: "Roteirista",
    tags: ["Crime", "Diálogo", "Não-linear"],
    avatarLetter: "T",
    bio: "Mestre em diálogos rápidos, referências à cultura pop e narrativas não-lineares.",
    knowledge: "Estilo: Diálogos longos e mundanos que escondem tensão, referências pop, palavrões rítmicos, descrições de cena carregadas de atitude e ironia.",
  },
];

interface PageSettings {
  size: PageSize;
  orientacao: "retrato" | "paisagem";
  margemSuperior: number;
  margemInferior: number;
  margemEsquerda: number;
  margemDireita: number;
}

const PAGE_SIZES: Record<PageSize, { width: number; height: number; label: string }> = {
  A4:            { width: 210, height: 297, label: "A4 (210 × 297 mm)" },
  A5:            { width: 148, height: 210, label: "A5 (148 × 210 mm)" },
  Letter:        { width: 216, height: 279, label: "Carta (216 × 279 mm)" },
  Legal:         { width: 216, height: 356, label: "Legal (216 × 356 mm)" },
  Personalizado: { width: 210, height: 297, label: "Personalizado" },
};

// Converte mm para pixels na tela (96 dpi, 1 mm ≈ 3.78px)
const mmToPx = (mm: number) => Math.round(mm * 3.7795275591);

const DEFAULT_SETTINGS: PageSettings = {
  size: "A4",
  orientacao: "retrato",
  margemSuperior: 25,
  margemInferior: 25,
  margemEsquerda: 30,
  margemDireita: 25,
};

export default function CoWriterApp() {
  const [showWelcome, setShowWelcome]           = useState(true);
  const [welcomeView, setWelcomeView]           = useState<WelcomeView>("main");
  const [docTitle, setDocTitle]                 = useState("Sem título");
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [pageSettings, setPageSettings]         = useState<PageSettings>(DEFAULT_SETTINGS);
  const [customW, setCustomW]                   = useState(210);
  const [customH, setCustomH]                   = useState(297);
  const [activeEditor, setActiveEditor]         = useState<Editor | null>(null);
  const [isAiLoading, setIsAiLoading]           = useState(false);
  const [contextMode, setContextMode]           = useState<"selecao" | "capitulo" | "tudo">("selecao");
  const [lengthMode, setLengthMode]             = useState<"paragrafo" | "capitulo">("paragrafo");
  const [writingMode, setWritingMode]           = useState<WritingMode>("Livro");
  const [personas, setPersonas]                 = useState<Persona[]>(INITIAL_PERSONAS);
  const [selectedPersona, setSelectedPersona]   = useState<Persona>(INITIAL_PERSONAS[0]);
  const [showNewPersonaModal, setShowNewPersonaModal] = useState(false);
  const [activeMenu, setActiveMenu]             = useState<string | null>(null);
  const [toc, setToc]                           = useState<{ id: string; text: string; level: number; pos: number }[]>([]);
  const [analysisResult, setAnalysisResult]     = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing]           = useState(false);

  const updateTOC = useCallback((editor: Editor) => {
    const items: { id: string; text: string; level: number; pos: number }[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        items.push({
          id: `h-${pos}`,
          text: node.textContent || "Título sem texto",
          level: node.attrs.level,
          pos: pos,
        });
      }
    });
    setToc(items);
  }, []);

  const handleEditorReady = useCallback((editor: Editor) => {
    setActiveEditor(editor);
    updateTOC(editor);
    
    editor.on("update", ({ editor }) => {
      updateTOC(editor);
    });
  }, [updateTOC]);

  const getContextText = (editor: Editor, mode: "selecao" | "capitulo" | "tudo") => {
    if (mode === "selecao") {
      const { from, to } = editor.state.selection;
      if (from === to) return editor.getText();
      return editor.state.doc.textBetween(from, to, " ");
    }
    return editor.getText();
  };

  const handleCoWrite = async (action: "escrever" | "melhorar") => {
    if (!activeEditor || isAiLoading) return;
    setIsAiLoading(true);

    try {
      const context = getContextText(activeEditor, contextMode);
      const persona = selectedPersona.name;
      const trainingData = selectedPersona.knowledge || "";

      const prompt = action === "melhorar" 
        ? "Melhore o estilo deste texto seguindo sua persona." 
        : `Continue a história de forma fluida (aproximadamente um ${lengthMode}).`;

      const result = await generateContent(prompt, persona, context, trainingData, "creative");
      
      if (result.text) {
        console.log("IA respondeu com sucesso:", result.text.substring(0, 50) + "...");
        if (action === "melhorar") {
          activeEditor.commands.insertContent(result.text);
        } else {
          activeEditor.commands.focus("end");
          activeEditor.commands.insertContent("\n" + result.text);
        }
      } else if (result.error) {
        console.error("Erro retornado pela IA:", result.error);
        alert(`Erro na IA: ${result.error}`);
      }
    } catch (e) {
      console.error("Exceção no handleCoWrite:", e);
      alert("Falha crítica ao conectar com o serviço de IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleConvert = async (newMode: WritingMode) => {
    if (!activeEditor || isAiLoading) return;
    const content = activeEditor.getText().trim();
    if (content.length < 5) return; // Não converter se estiver vazio

    setIsAiLoading(true);
    try {
      const context = getContextText(activeEditor, "tudo");
      const persona = selectedPersona.name;
      const trainingData = selectedPersona.knowledge || "";

      const result = await generateContent(newMode, persona, context, trainingData, "convert");
      
      if (result.text) {
        console.log("Conversão concluída com sucesso.");
        activeEditor.commands.setContent(result.text);
      } else if (result.error) {
        alert(`Erro na conversão: ${result.error}`);
      }
    } catch (e) {
      console.error("Erro na conversão:", e);
      alert("Erro ao tentar converter o formato do texto.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAnalyze = async (task: "entidades" | "coerencia" | "continuidade" | "ortografia") => {
    if (!activeEditor || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisResult("Analisando...");

    try {
      const context = getContextText(activeEditor, contextMode);
      const persona = selectedPersona.name;
      const trainingData = selectedPersona.knowledge || "";

      let prompt = "";
      if (task === "entidades") prompt = "Identifique todos os personagens, cenários e itens importantes citados no texto.";
      if (task === "coerencia") prompt = "Analise a coerência narrativa deste trecho. Há contradições ou diálogos que soam artificiais?";
      if (task === "continuidade") prompt = "Verifique a continuidade. Algum elemento físico ou temporal mudou sem explicação?";
      if (task === "ortografia") prompt = "Realize uma revisão gramatical e estilística fina focada em prosa literária.";

      const result = await generateContent(prompt, persona, context, trainingData, "analyze");
      if (result.text) {
        setAnalysisResult(result.text);
      } else if (result.error) {
        setAnalysisResult(`Erro: ${result.error}`);
      }
    } catch (e) {
      setAnalysisResult("Erro ao conectar com o laboratório.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sizeInfo = PAGE_SIZES[pageSettings.size];
  const pageW = pageSettings.size === "Personalizado" ? customW : sizeInfo.width;
  const pageH = pageSettings.size === "Personalizado" ? customH : sizeInfo.height;
  const displayW = pageSettings.orientacao === "retrato" ? pageW : pageH;
  const displayH = pageSettings.orientacao === "retrato" ? pageH : pageW;

  // ─── Tela de Boas-Vindas ───────────────────────────────────────────
  if (showWelcome) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: "url('/bkg2.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-ink/65" />

        {/* Painel central */}
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md">

          {/* Box 1: Logo */}
          <div className="w-full bg-paper-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
            <Image
              src="/logocw.jpeg"
              alt="Co-Writer"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto block"
              priority
            />
          </div>

          {/* Box 2: Opções */}
          <div className="w-full bg-paper-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
            {/* Views de opção */}
            {welcomeView === "main" && (
              <div className="p-7 flex flex-col gap-3">
                <h1 className="font-heading text-xl font-bold text-ink text-center mb-3">
                  Bem-vindo de volta, Escritor.
                </h1>

                <button
                  onClick={() => setWelcomeView("documentosRecentes")}
                  className="flex items-center gap-3 w-full px-5 py-4 rounded-xl bg-ink text-paper hover:bg-ink-700 transition-colors text-left"
                >
                  <FolderOpen size={20} className="shrink-0 text-bronze-light" />
                  <div>
                    <div className="font-sans font-semibold text-sm">Abrir meus documentos</div>
                    <div className="font-sans text-xs text-ink-200 mt-0.5">Ver documentos recentes</div>
                  </div>
                </button>

                <button className="flex items-center gap-3 w-full px-5 py-4 rounded-xl bg-paper-mid hover:bg-paper-dark text-ink transition-colors text-left border border-paper-dark">
                  <Upload size={20} className="shrink-0 text-forest" />
                  <div>
                    <div className="font-sans font-semibold text-sm">Abrir do computador</div>
                    <div className="font-sans text-xs text-ink-500 mt-0.5">Importar DOCX, PDF ou Markdown</div>
                  </div>
                </button>

                <button
                  onClick={() => setWelcomeView("novoDocumento")}
                  className="flex items-center gap-3 w-full px-5 py-4 rounded-xl bg-bronze hover:bg-bronze-dark text-paper transition-colors text-left"
                >
                  <FilePlus size={20} className="shrink-0" />
                  <div>
                    <div className="font-sans font-semibold text-sm">Novo documento</div>
                    <div className="font-sans text-xs text-bronze-100 mt-0.5">Começar do zero ou com um co-writer</div>
                  </div>
                </button>
              </div>
            )}

            {/* View: Novo Documento */}
            {welcomeView === "novoDocumento" && (
              <div className="p-7 flex flex-col gap-3">
                <button
                  onClick={() => setWelcomeView("main")}
                  className="flex items-center gap-1.5 text-ink-500 hover:text-ink text-sm font-sans mb-1 self-start transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
                <h2 className="font-heading text-lg font-bold text-ink mb-1">Como deseja começar?</h2>

                <button
                  onClick={() => { setShowWelcome(false); setDocTitle("Sem título"); }}
                  className="flex items-center gap-3 w-full px-5 py-4 rounded-xl bg-ink text-paper hover:bg-ink-700 transition-colors text-left"
                >
                  <PenTool size={20} className="shrink-0 text-bronze-light" />
                  <div>
                    <div className="font-sans font-semibold text-sm">Começar do zero</div>
                    <div className="font-sans text-xs text-ink-200 mt-0.5">Documento em branco</div>
                  </div>
                </button>

                <button
                  onClick={() => { setShowWelcome(false); setDocTitle("Sem título"); }}
                  className="flex items-center gap-3 w-full px-5 py-4 rounded-xl bg-violet hover:bg-violet-dark text-paper transition-colors text-left"
                >
                  <Sparkles size={20} className="shrink-0" />
                  <div>
                    <div className="font-sans font-semibold text-sm">Começar com um co-writer</div>
                    <div className="font-sans text-xs text-violet-100 mt-0.5">Selecione uma persona de escritor</div>
                  </div>
                </button>
              </div>
            )}

            {/* View: Documentos Recentes */}
            {welcomeView === "documentosRecentes" && (
              <div className="p-7 flex flex-col gap-3">
                <button
                  onClick={() => setWelcomeView("main")}
                  className="flex items-center gap-1.5 text-ink-500 hover:text-ink text-sm font-sans mb-1 self-start transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
                <h2 className="font-heading text-lg font-bold text-ink mb-1">Documentos recentes</h2>

                {[
                  { title: "A Torre Negra — Capítulo 1", type: "fiction",    date: "Hoje, 14h32" },
                  { title: "Pulp Fiction — Cena 4",       type: "screenplay", date: "Ontem, 09h15" },
                  { title: "Rascunho sem título",          type: "fiction",    date: "28/04/2026" },
                ].map((doc) => (
                  <button
                    key={doc.title}
                    onClick={() => { setShowWelcome(false); setDocTitle(doc.title); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-paper-mid text-ink transition-colors text-left border border-paper-dark"
                  >
                    {doc.type === "screenplay"
                      ? <Clapperboard size={18} className="shrink-0 text-forest" />
                      : <FileText    size={18} className="shrink-0 text-bronze" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-sans font-medium text-sm truncate">{doc.title}</div>
                      <div className="font-sans text-xs text-ink-500 mt-0.5">{doc.date}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Área de Trabalho ──────────────────────────────────────────────
  return (
    <div className="w-full h-screen flex flex-col bg-paper">

      {/* ── Barra 1: Logo + Título + Avatar ────────────────────────── */}
      <header className="h-14 bg-ink shrink-0 flex items-center px-5 border-b border-ink-900 relative">
        <div className="flex items-center">
            <Image
              src="/logocwhorizontwhitenbg.png"
              alt="Co-Writer"
              width={130}
              height={28}
              className="object-contain w-auto h-7"
            />
        </div>

        {/* Título centralizado */}
        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
          <span className="font-sans text-sm font-medium text-ink-200 max-w-xs truncate px-2">
            {docTitle}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-bronze flex items-center justify-center font-heading font-bold text-white text-sm shrink-0">
            E
          </div>
        </div>
      </header>

      {/* ── Barra 2: Menus ─────────────────────────────────────────── */}
      <div className="h-9 bg-ink-700 shrink-0 flex items-center px-3 gap-1 border-b border-ink-900 relative">
        {/* Menu: Arquivo */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === "arquivo" ? null : "arquivo")}
            className={`flex items-center gap-0.5 px-3 py-1 rounded font-sans text-sm transition-colors ${
              activeMenu === "arquivo" ? "text-white bg-ink-mid" : "text-ink-200 hover:text-white hover:bg-ink-mid"
            }`}
          >
            Arquivo
            <ChevronDown size={12} className="opacity-60 mt-0.5" />
          </button>

          {activeMenu === "arquivo" && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-paper-dark shadow-2xl rounded-lg py-2 z-50">
              <button
                onClick={() => { setShowWelcome(true); setWelcomeView("main"); setActiveMenu(null); }}
                className="w-full text-left px-4 py-2 hover:bg-paper-mid flex items-center gap-2 text-sm text-ink"
              >
                <FilePlus size={16} className="text-bronze" /> Novo Documento
              </button>
              <div className="h-px bg-paper-light my-2" />
              <div className="px-4 pb-1 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Projetos Recentes</div>
              {[
                { title: "A Torre Negra — Capítulo 1", type: "fiction" },
                { title: "Pulp Fiction — Cena 4", type: "screenplay" },
                { title: "HQ: O Despertar — Pag 1", type: "hq" },
              ].map((doc) => (
                <button
                  key={doc.title}
                  onClick={() => { setDocTitle(doc.title); setActiveMenu(null); }}
                  className="w-full text-left px-4 py-2 hover:bg-paper-mid text-xs text-ink-700 flex items-center gap-2"
                >
                  {doc.type === "screenplay" ? <Clapperboard size={12} className="text-forest" /> : 
                   doc.type === "hq" ? <LayoutGrid size={12} className="text-blue-600" /> :
                   <FileText size={12} className="text-bronze" />}
                  <span className="truncate">{doc.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {["Editar", "Formatar", "Visualizar", "Ajuda"].map((item) => (
          <button
            key={item}
            className="flex items-center gap-0.5 px-3 py-1 rounded font-sans text-sm text-ink-200 hover:text-white hover:bg-ink-mid transition-colors"
          >
            {item}
            <ChevronDown size={12} className="opacity-60 mt-0.5" />
          </button>
        ))}
      </div>

      {/* ── Workspace ──────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar: Desenvolvimento */}
        <aside className="w-[260px] bg-paper-mid border-r border-paper-dark flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-paper-dark flex items-center justify-between">
            <div className="text-[10px] font-bold text-ink-500 uppercase tracking-widest flex items-center gap-2">
              <List size={12} /> Desenvolvimento
            </div>
            <button className="p-1 hover:bg-paper-dark rounded transition-colors text-ink-400">
              <Settings size={12} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Índice Dinâmico */}
            <div>
              <div className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                <span>Índice</span>
                <span className="text-[9px] lowercase font-normal opacity-50">{toc.length} itens</span>
              </div>
              <div className="space-y-0.5">
                {toc.length === 0 ? (
                  <div className="text-[10px] text-ink-400 italic px-2">Nenhum capítulo ou título detectado...</div>
                ) : (
                  toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (activeEditor) {
                          activeEditor.commands.focus(item.pos + 1);
                          // Scroll suave é lidado pelo browser na maioria dos casos com focus
                        }
                      }}
                      className={`w-full text-left text-xs transition-all py-1.5 px-2 rounded flex items-center gap-2 group ${
                        item.level === 1 
                          ? "text-ink font-bold hover:bg-paper-dark" 
                          : item.level === 2 
                            ? "text-ink-800 font-medium hover:bg-paper-dark pl-4" 
                            : "text-ink-600 pl-6 hover:bg-paper-dark"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform group-hover:scale-125 ${
                        item.level === 1 ? "bg-bronze" : item.level === 2 ? "bg-bronze/40" : "bg-paper-darker"
                      }`} />
                      <span className="truncate">{item.text}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Marcações / Notas */}
            <div>
              <div className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-3">Marcações</div>
              <div className="space-y-2">
                <div className="p-2 bg-white/50 border border-paper-dark rounded text-[10px] text-ink-600">
                  <div className="font-bold text-violet mb-1">Nota da Persona</div>
                  "Lembrar de focar na cor do céu aqui."
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-1 flex flex-col bg-paper-mid relative overflow-hidden">

          {/* Toolbar conectada ao editor */}
          <EditorToolbar
            editor={activeEditor}
            writingMode={writingMode}
            pageLabel={`${pageSettings.size} · ${pageSettings.orientacao === "retrato" ? "Retrato" : "Paisagem"}`}
            onOpenPageSettings={() => setShowPageSettings(true)}
          />

          {/* Canvas Tiptap */}
          <div className="flex-1 overflow-y-auto py-8 flex justify-center" style={{ backgroundColor: "#d1cdc5" }}>
            <RichEditor
              pageWidthPx={mmToPx(displayW)}
              pageHeightPx={mmToPx(displayH)}
              paddingTop={mmToPx(pageSettings.margemSuperior)}
              paddingBottom={mmToPx(pageSettings.margemInferior)}
              paddingLeft={mmToPx(pageSettings.margemEsquerda)}
              paddingRight={mmToPx(pageSettings.margemDireita)}
              initialTitle={docTitle}
              writingMode={writingMode}
              onTitleChange={setDocTitle}
              onEditorReady={handleEditorReady}
            />
          </div>
        </main>

        {/* Painel de Persona e Modos */}
        <aside className="w-[300px] bg-paper border-l border-paper-dark flex flex-col shrink-0 hidden md:flex">
          <div className="flex-1 p-4 overflow-y-auto space-y-6">
            {/* Seletor de Modo de Escrita */}
            <div>
              <div className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={12} /> Formatação da Obra
              </div>
              <select
                value={writingMode}
                onChange={(e) => {
                  const newMode = e.target.value as WritingMode;
                  setWritingMode(newMode);
                  handleConvert(newMode);
                }}
                className="w-full bg-white border border-paper-dark rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-bronze shadow-sm"
              >
                <option value="Livro">Livro (Prosa)</option>
                <option value="Roteiro Cinema">Roteiro de Cinema</option>
                <option value="Poesia">Poesia</option>
                <option value="Roteiro HQ">Roteiro de HQ</option>
              </select>
            </div>

            {/* Persona Ativa */}
            <div className="bg-white rounded-xl border border-paper-dark p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-violet" />
              
              <div className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-3">Persona Ativa</div>
              
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold italic text-white text-lg">{selectedPersona.avatarLetter}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <select 
                    value={selectedPersona.id}
                    onChange={(e) => {
                      if (e.target.value === "new") {
                        setShowNewPersonaModal(true);
                      } else {
                        const p = personas.find(p => p.id === e.target.value);
                        if (p) setSelectedPersona(p);
                      }
                    }}
                    className="w-full font-heading font-bold text-ink text-base bg-transparent border-none p-0 outline-none cursor-pointer"
                  >
                    {personas.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                    <option value="new" className="text-violet font-semibold">+ Criar Nova Persona</option>
                  </select>
                  <div className="font-sans text-xs text-ink-light truncate">
                    {selectedPersona.role} • {selectedPersona.tags.join(", ")}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-paper-light">
                {/* O que deve ser lido */}
                <div>
                  <div className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-2">Base de Contexto</div>
                  <div className="flex bg-paper-mid p-1 rounded-lg border border-paper-dark">
                    {(["selecao", "capitulo", "tudo"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setContextMode(mode)}
                        className={`flex-1 text-[10px] py-1.5 rounded-md font-bold uppercase transition-all ${
                          contextMode === mode ? "bg-white text-violet shadow-sm" : "text-ink-500 hover:text-ink"
                        }`}
                      >
                        {mode === "selecao" ? "Seleção" : mode === "capitulo" ? "Capítulo" : "Tudo"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quanto escrever */}
                <div>
                  <div className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-2">Extensão da IA</div>
                  <div className="flex bg-paper-mid p-1 rounded-lg border border-paper-dark">
                    {(["paragrafo", "capitulo"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setLengthMode(mode)}
                        className={`flex-1 text-[10px] py-1.5 rounded-md font-bold uppercase transition-all ${
                          lengthMode === mode ? "bg-white text-violet shadow-sm" : "text-ink-500 hover:text-ink"
                        }`}
                      >
                        {mode === "paragrafo" ? "Parágrafo" : "Completar"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCoWrite("escrever")}
                    disabled={isAiLoading}
                    className="flex-1 bg-violet hover:bg-violet-dark text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    Co-escrever
                  </button>
                  <button 
                    onClick={() => handleCoWrite("melhorar")}
                    disabled={isAiLoading}
                    className="flex-1 bg-white border border-violet text-violet hover:bg-violet-50 text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles size={14} />
                    Melhorar
                  </button>
                </div>
              </div>
            </div>

            {/* Laboratório de Análise */}
            <div className="mt-4 border-t border-paper-dark pt-6">
              <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Wand2 size={14} className="text-violet" /> Laboratório de Análise
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                  onClick={() => handleAnalyze("entidades")}
                  disabled={isAnalyzing}
                  className="px-2 py-3 text-[10px] font-bold bg-white border border-paper-dark rounded-xl hover:bg-paper-mid transition-all text-ink-700 flex flex-col items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <span className="text-blue-600">Entidades</span>
                  Personagens
                </button>
                <button 
                  onClick={() => handleAnalyze("coerencia")}
                  disabled={isAnalyzing}
                  className="px-2 py-3 text-[10px] font-bold bg-white border border-paper-dark rounded-xl hover:bg-paper-mid transition-all text-ink-700 flex flex-col items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <span className="text-forest">Lógica</span>
                  Coerência
                </button>
                <button 
                  onClick={() => handleAnalyze("continuidade")}
                  disabled={isAnalyzing}
                  className="px-2 py-3 text-[10px] font-bold bg-white border border-paper-dark rounded-xl hover:bg-paper-mid transition-all text-ink-700 flex flex-col items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <span className="text-bronze">Roteiro</span>
                  Continuidade
                </button>
                <button 
                  onClick={() => handleAnalyze("ortografia")}
                  disabled={isAnalyzing}
                  className="px-2 py-3 text-[10px] font-bold bg-white border border-paper-dark rounded-xl hover:bg-paper-mid transition-all text-ink-700 flex flex-col items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <span className="text-violet">Revisão</span>
                  Estilística
                </button>
              </div>

              {analysisResult && (
                <div className="bg-black text-green-400 p-4 rounded-xl text-xs font-mono leading-relaxed max-h-80 overflow-y-auto border border-green-900/30 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-3 border-b border-green-900/30 pb-2">
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                      {isAnalyzing ? <Loader2 size={10} className="animate-spin text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                      Laboratório: {selectedPersona.name}
                    </span>
                    <button onClick={() => setAnalysisResult(null)} className="text-green-700 hover:text-green-400 transition-colors p-1 text-lg">✕</button>
                  </div>
                  <div className="whitespace-pre-wrap font-mono antialiased drop-shadow-sm">{analysisResult}</div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modal: Configurações de Página ─────────────────────────── */}
      {showPageSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(26,35,50,0.7)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-paper-dark">
              <h2 className="font-heading font-bold text-ink text-lg">Configurações de Página</h2>
              <button
                onClick={() => setShowPageSettings(false)}
                className="p-1.5 rounded hover:bg-paper-mid text-ink-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-2 gap-5">

              {/* Tamanho */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Tamanho do papel</label>
                <select
                  value={pageSettings.size}
                  onChange={(e) => setPageSettings(s => ({ ...s, size: e.target.value as PageSize }))}
                  className="w-full border border-paper-dark rounded-lg px-3 py-2.5 font-sans text-sm text-ink bg-white outline-none focus:border-bronze"
                >
                  {Object.entries(PAGE_SIZES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              {/* Dimensões personalizadas */}
              {pageSettings.size === "Personalizado" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Largura (mm)</label>
                    <input
                      type="number" min={50} max={1000}
                      value={customW}
                      onChange={(e) => setCustomW(Number(e.target.value))}
                      className="w-full border border-paper-dark rounded-lg px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-bronze"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Altura (mm)</label>
                    <input
                      type="number" min={50} max={1000}
                      value={customH}
                      onChange={(e) => setCustomH(Number(e.target.value))}
                      className="w-full border border-paper-dark rounded-lg px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-bronze"
                    />
                  </div>
                </>
              )}

              {/* Orientação */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Orientação</label>
                <div className="flex gap-3">
                  {(["retrato", "paisagem"] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => setPageSettings(s => ({ ...s, orientacao: o }))}
                      className={`flex-1 py-3 rounded-xl border-2 font-sans text-sm font-medium transition-colors flex flex-col items-center gap-2 ${
                        pageSettings.orientacao === o
                          ? "border-bronze bg-bronze/10 text-bronze-dark"
                          : "border-paper-dark text-ink-500 hover:border-ink-200"
                      }`}
                    >
                      <div
                        className={`border-2 border-current rounded-sm ${
                          o === "retrato" ? "w-8 h-11" : "w-11 h-8"
                        } ${pageSettings.orientacao === o ? "border-bronze" : "border-ink-200"}`}
                      />
                      {o === "retrato" ? "Retrato" : "Paisagem"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margens */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">Margens (mm)</label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["margemSuperior",  "Superior"],
                      ["margemInferior",  "Inferior"],
                      ["margemEsquerda",  "Esquerda"],
                      ["margemDireita",   "Direita"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs text-ink-500 mb-1">{label}</label>
                      <input
                        type="number" min={0} max={100}
                        value={pageSettings[key]}
                        onChange={(e) => setPageSettings(s => ({ ...s, [key]: Number(e.target.value) }))}
                        className="w-full border border-paper-dark rounded-lg px-3 py-2 font-sans text-sm text-ink outline-none focus:border-bronze"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview resumo */}
              <div className="col-span-2 bg-paper-mid rounded-xl p-4 flex items-center gap-4">
                <div
                  className="bg-white border border-paper-dark rounded shadow-sm shrink-0"
                  style={{
                    width:  pageSettings.orientacao === "retrato" ? "36px" : "50px",
                    height: pageSettings.orientacao === "retrato" ? "50px" : "36px",
                  }}
                />
                <div className="font-sans text-xs text-ink-700">
                  <div className="font-semibold text-ink mb-1">
                    {pageSettings.size === "Personalizado"
                      ? `${customW} × ${customH} mm`
                      : PAGE_SIZES[pageSettings.size].label}
                    {" · "}
                    {pageSettings.orientacao === "retrato" ? "Retrato" : "Paisagem"}
                  </div>
                  <div>
                    Margens: {pageSettings.margemSuperior}/{pageSettings.margemDireita}/{pageSettings.margemInferior}/{pageSettings.margemEsquerda} mm
                    (sup / dir / inf / esq)
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-paper-dark bg-paper-mid">
              <button
                onClick={() => { setPageSettings(DEFAULT_SETTINGS); }}
                className="px-4 py-2 rounded-lg font-sans text-sm text-ink-500 hover:bg-paper-dark transition-colors"
              >
                Restaurar padrão
              </button>
              <button
                onClick={() => setShowPageSettings(false)}
                className="px-5 py-2 rounded-lg bg-bronze hover:bg-bronze-dark text-white font-sans font-semibold text-sm transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal: Nova Persona ───────────────────────────────────── */}
      {showNewPersonaModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(26,35,50,0.85)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-paper-dark flex justify-between items-center bg-violet-50">
              <h2 className="font-heading font-bold text-violet-dark text-lg flex items-center gap-2">
                <PenTool size={20} /> Criar Nova Persona
              </h2>
              <button onClick={() => setShowNewPersonaModal(false)} className="text-ink-300 hover:text-ink"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Upload area */}
              <div className="border-2 border-dashed border-paper-dark rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-violet hover:bg-violet-50 transition-all cursor-pointer group">
                <Upload size={32} className="text-ink-200 group-hover:text-violet mb-3" />
                <div className="text-sm font-bold text-ink mb-1">Subir Documento de Referência</div>
                <div className="text-xs text-ink-500">O Co-Writer analisará o estilo e o vocabulário do autor.</div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-widest">Nome do Autor / Persona</label>
                <input 
                  type="text" 
                  placeholder="Ex: Machado de Assis"
                  className="w-full border border-paper-dark rounded-lg px-4 py-3 text-sm focus:border-violet outline-none transition-all"
                />
                
                <div className="bg-paper-mid p-3 rounded-lg">
                  <div className="text-[10px] font-bold text-ink-400 uppercase mb-2">Agregar à Bagagem Existente?</div>
                  <div className="flex flex-wrap gap-2">
                    {personas.map(p => (
                      <button key={p.id} className="px-2 py-1 bg-white border border-paper-dark rounded text-[10px] font-medium text-ink-600 hover:border-violet hover:text-violet transition-all">
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <div className="flex-1 flex items-center gap-2 p-3 border border-paper-dark rounded-lg cursor-pointer hover:border-violet hover:bg-violet-50 transition-all">
                    <PenTool size={16} className="text-violet" />
                    <div className="text-xs font-bold">Escritor</div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 p-3 border border-paper-dark rounded-lg cursor-pointer hover:border-forest hover:bg-forest-50 transition-all">
                    <Clapperboard size={16} className="text-forest" />
                    <div className="text-xs font-bold">Roteirista</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowNewPersonaModal(false)}
                className="w-full bg-violet text-white font-bold py-3 rounded-xl shadow-lg hover:bg-violet-dark transition-all transform active:scale-[0.98]"
              >
                Criar e Começar a Escrever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

