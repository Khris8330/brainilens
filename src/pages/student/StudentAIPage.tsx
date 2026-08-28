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
  const [healthCheckResult, setHealthCheckResult] = useState<string | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [chatError, setChatError] = useState('')

  const suggestions = [
    'Explain fractions',
    'Help me study for my science quiz',
    'What is photosynthesis?',
    'Give me a math practice question',
  ]

  async function testAIConnection() {
    setIsCheckingHealth(true)
    setHealthCheckResult(null)
    const { data, error } = await supabase.functions.invoke('ai-health-check', { method: 'POST' })
    setHealthCheckResult(error ? error.message : data?.data?.reply ?? 'No reply returned.')
    setIsCheckingHealth(false)
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault()
    const trimmed = question.trim()
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
        setChatError(error.message || 'Lens could not reply right now.')
        setMessages((items) => [
          ...items,
          {
            role: 'assistant',
            content: 'Sorry, I could not answer just now. Please try again in a moment.',
          },
        ])
      } else {
        const reply =
          typeof data?.data?.reply === 'string' && data.data.reply.trim()
            ? data.data.reply.trim()
            : 'I am here to help. Could you ask that another way?'
        setMessages((items) => [...items, { role: 'assistant', content: reply }])
      }
    } catch {
      setChatError('Lens could not reply right now.')
      setMessages((items) => [
        ...items,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Lens AI Companion</h1>
        <p className="mt-1 text-sm text-text-muted">
          Your learning companion for {user?.name ?? 'your student account'}.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary-light">
            <Bot className="size-5 text-secondary" />
          </div>
          <div>
            <CardTitle>Study chat</CardTitle>
            <Badge variant="secondary" className="mt-1">
              Live AI
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-72 flex-col gap-3 rounded-lg bg-background p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  message.role === 'user'
                    ? 'self-end bg-primary text-white'
                    : 'self-start border border-border bg-surface text-text'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isSending && (
              <div className="self-start rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted">
                Lens is thinking…
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuestion(suggestion)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-text-muted hover:border-primary hover:text-primary"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Button type="button" variant="outline" onClick={testAIConnection} disabled={isCheckingHealth}>
              {isCheckingHealth ? 'Testing...' : 'Test AI Connection'}
            </Button>
            {healthCheckResult && (
              <p role="status" className="mt-2 text-sm text-text-muted">
                {healthCheckResult}
              </p>
            )}
            {chatError && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {chatError}
              </p>
            )}
          </div>

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
