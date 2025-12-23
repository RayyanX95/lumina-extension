import type { Draft, UserPersona } from "../types";

interface GenerateDraftsParams {
  text: string;
  pageTitle: string;
  url: string;
  persona: UserPersona;
  apiKey: string;
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const buildUserPrompt = (
  text: string,
  pageTitle: string,
  url: string,
  userPersona: string
): string => {
  return `
Role: You are a Senior ${userPersona}. You are writing a LinkedIn post for your peers.
Context: You just found this: "${pageTitle}" (${url}).
Input Text: "${text}"

STRICT QUALITY RULES:
1. NO INTROS: Do not start with "I'm excited," "Check out," or "Next.js 16 is here." 
2. NO CORPORATE SLOP: Banned words: leverage, streamline, robust, empower, efficiency, enhance, game-changer, unlock, comprehensive.
3. FORMATTING: No em-dashes (—). No sparkles (✨). Use simple periods.
4. TONE: Use "I" and "me." Use contractions (don't, it's). Write like a Slack message to a friend.

---
STYLE REFERENCE (Follow this "Lumina" style):
❌ WRONG (AI-speak): "Mastering Chrome DevTools can significantly improve your debugging efficiency and save you time."
✅ RIGHT (Lumina-speak): "I used to waste 20 minutes a day hunting for 'ghost CSS.' Then I found the Coverage tab. It’s a total sanity saver."
---

Generate 3 versions in JSON:

1. "tldr": (The Practical Win)
   - Start with a specific result.
   - Example: "The Coverage tab in DevTools just pruned 40% of my unused CSS. My bundle size thanks me."

2. "perspective": (The Hot Take)
   - Start with an opinion or a frustration.
   - Focus on the *human feeling* (relief, annoyance, or "aha!" moment).
   - Max 3 lines.

3. "question": (The Debate)
   - Present a "This vs. That" or a "Hidden Gem" scenario.
   - Example: "Computed Tab vs. Styles Tab: Which one do you actually trust for debugging layout shifts?"

JSON OUTPUT:
{
  "tldr": "",
  "perspective": "",
  "question": ""
}
`;
};

export async function generateDrafts(
  params: GenerateDraftsParams
): Promise<Draft[]> {
  const { text, pageTitle, url, persona, apiKey } = params;

  if (!apiKey) {
    throw new Error(
      "API key is required. Please add your OpenAI API key in Settings."
    );
  }

  const messages: OpenAIMessage[] = [
    {
      role: "user",
      content: buildUserPrompt(text, pageTitle, url, persona.role),
    },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.8,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate drafts");
  }

  const data: OpenAIResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content received from AI");
  }

  // Clean and Parse the JSON response
  let parsed: { tldr: string; perspective: string; question: string };
  try {
    // Remove markdown code blocks if present
    const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
    parsed = JSON.parse(cleanContent);
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    throw new Error("Failed to parse AI response. Please try again.");
  }
  const now = Date.now();

  const drafts: Draft[] = [
    {
      id: generateId(),
      type: "tldr",
      content: parsed.tldr,
      createdAt: now,
      isEdited: false,
    },
    {
      id: generateId(),
      type: "perspective",
      content: parsed.perspective,
      createdAt: now,
      isEdited: false,
    },
    {
      id: generateId(),
      type: "question",
      content: parsed.question,
      createdAt: now,
      isEdited: false,
    },
  ];

  return drafts;
}
