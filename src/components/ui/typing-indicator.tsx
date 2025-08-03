"use client"

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className = "" }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="h-2 w-2 rounded-full bg-current animate-bounce" 
        style={{ animationDelay: '0ms', animationDuration: '1.4s' }} 
      />
      <div 
        className="h-2 w-2 rounded-full bg-current animate-bounce" 
        style={{ animationDelay: '0.2s', animationDuration: '1.4s' }} 
      />
      <div 
        className="h-2 w-2 rounded-full bg-current animate-bounce" 
        style={{ animationDelay: '0.4s', animationDuration: '1.4s' }} 
      />
    </div>
  )
}