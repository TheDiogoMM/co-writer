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
    return { disabled: false }
  },

  // Register class and data-type on paragraph/heading so they survive setContent()
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          class: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('class') || null,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.class) return {}
              return { class: attributes.class }
            },
          },
          'data-type': {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('data-type') || null,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes['data-type']) return {}
              return { 'data-type': attributes['data-type'] }
            },
          },
        },
      },
    ]
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
      'Alt-1': () => this.editor.commands.setScreenplayType('scene'),
      'Alt-2': () => this.editor.commands.setScreenplayType('action'),
      'Alt-3': () => this.editor.commands.setScreenplayType('character'),
      'Alt-4': () => this.editor.commands.setScreenplayType('dialogue'),
      'Alt-5': () => this.editor.commands.setScreenplayType('parenthetical'),
      'Alt-6': () => this.editor.commands.setScreenplayType('transition'),

      Enter: () => {
        if (this.storage.disabled) return false
        const { $from } = this.editor.state.selection
        const node = $from.parent
        const type = node.attrs['data-type']
        if (!type) return false

        const nextType: Record<string, string> = {
          scene: 'action', character: 'dialogue', parenthetical: 'dialogue',
          dialogue: 'action', transition: 'scene',
        }

        if (type === 'action' && node.textContent.trim() === '') {
          this.editor.commands.setScreenplayType('character')
          return true
        }

        const next = nextType[type]
        if (next) {
          this.editor.chain().focus().splitBlock().run()
          this.editor.commands.setScreenplayType(next as any)
          return true
        }
        return false
      },

      Tab: () => {
        if (this.storage.disabled) return false
        const type = this.editor.state.selection.$from.parent.attrs['data-type']
        const cycle: Record<string, string> = {
          action: 'character', scene: 'character', character: 'parenthetical',
          parenthetical: 'dialogue', dialogue: 'transition', transition: 'scene',
        }
        const next = cycle[type || 'action'] || 'character'
        return this.editor.commands.setScreenplayType(next as any)
      },
    }
  },
})
