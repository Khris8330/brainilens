import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Bot, Send, Sparkles, User as UserIcon } from 'lucide-react'
import { Card, CardContent, Button, Select } from '@/components/ui'
import { subjects } from '@/data/mockData'
import { suggestedQuestions } from '@/data/aiResponses'
import type { ChatMessage } from '@/types'
import { formatNigeriaTime } from '@/lib/time'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const subjectOptions = [
  { value: 'all', label: 'All subjects' },
  ...subjects.map((s) => ({ value: s.name, label: s.name })),
]

function timeNow() {
  return new Date().toISOString()
}

export function AIInsightsPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${firstName}! I am Lens, your learning companion. Ask me to explain a concept, help with homework, or tell me what you are working on.`,
      timestamp: timeNow(),
    },
  ])
  const [input, setInput] = useState('')
  const [subjectFocus, setSubjectFocus] = useState('all')
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const messageIdRef = useRef(0)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isThinking])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return

    const userMessage: ChatMessage = {
      id: `msg-${++messageIdRef.current}`,
      role: 'user',
      content: trimmed,
      timestamp: timeNow(),
    }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsThinking(true)
    setError('')

    try {
      const history = nextMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }))

      const prompt =
        subjectFocus !== 'all' ? `Subject focus: ${subjectFocus}. ${trimmed}` : trimmed

      const { data, error: invokeError } = await supabase.functions.invoke('lens-chat', {
        body: { message: prompt, history },
      })

      if (invokeError) throw invokeError

      if (data?.error) {
        const msg =
          typeof data.error === 'object' && data.error?.message
            ? String(data.error.message)
            : 'Lens could not reply right now.'
        throw new Error(msg)
      }

      const reply =
        typeof data?.data?.reply === 'string' && data.data.reply.trim()
          ? data.data.reply.trim()
          : 'I am not sure how to answer that yet. Try asking in a different way.'

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${++messageIdRef.current}-ai`,
          role: 'assistant',
          content: reply,
          timestamp: timeNow(),
        },
      ])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lens could not reply right now. Please try again.'
      setError(message)
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${++messageIdRef.current}-ai`,
          role: 'assistant',
          content: 'Sorry, I could not answer just now. Please try again in a moment.',
          timestamp: timeNow(),
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void sendMessage(input)
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
            Real AI answers for learning questions. Conversations are logged for safety review.
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

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-light">
                    <Sparkles className="size-4 text-secondary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'user' ? 'bg-primary text-white' : 'bg-background text-text'
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      message.role === 'user' ? 'text-white/70' : 'text-text-muted'
                    }`}
                  >
                    {formatNigeriaTime(message.timestamp)}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-light">
                    <UserIcon className="size-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <p className="text-sm text-text-muted" role="status">
                Lens is thinking…
              </p>
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 4).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendMessage(q)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-text-muted hover:border-primary hover:text-text"
                >
                  {q}
                </button>
              ))}
            </div>
            {error && (
              <p className="mb-2 text-sm text-error" role="alert">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Lens a learning question…"
                className="min-h-11 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={isThinking}
              />
              <Button type="submit" disabled={isThinking || !input.trim()} aria-label="Send">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
