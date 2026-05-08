import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    screenplay: {
      setScreenplayType: (type: 'scene' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition') => ReturnType,
      setScreenplayDisabled: (disabled: boolean) => ReturnType,
    }
  }
}

export const Screenplay = Extension.create({
  name: 'screenplay',

  addStorage() {
    return {
      disabled: false,
    }
  },

  addCommands() {
    return {
      setScreenplayDisabled: (disabled) => () => {
        this.storage.disabled = disabled
        return true
      },
      setScreenplayType: (type) => ({ chain }) => {
        if (this.storage.disabled) return false
        switch (type) {
          case 'scene':
            return chain()
              .setNode('heading', { level: 4 })
              .updateAttributes('heading', { class: 'screenplay-scene', 'data-type': 'scene' })
              .run()
          case 'action':
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: 'screenplay-action', 'data-type': 'action' })
              .run()
          case 'character':
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: 'screenplay-character', 'data-type': 'character' })
              .run()
          case 'dialogue':
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: 'screenplay-dialogue', 'data-type': 'dialogue' })
              .run()
          case 'parenthetical':
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: 'screenplay-parenthetical', 'data-type': 'parenthetical' })
              .run()
          case 'transition':
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: 'screenplay-transition', 'data-type': 'transition' })
              .run()
          default:
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: null, 'data-type': null })
              .run()
        }
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      // Alt+Number shortcuts to set element type directly
      'Alt-1': () => this.editor.commands.setScreenplayType('scene'),
      'Alt-2': () => this.editor.commands.setScreenplayType('action'),
      'Alt-3': () => this.editor.commands.setScreenplayType('character'),
      'Alt-4': () => this.editor.commands.setScreenplayType('dialogue'),
      'Alt-5': () => this.editor.commands.setScreenplayType('parenthetical'),
      'Alt-6': () => this.editor.commands.setScreenplayType('transition'),

      // ── ENTER — Smart navigation between screenplay elements ──
      // After Scene Heading → Action
      // After Character → Dialogue
      // After Parenthetical → Dialogue
      // After Dialogue → Action
      // After empty Action → Character (convenient for flow)
      Enter: () => {
        if (this.storage.disabled) return false
        const { selection } = this.editor.state
        const { $from } = selection
        const node = $from.parent
        const type = node.attrs['data-type']

        // Not a screenplay element? Let default Enter handle it.
        if (!type) return false

        if (type === 'scene') {
          // After scene heading → new action line
          this.editor.chain().focus()
            .splitBlock()
            .setParagraph()
            .updateAttributes('paragraph', { class: 'screenplay-action', 'data-type': 'action' })
            .run()
          return true
        }

        if (type === 'character') {
          // After character name → dialogue
          this.editor.chain().focus()
            .splitBlock()
            .setParagraph()
            .updateAttributes('paragraph', { class: 'screenplay-dialogue', 'data-type': 'dialogue' })
            .run()
          return true
        }

        if (type === 'parenthetical') {
          // After parenthetical → dialogue
          this.editor.chain().focus()
            .splitBlock()
            .setParagraph()
            .updateAttributes('paragraph', { class: 'screenplay-dialogue', 'data-type': 'dialogue' })
            .run()
          return true
        }

        if (type === 'dialogue') {
          // After dialogue → action
          this.editor.chain().focus()
            .splitBlock()
            .setParagraph()
            .updateAttributes('paragraph', { class: 'screenplay-action', 'data-type': 'action' })
            .run()
          return true
        }

        if (type === 'action') {
          // Empty action line → switch to character (natural writing flow)
          if (node.textContent.trim() === '') {
            this.editor.commands.setScreenplayType('character')
            return true
          }
          // Non-empty action → new action
          this.editor.chain().focus()
            .splitBlock()
            .setParagraph()
            .updateAttributes('paragraph', { class: 'screenplay-action', 'data-type': 'action' })
            .run()
          return true
        }

        if (type === 'transition') {
          // After transition → scene heading
          this.editor.chain().focus()
            .splitBlock()
            .setNode('heading', { level: 4 })
            .updateAttributes('heading', { class: 'screenplay-scene', 'data-type': 'scene' })
            .run()
          return true
        }

        return false
      },

      // ── TAB — Cycle between element types ──
      Tab: () => {
        if (this.storage.disabled) return false
        const { selection } = this.editor.state
        const { $from } = selection
        const node = $from.parent
        const type = node.attrs['data-type']

        if (!type || type === 'action' || type === 'scene') {
          return this.editor.commands.setScreenplayType('character')
        }
        if (type === 'character') {
          return this.editor.commands.setScreenplayType('parenthetical')
        }
        if (type === 'parenthetical') {
          return this.editor.commands.setScreenplayType('dialogue')
        }
        if (type === 'dialogue') {
          return this.editor.commands.setScreenplayType('transition')
        }
        if (type === 'transition') {
          return this.editor.commands.setScreenplayType('scene')
        }
        return this.editor.commands.setScreenplayType('action')
      },
    }
  },
})
