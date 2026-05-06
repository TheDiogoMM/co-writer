# Co-Writer - Editor de Escrita Criativa com IA

## Visão Geral do Projeto

O **Co-Writer** é um editor de textos profissional para escritores, com foco em:
- Escrita de livros (prosas)
- Roteiros de cinema
- Assistência de IA para co-escrever, melhorar texto, análise

---

## Funcionalidades Implementadas

### 1. Editor de Texto Rico (Tiptap)
- Negrito, itálico, sublinhado
- Títulos (H1, H2, H3)
- Citação, código
- Lists numeradas e com marcadores
-Quebra de cena (***)
- Undo/Redo

### 2. Sistema de IA com Fallback
- **Gemini** (Google) - provider principal
- **Groq** - fallback quando Gemini falha
- Suporte a múltiplos modelos
- Context-aware (envia texto selecionado ou todo o documento)

### 3. Personas e RAG
- Criar personas personalizadas
- Fazer upload de documentos de referência (.txt, .md, .pdf)
- A IA usa o estilo do documento como base

### 4. Modos de Escrita
- **Livro (Prosa)**: Recuo de parágrafo, justificação, font serif
- **Roteiro Cinema**: Courier New 12pt, formatação Master Scenes

### 5. Interface
- Barra de ferramentas superior (completa)
- Barra lateral esquerda (Índice/TOC)
- Barra lateral direita (Laboratório de IA)
- Resizable (arrastar bordas)
- Tema de "laboratório criativo" (cores amareladas, papel)

### 6. Laboratório de Análise
- **Entidades**: Identificar personagens, locais
- **Gramática**: Verificar erros
- **Co-escrever**: IA escreve continuação
- **Melhorar**: IA melhora texto selecionado

---

## Problemas e Limitações

### 1. Paginação (CRÍTICO)
**Problema**: O editor Tiptap é um fluxo único - não quebra naturalmente em páginas A4.

**O queTentamos**:
- Páginas visuais de fundo (background)
- Scroll manual
- Múltiplos containers
- Cálculo automático de páginas baseadas em caracteres

**Limitação Atual**:
- O texto não para automaticamente antes do rodapé
- Não há quebra de página automática como no Word
- O usuário precisa fazer scroll manual

**SoluçãoProposta**: Seria necessário criar múltiplos editores Tiptap separados (um por página), mas:
- Undo/redo não funcionariam между páginas
- Busca(global) seria complexa
- IA precisa consolidar texto (já funciona com getText())

### 2. Marcação Visual de Entidades (REMOVIDA)
- Extensão EntityHighlighter foi removida devido a conflitos persistentes com o estado do editor
- Возможно retornar no futuro se houver demanda

### 3. Processamento de PDF
- библиотека pdf-parse tem conflitos с SSR
- Funciona parcialmente

### 4. Formatação de Roteiro
- Já segue padrão Master Scenes:
  - Slugline em maiúsculas
  - Personagem centralizado
  - Diálogo centralizado
  - Transição à direita
- Однако nem todos os elementos têm quebra automática

### 5. Erros Históricos (CORRIGIDOS)
- `useEffect is not defined`
- `Cannot read properties of undefined (reading 'state')`
- Erros de sintaxe em operações de renderização
- Conflitos de hydration com Next.js 16

---

## Arquitetura Atual

```
src/
├── app/
│   ├── page.tsx          # Componente principal
│   ├── layout.tsx       # Layout Next.js
│   ├── actions/
│   │   ├── ai.ts        # Lógica de IA
│   │   └── pdf.ts      # Processamento PDF
│   ├── editor.css    # Estilos do editor
│   └── globals.css
├── components/
│   ├── RichEditor.tsx   # Editor com paginação
│   └── EditorToolbar.tsx
└── lib/
    ├── Screenplay.ts    # Extensão roteiro
    └── EntityHighlighter.ts
```

---

## Estado Atual do Projeto

**Funciona**:
- [x] Editor de texto rico
- [x] Negrito, itálico, etc.
- [x] Modo Livro e Roteiro
- [x] IA (Gemini/Groq)
- [x] Personas com RAG
- [x] Páginas A4 visuais
- [x] Numeração no rodapé

**Precisa Melhorar**:
- [ ] Quebra automática de página (como Word)

---

## Como Testar

```bash
npm run dev -- --webpack
```

Acesse http://localhost:3000

---

## Próximos Passos Sugeridos

1. **Aceitar paginação via scroll** - Manter como está (múltiplas páginas visuais + scroll)
2. **Implementar quebra forçada** - Botão para inserir quebra manual de página
3. **Ou criar múltiplos editores** - Um por página (requer trabalho significativo)

---

*Documento gerado em: 2026-05-02*