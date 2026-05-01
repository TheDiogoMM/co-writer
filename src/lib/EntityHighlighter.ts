import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface Entity {
  name: string
  color: string
  type: 'character' | 'setting'
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    entityHighlighter: {
      setEntities: (entities: Entity[]) => ReturnType,
      addEntity: (entity: Entity) => ReturnType,
    }
  }
}

export const EntityHighlighter = Extension.create({
  name: 'entityHighlighter',

  addStorage() {
    return {
      entities: [] as Entity[],
    }
  },

  addCommands() {
    return {
      setEntities: (entities: Entity[]) => ({ state, dispatch }) => {
        if (!state || !dispatch) return false;
        this.storage.entities = entities;
        // Trigger a fake transaction to refresh decorations
        dispatch(state.tr);
        return true;
      },
      addEntity: (entity: Entity) => ({ state, dispatch }) => {
        if (!state || !dispatch) return false;
        const current = this.storage.entities as Entity[];
        if (!current.find(e => e.name === entity.name)) {
          this.storage.entities = [...current, entity];
          dispatch(state.tr);
        }
        return true;
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      {
        props: {
          decorations: (state) => {
            if (!state || !state.doc) return DecorationSet.empty;
            
            const entities = (this.storage as any)?.entities as Entity[];
            if (!entities || entities.length === 0) return DecorationSet.empty;

            const decorations: Decoration[] = [];
            
            state.doc.descendants((node, pos) => {
              if (node.isText && node.text) {
                entities.forEach(entity => {
                  if (!entity.name) return;
                  const escapedName = entity.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
                  let match;
                  while ((match = regex.exec(node.text!)) !== null) {
                    const start = pos + match.index;
                    const end = start + match[0].length;
                    decorations.push(
                      Decoration.inline(start, end, {
                        style: `background-color: ${entity.color}33; border-bottom: 2px solid ${entity.color}; font-weight: bold; padding: 0 2px; border-radius: 2px;`,
                        title: `${entity.type === 'character' ? 'Personagem' : 'Cenário'}: ${entity.name}`
                      })
                    )
                  }
                });
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      },
    ]
  },
})
