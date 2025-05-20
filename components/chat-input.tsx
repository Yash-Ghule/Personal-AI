"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (input.trim() && !isSubmitting) {
      setIsSubmitting(true)

      try {
        await onSendMessage(input.trim())
        setInput("")

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-resize textarea
  const handleInput = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  return (
    <div className="flex items-end gap-2 relative">
      <div className="relative w-full">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type a message..."
          className="resize-none min-h-[40px] max-h-[200px] pr-10"
          rows={1}
          disabled={isSubmitting}
        />
        <Button
          size="sm"
          className="absolute right-2 bottom-1.5 h-7 w-7 p-0"
          onClick={handleSubmit}
          disabled={!input.trim() || isSubmitting}
          aria-label="Send message"
          title="Send message"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
