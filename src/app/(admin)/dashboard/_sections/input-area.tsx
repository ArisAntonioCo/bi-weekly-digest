"use client"

import { PromptInputBox } from '@/components/ui/ai-prompt-box'

interface InputAreaProps {
  onSend: (content: string, files?: File[]) => Promise<void>
  isLoading: boolean
}

export function InputArea({ onSend, isLoading }: InputAreaProps) {
  return (
    <div className="border-t bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <PromptInputBox
          onSend={onSend}
          isLoading={isLoading}
          placeholder="Ask me to help you create content, configure settings, or manage your newsletter..."
        />
      </div>
    </div>
  )
}