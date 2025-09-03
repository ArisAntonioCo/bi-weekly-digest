"use client"

import { PromptInputBox } from '@/components/ui/ai-prompt-box'

interface InputAreaProps {
  onSend: (content: string, files?: File[]) => Promise<void>
  isLoading: boolean
  onStop?: () => void
}

export function InputArea({ onSend, isLoading, onStop }: InputAreaProps) {
  return (
    <div className="border-t border-border/50 bg-background/50 backdrop-blur-sm p-2 md:p-4 flex-shrink-0">
      <div className="mx-auto max-w-4xl">
        <PromptInputBox
          onSend={onSend}
          isLoading={isLoading}
          onStop={onStop}
          placeholder="Ask me to help you create content, configure settings, or manage your newsletter..."
        />
      </div>
    </div>
  )
}