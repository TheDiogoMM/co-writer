# Co-Writer Design System

## About

**Co-Writer** ("co-writer") is an AI-powered web text editor that functions as a traditional word processor, enhanced by artificial intelligence. Writers upload books and screenplays to create **Personas** — AI models trained on the voice of iconic authors and directors (e.g. Stephen King, Tarantino, Nolan, Spielberg, Scorsese, Tolkien, Neil Gaiman, Lovecraft, C.S. Lewis). These personas power three core features:

- **Co-Writer**: Rewrite selected passages in the style of the chosen persona
- **Co-Writer Help**: Continue a text using the persona's voice
- **Format Templates**: Apply professional formatting (e.g. Hollywood Screenplay) to any text

**Tagline**: *Intelligent Narrative Partner*

---

## Sources

- **Logo/Brand Image**: `uploads/Adorei._Agora_sobre_a_tipografia,_202604291423.jpeg` — provided by user; the main brand reference. Contains logo, typewriter illustration, film reel, AI node network, screenplay text.
- No codebase was attached. No Figma link was provided. Design system derived from logo analysis and product description.

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Authoritative but warm** — speaks to serious writers, not casual users. Treats the user as a creative professional.
- **Literary** — copy uses writing metaphors, craft language ("voice", "persona", "narrative", "scene"). References legendary authors naturally.
- **Understated AI** — AI capabilities are framed as creative partnership, not automation. "Co-Writer" not "AI Writer". The tool assists, the human authors.
- **Cinematic precision** — especially when referencing screenplay features, tone shifts to the precise, directive voice of a production doc.

### Grammar & Style
- **Second person ("you")** — the interface speaks directly to the user. "Your manuscript", "Your persona", "Continue your story".
- **Sentence case** for UI labels and body copy (not Title Case for every noun)
- **Title Case** reserved for proper persona names and format names (e.g. "Hollywood Screenplay", "Stephen King")
- **No emoji** in the core product UI — aesthetic is too literary for emoji
- **Ampersands (&)** avoided in body copy; spelled out "and"
- **Oxford comma** used
- **En dashes (–)** for ranges; em dashes (—) for parenthetical breaks

### Key Copy Patterns
- Feature names are compound nouns, not verbs: **Co-Writer**, **Co-Writer Help**
- Personas are referred to as "voices" or "personas" — never "bots" or "models"
- Actions are literary: "Rewrite in this voice", "Continue the story", "Shape this scene"
- Errors/empty states use soft, writerly language: "The page is blank…", "No voice selected yet."

---

## VISUAL FOUNDATIONS

### Color Palette
See `colors_and_type.css` for full CSS custom property definitions.

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#1a2332` | Primary text, logo navy |
| `--ink-mid` | `#2b3a55` | Secondary text, nav |
| `--ink-light` | `#8a9bb0` | Muted text, placeholders |
| `--paper` | `#f8f6f2` | Primary background (warm white) |
| `--paper-mid` | `#ede9e1` | Cards, sidebar backgrounds |
| `--paper-dark` | `#d8d2c8` | Borders, dividers |
| `--bronze` | `#b8956a` | Primary accent — warm, literary |
| `--bronze-light` | `#d4b896` | Hover states on bronze |
| `--gold` | `#c9a227` | Highlight, selection, AI spark |
| `--violet` | `#7c5cbf` | AI/Persona accent |
| `--violet-light` | `#a98de0` | Hover states on violet |
| `--forest` | `#3d7a5a` | Screenplay/format accent |
| `--forest-light` | `#5aa37a` | Hover states on forest |

### Typography
See `colors_and_type.css` for full definitions. Font stack uses Google Fonts.

- **Display / Logo**: Bebas Neue — condensed bold, all-caps energy matching the logo's "CO-WRITER" wordmark
- **Headings (UI)**: Playfair Display — classical serif with ink-press contrast; literary authority
- **Body / Reading**: Lora — warm humanist serif, highly legible in long-form reading contexts
- **UI Labels / Controls**: DM Sans — clean, modern, unobtrusive; handles tight spaces well
- **Screenplay / Mono**: Courier Prime — the typewriter voice; used for any screenplay-format output

### Backgrounds
- **Primary background**: warm off-white (`--paper` `#f8f6f2`) — evokes aged paper, not cold white screens
- **Editor canvas**: pure white `#ffffff` with subtle shadow — the document feels like a real page
- **Sidebars / panels**: `--paper-mid` `#ede9e1` — clearly distinct from canvas
- **No full-bleed photography** in core UI; illustrations and icons preferred
- **Subtle textures**: a very faint paper grain (CSS noise filter or low-opacity repeating pattern) on backgrounds in marketing contexts

### Spacing & Layout
- Base unit: **4px** — all spacing is multiples of 4
- Editor canvas max-width: **780px** centered (standard manuscript width)
- Sidebar width: **260px** fixed
- Border radius: **4px** for inputs/buttons; **8px** for cards/panels; **0** for the editor canvas itself (it's a page, not a card)

### Borders & Shadows
- **Borders**: `1px solid var(--paper-dark)` — never harsh; always warm gray
- **Cards**: `box-shadow: 0 2px 8px rgba(26,35,50,0.08)` — soft, depth without drama
- **Editor page**: `box-shadow: 0 4px 24px rgba(26,35,50,0.12)` — the "floating page" feel
- **Hover cards**: `box-shadow: 0 4px 16px rgba(26,35,50,0.14)` — slight lift

### Iconography
See ICONOGRAPHY section below.

### Animation
- **Easing**: `cubic-bezier(0.25, 0.1, 0.25, 1)` — standard ease; nothing bouncy
- **Duration**: 150ms for micro-interactions (hover, focus), 250ms for panel transitions
- **No spring/bounce animations** — the aesthetic is measured, literary, not playful
- **Typewriter text animation**: `steps()` timing for any text-reveal effects
- **AI generation streaming**: smooth character-by-character append; cursor blink with `--bronze`

### Hover / Press States
- **Buttons (primary)**: brightness(1.08) on hover; scale(0.97) on press
- **Text links**: color shift from `--ink` to `--bronze`; no underline by default; underline on hover
- **Sidebar items**: background `--paper-dark` on hover; `--bronze` left-border (2px) on active
- **Persona cards**: box-shadow lift + subtle scale(1.02) on hover

### Corner Radii
- `--radius-sm`: 4px — inputs, tags, small chips
- `--radius-md`: 8px — cards, panels, dropdowns
- `--radius-lg`: 12px — modals, persona cards
- `--radius-pill`: 999px — badges, persona "active" indicators

### Color Vibe of Imagery
- **Warm, desaturated** palette — think vintage book covers, aged photographs
- **Duotone** treatments using `--ink` + `--bronze` for author portrait imagery
- No harsh primary colors; everything sits in the ink/bronze/violet/forest quadrant

---

## ICONOGRAPHY

- **No dedicated icon font** (no codebase provided to confirm)
- **Recommended icon set**: [Lucide Icons](https://lucide.dev) — clean 2px stroke, neutral geometry, widely available via CDN. Matches the refined, understated aesthetic.
- **CDN**: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`
- **Icon size**: 16px in UI controls, 20px in sidebar, 24px in headers/empty states
- **Stroke color**: inherits from text color (`--ink`, `--ink-light`, `--bronze` for accents)
- **No filled icons** — the brand uses outline/stroke treatment exclusively
- **Emoji**: never used in product UI; potentially used in marketing social copy only
- **Logo mark**: typewriter + book + film reel + AI node illustration (see `assets/logo.jpg`)
- **Wordmark**: "CO-WRITER" in Bebas Neue Bold with tracking; "INTELLIGENT NARRATIVE PARTNER" in DM Sans light condensed

---

## File Index

```
README.md                    ← This file
SKILL.md                     ← Agent skill definition
colors_and_type.css          ← Full CSS custom property system (colors + type)

assets/
  logo.jpg                   ← Full brand logo (typewriter illustration + wordmark)

preview/
  colors-primary.html        ← Primary ink + paper palette
  colors-accent.html         ← Bronze, gold, violet, forest accents
  colors-semantic.html       ← Semantic color usage guide
  type-display.html          ← Display + heading type specimens
  type-body.html             ← Body + UI + mono type specimens
  type-scale.html            ← Full type scale tokens
  spacing-tokens.html        ← Spacing + radius + shadow tokens
  components-buttons.html    ← Button variants
  components-inputs.html     ← Form input variants
  components-cards.html      ← Card + panel variants
  components-persona.html    ← Persona card component
  brand-logo.html            ← Logo + wordmark display

ui_kits/
  cowriter-app/
    README.md                ← UI kit notes
    index.html               ← Full interactive app prototype
    AppShell.jsx             ← Main layout shell
    Sidebar.jsx              ← Left navigation sidebar
    Editor.jsx               ← Document editor area
    PersonaPanel.jsx         ← Right AI persona panel
    Toolbar.jsx              ← Editor toolbar
```
