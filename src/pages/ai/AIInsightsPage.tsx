import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Bot, Send, Sparkles, User as UserIcon } from 'lucide-react'
import { Card, CardContent, Button, Select } from '@/components/ui'
import { subjects } from '@/data/mockData'
import { suggestedQuestions, getMockAIResponse } from '@/data/aiResponses'
import type { ChatMessage } from '@/types'
import { formatNigeriaTime } from '@/lib/time'

const subjectOptions = [
  { value: 'all', label: 'All subjects' },
  ...subjects.map((s) => ({ value: s.name, label: s.name })),
]

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hi! I'm your Lens AI Companion. Ask me to explain a concept, help with homework, or just tell me what you're working on this week.",
    timestamp: new Date().toISOString(),
  },
]

function timeNow() {
  return new Date().toISOString()
}

export function AIInsightsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [subjectFocus, setSubjectFocus] = useState('all')
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messageIdRef = useRef(0)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isThinking])

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return

    const userMessage: ChatMessage = {
      id: `msg-${++messageIdRef.current}`,
      role: 'user',
      content: trimmed,
      timestamp: timeNow(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    setTimeout(
      () => {
        const aiMessage: ChatMessage = {
          id: `msg-${++messageIdRef.current}-ai`,
          role: 'assistant',
          content: getMockAIResponse(trimmed),
          timestamp: timeNow(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setIsThinking(false)
      },
      1100,
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-text">
            <Bot className="size-6 text-secondary" aria-hidden="true" />
            Lens AI Companion
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            A patient tutor for questions, big or small.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={subjectFocus}
            onChange={(e) => setSubjectFocus(e.target.value)}
            options={subjectOptions}
            aria-label="Focus subject"
          />
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  message.role === 'assistant'
                    ? 'bg-secondary-light text-secondary'
                    : 'bg-primary-light text-primary'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot className="size-4" aria-hidden="true" />
                ) : (
                  <UserIcon className="size-4" aria-hidden="true" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  message.role === 'assistant'
                    ? 'bg-background text-text'
                    : 'bg-primary text-white'
                }`}
              >
                {message.content}
                <span className="mt-1 block text-[11px] opacity-70">{formatNigeriaTime(message.timestamp)}</span>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-light text-secondary">
                <Bot className="size-4" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl bg-background px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-text-muted"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <CardContent className="border-t border-border p-4">
          {messages.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <Sparkles className="size-3" aria-hidden="true" />
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder="Ask a question..."
              rows={1}
              className="h-11 max-h-32 flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
            >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
