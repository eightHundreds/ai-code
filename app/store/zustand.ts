// store.ts
'use client'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { indexedDBStorage } from './indexedDBStorage'

export interface CodeItem {
  png: string
  html: string
  date?: string
}

interface StoreState {
  aiInfo: {
    base_url: string
    key: string
    systemPrompt: string
    userPrompt?: string
  }
  setAiInfo: (aiInfo: Partial<StoreState['aiInfo']>) => void
  history: CodeItem[]
  addRecord: (record: CodeItem) => void
  loadHistory: () => Promise<void>
}

const ISSERVER = typeof window === 'undefined'

const useStore = create<StoreState>()(devtools(set => ({
  // localStorage
  aiInfo: ISSERVER
    ? {}
    : localStorage?.getItem('aiInfo')
      ? JSON.parse(localStorage?.getItem('aiInfo') as string)
      : {
          base_url: 'https://api.openai.com/v1/chat/completions',
          key: '',
          systemPrompt: `# Role: Tailwind CSS Developer

## Task

- Input: Screenshot(s) of a reference web page or Low-fidelity
- Output: Single HTML page using Tailwind CSS, HTML

## Guidelines

- Utilize Tailwind CSS to develop the website based on the provided screenshot or Low-fidelity
- Achieve an exact visual match to the provided screenshot or Low-fidelity
- Pay close attention to:
  - Background color
  - Text color
  - Font size
  - Font family
  - Padding
  - Margin
  - Border
- Use the precise text from the screenshot
- Avoid placeholder comments; write the full code
- Repeat elements as shown in the screenshot (e.g., if there are 15 items, include 15 items in the code)
- Use placeholder images from \`https://placehold.co\` with descriptive \`alt\` text for future image generation

## Libraries

- Include Tailwind CSS via: \`<script src="https://cdn.tailwindcss.com"></script>\`

## Deliverable

- Respond with the complete HTML code within \`<html>\` tags
- Respond with the HTML file content only
          `,
          userPrompt: 'Turn this into a single html file using tailwind.',
        },

  setAiInfo: (aiInfo: Partial<StoreState['aiInfo']>) => {
    set((state) => {
      const finalResult = {
        aiInfo: {
          ...state.aiInfo,
          ...aiInfo,
        },
      }
      localStorage?.setItem('aiInfo', JSON.stringify(finalResult.aiInfo))
      return finalResult
    })
  },
  history: [],
  addRecord: (record: CodeItem) => {
    set(state => ({ history: [...state.history, record] }))
    indexedDBStorage.setItem('history-storage', record)
  },
  loadHistory: async () => {
    const data = await indexedDBStorage.getItem('history-storage')
    console.log(data, 'data')
    set(() => ({ history: data.map((record: any) => record?.value) }))
  },
}), {
  name: 'ai-code',
}))

export function getGlobalStore() {
  return useStore.getState()
}

export default useStore
