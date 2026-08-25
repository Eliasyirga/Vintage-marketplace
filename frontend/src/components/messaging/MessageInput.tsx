import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { emitTypingStart, emitTypingStop } from '../../services/socket.service'

interface MessageInputProps {
  conversationId: string
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ conversationId, onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTyping = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [text])

  const stopTyping = useCallback(() => {
    if (isTyping.current) {
      emitTypingStop(conversationId)
      isTyping.current = false
    }
  }, [conversationId])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)

    // Typing indicator debounce
    if (!isTyping.current) {
      emitTypingStart(conversationId)
      isTyping.current = true
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(stopTyping, 1500)
  }

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
      stopTyping()
    }
  }, [stopTyping])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const content = text.trim()
    if (!content || isSending || disabled) return

    stopTyping()
    setText('')
    setIsSending(true)
    try {
      await onSend(content)
    } finally {
      setIsSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-3 bg-white border-t border-stone-200"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSending}
        placeholder="Type a message… (Enter to send)"
        maxLength={2000}
        className="flex-1 resize-none bg-stone-50 border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all min-h-[42px] max-h-[120px] disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || isSending || disabled}
        className="flex-shrink-0 w-10 h-10 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-200 disabled:text-stone-400 text-white flex items-center justify-center shadow-md shadow-amber-500/25 disabled:shadow-none transition-all active:scale-95"
      >
        {isSending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </form>
  )
}
