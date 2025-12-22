import type { Draft, UserPersona } from "../types";
import { PROMPT } from "../assets/constants";

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

const buildSystemPrompt = (persona: UserPersona): string => {
  return PROMPT.replace(
    "[User Persona]",
    `${persona.role} in the ${persona.industry} industry with a ${persona.tone} tone`
  );
};

const buildUserPrompt = (
  text: string,
  pageTitle: string,
  url: string
): string => {
  return `
Based on the following content I found interesting, generate THREE different LinkedIn post drafts:

**Source:** ${pageTitle}
**URL:** ${url}

**Content:**
"${text}"

Generate exactly 3 posts in JSON format:
1. "tldr" - A concise, value-driven summary (2-3 sentences max)
2. "perspective" - A "Why this matters" take with your unique point of view (3-4 sentences)
3. "question" - A thought-provoking question to drive engagement (2-3 sentences ending with a question)

Respond ONLY with valid JSON in this exact format:
{
  "tldr": "Your TL;DR post here...",
  "perspective": "Your perspective post here...",
  "question": "Your question-based post here..."
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
    { role: "system", content: buildSystemPrompt(persona) },
    { role: "user", content: buildUserPrompt(text, pageTitle, url) },
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

  // Parse the JSON response
  const parsed = JSON.parse(content);
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
