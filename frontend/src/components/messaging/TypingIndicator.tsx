interface TypingIndicatorProps {
  senderName?: string
}

export function TypingIndicator({ senderName }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 px-2">
      <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-xs font-bold flex-shrink-0">
        {senderName ? senderName.charAt(0).toUpperCase() : '?'}
      </div>
      <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3">
        <span className="block w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="block w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="block w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
      </div>
    </div>
  )
}
