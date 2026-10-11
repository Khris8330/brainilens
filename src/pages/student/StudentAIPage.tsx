import { useState, type FormEvent } from 'react'
import { Bot, Send } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, TextArea, Badge } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function StudentAIPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi ${firstName}! I am Lens, your learning companion. What would you like to learn today?`,
    },
  ])
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState('')

  const suggestions = [
    'Explain fractions',
    'Help me study for my science quiz',
    'What is photosynthesis?',
    'Give me a math practice question',
  ]

  async function sendMessage(event?: FormEvent, preset?: string) {
    event?.preventDefault()
    const trimmed = (preset ?? question).trim()
    if (!trimmed || isSending) return

    setChatError('')
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setQuestion('')
    setIsSending(true)

    try {
      const history = nextMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
      const { data, error } = await supabase.functions.invoke('lens-chat', {
        body: { message: trimmed, history },
      })

      if (error) {
        throw error
      }

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

      setMessages((items) => [...items, { role: 'assistant', content: reply }])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lens could not reply right now. Please try again.'
      setChatError(message)
      setMessages((items) => [
        ...items,
        {
          role: 'assistant',
          content: 'Sorry, I could not answer just now. Please try again in a moment.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-text">
            <Bot className="size-6 text-secondary" aria-hidden="true" />
            Ask Lens
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Your AI study companion. Questions are logged so a trusted adult can review them if
            needed.
          </p>
        </div>
        <Badge variant="secondary">Live AI</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-xl bg-background p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'border border-border bg-surface text-text'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isSending && (
              <p className="text-sm text-text-muted" role="status">
                Lens is thinking…
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => void sendMessage(undefined, item)}
                className="rounded-full border border-border px-3 py-1 text-xs text-text-muted hover:border-primary hover:text-text"
              >
                {item}
              </button>
            ))}
          </div>

          {chatError && (
            <p role="alert" className="mt-3 text-sm text-error">
              {chatError}
            </p>
          )}

          <form onSubmit={(event) => void sendMessage(event)} className="mt-4 flex items-end gap-3">
            <TextArea
              label="Ask Lens"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a learning question..."
              rows={2}
            />
            <Button type="submit" aria-label="Send question" disabled={isSending || !question.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default StudentAIPage
