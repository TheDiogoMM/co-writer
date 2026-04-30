# Co-Writer App — UI Kit

## Overview
Interactive prototype of the co-writer web text editor. Covers the core app surfaces:

- **App Shell** — main layout (sidebar + editor + persona panel)
- **Sidebar** — document list, navigation, new document
- **Editor** — manuscript editing canvas with toolbar, selection-based AI actions
- **Persona Panel** — AI persona selection and Co-Writer controls
- **Modals** — persona creation, format picker

## Files
- `index.html` — full interactive prototype entry point
- `AppShell.jsx` — root layout component
- `Sidebar.jsx` — left navigation
- `Editor.jsx` — editor canvas + toolbar
- `PersonaPanel.jsx` — right AI panel
- `Toolbar.jsx` — formatting toolbar

## Design Width
1280px — standard laptop viewport

## Notes
- No real AI — all AI actions are simulated with setTimeout + sample text
- Screenplay format toggle applies Courier Prime monospace layout
- Persona cards are clickable/selectable
- Co-Writer rewrite simulates a streaming text replacement
