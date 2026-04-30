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
          case 'character':
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: 'screenplay-character', 'data-type': 'character' })
              .setTextAlign('center')
              .run()
          case 'dialogue':
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: 'screenplay-dialogue', 'data-type': 'dialogue' })
              .setTextAlign('center')
              .run()
          case 'parenthetical':
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: 'screenplay-parenthetical', 'data-type': 'parenthetical' })
              .setTextAlign('center')
              .run()
          case 'transition':
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: 'screenplay-transition', 'data-type': 'transition' })
              .setTextAlign('right')
              .run()
          default:
            return chain()
              .setParagraph()
              .updateAttributes('paragraph', { class: null, 'data-type': null })
              .setTextAlign('left')
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

      Enter: ({ editor }) => {
        if (this.storage.disabled) return false
        const { state } = editor
        const { selection } = state
        const { $from } = selection
        const node = $from.parent
        const type = node.attrs['data-type']

        if (type === 'character') {
          editor.commands.setScreenplayType('dialogue')
          return true
        }
        return false
      },

      Tab: ({ editor }) => {
        if (this.storage.disabled) return false
        const { state } = editor
        const { selection } = state
        const { $from } = selection
        const node = $from.parent
        const type = node.attrs['data-type']

        if (!type || type === 'action') return editor.commands.setScreenplayType('character')
        if (type === 'character') return editor.commands.setScreenplayType('parenthetical')
        if (type === 'parenthetical') return editor.commands.setScreenplayType('dialogue')
        if (type === 'dialogue') return editor.commands.setScreenplayType('transition')
        if (type === 'transition') return editor.commands.setScreenplayType('scene')
        
        return editor.commands.setScreenplayType('action')
      },
    }
  },
})
