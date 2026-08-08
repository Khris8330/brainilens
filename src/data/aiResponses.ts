export const suggestedQuestions: string[] = [
  'Explain fractions to me',
  'How does long division work?',
  'What is the water cycle?',
  'Help me understand character motivation',
]

const responses: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['fraction'],
    answer:
      "Of course! Think of a fraction as a part of a whole. If you cut a pizza into 4 equal slices and eat 1, you've eaten 1/4 of the pizza , the bottom number (4) is how many pieces the whole is split into, and the top number (1) is how many pieces you have. Want to try a practice problem together?",
  },
  {
    keywords: ['division', 'divide'],
    answer:
      'Long division breaks a big division problem into smaller steps: divide, multiply, subtract, bring down , then repeat. Start with the leftmost digit of the number you\u2019re dividing, and work your way right one digit at a time. Want to walk through an example step by step?',
  },
  {
    keywords: ['water cycle'],
    answer:
      'The water cycle has four main stages: evaporation (water turns into vapor and rises), condensation (vapor cools and forms clouds), precipitation (water falls as rain or snow), and collection (water gathers in rivers, lakes, and oceans) before the cycle starts again. Which stage would you like to dig into more?',
  },
  {
    keywords: ['character', 'motivation'],
    answer:
      "Character motivation is the 'why' behind what a character does. A good way to find it is to ask: what does this character want, and what are they afraid of? Those two things usually explain most of their choices in a story. Want to try this with a character from what you're reading this week?",
  },
  {
    keywords: ['multiplication', 'multiply', 'times table'],
    answer:
      'Multiplication is really just repeated addition , 4 \u00d7 3 means adding 4 together 3 times (4 + 4 + 4 = 12). Skip counting can also help: counting by 4s three times gets you to 12 too. Want to practice a few together?',
  },
]

const fallbackResponses = [
  "That's a great question! Let's break it down together , can you tell me which part is tricky, the concept itself or applying it to a problem?",
  "Good thinking! Here's one way to look at it: try connecting it to something you already know well, then we can build from there. Want an example?",
  "I like that you're asking! Let's work through it step by step so it really sticks , what have you tried so far?",
]

export function getMockAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()
  const match = responses.find((r) =>
    r.keywords.some((keyword) => lower.includes(keyword)),
  )
  if (match) return match.answer
  const index = userMessage.length % fallbackResponses.length
  return fallbackResponses[index]
}
