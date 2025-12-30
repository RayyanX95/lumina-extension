import type { Draft, UserPersona } from "../types";

interface GenerateDraftsParams {
  text: string;
  pageTitle: string;
  url: string;
  persona: UserPersona;
  language?: "en" | "ar";
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
  userPersona: string,
  language: "en" | "ar" = "en"
): string => {
  const languageInstructions =
    language === "ar"
      ? `
CRITICAL LANGUAGE RULE: OUTPUT IN 100% EGYPTIAN AMMIYA.
- NO Modern Standard Arabic (Fusha). NO "هذه", "قام بـ", "تلك", "يعتبر".
- Write like a real engineer talking, NOT a presenter.
- DO NOT translate technical terms. Keep them in English (e.g., "PRs", "Code Review", "Bottleneck", "YAML").
- Use spoken connectors: "عشان", "اللي", "بصراحة", "بجد", "فا".
- Sentences can be slightly imperfect. This is NOT an article.
- PRESERVE any frustration, reflection, or casual tone from the input.
- DO NOT invent emotions or exaggerate if they are not present.
`
      : `
CRITICAL LANGUAGE RULE:
- Conversational English only.
- NOT motivational. NOT inspirational. NOT polished.
- Short, imperfect sentences are OK.
- Write like a senior engineer typing a post, not publishing content.
`;

  return `
Role: You are a Senior ${userPersona}.

Context:
You just read this page and you’re sharing a technical reflection on LinkedIn:
"${pageTitle}" (${url})

Input Text:
"${text}"

${languageInstructions}

ABSOLUTE RULES (BREAKING ANY = INVALID OUTPUT):
1. NO FICTION:
   - Do NOT invent personal stories, teams, clients, timelines, or outcomes.
   - If something isn’t in the input, don’t add it.

2. NO LINKEDIN GURU TONE:
   - No “Here’s why this matters”
   - No “In today’s fast-paced world”
   - No “The key takeaway is”
   - No motivational or coaching language

3. POST, NOT ARTICLE:
   - This must feel like a LinkedIn post written in one sitting.
   - Slight roughness is GOOD.

4. STORYTELLING:
   - If the input contains storytelling or reflection, preserve it.
   - If it doesn’t, do NOT add fake narrative.

5. AUDIENCE:
   - Write peer-to-peer.
   - Assume readers are senior engineers.
   - No explaining basics.

IMPERFECTION RULE:
- Do NOT make the post feel complete or conclusive.
- Slightly abrupt or open-ended endings are preferred.
- One uneven or opinionated sentence is REQUIRED.
---

Generate 4 versions in JSON:

1. "tldr" (The Practical Win)
   - One short sentence.
   - Direct, concrete takeaway.
   - No fluff.

2. "perspective" (The Insight)
   - 2–3 short lines.
   - Focus on *why this matters technically* (DX, velocity, trade-offs).
   - No advice tone.

3. "question" (The Discussion)
   - One real technical trade-off question.
   - Something seniors would actually argue about.

4. "scenario" (Problem → Cause → Fix)
   - Use ONLY what exists in the input.
   - NO fictional examples.
   - Preserve original frustration or reflection if present.
   - Structure:
     1. The Mess – real pain mentioned in the text
     2. The Why – actual technical reason
     3. The Fix – what changed or worked
   - 6–8 short paragraphs.
   - Double newlines between paragraphs.
   - No dramatic language unless present in input.

5. "tags"
   - 3–5 realistic, high-signal hashtags.
   - No marketing tags.

JSON OUTPUT ONLY (Escape newlines with \\n):
{
  "tldr": "",
  "perspective": "",
  "question": "",
  "scenario": "",
  "tags": ""
}
`;
};

export async function generateDrafts(
  params: GenerateDraftsParams
): Promise<Draft[]> {
  const { text, pageTitle, url, persona, language = "en" } = params;

  // No apiKey needed on client side anymore!

  const messages: OpenAIMessage[] = [
    // { role: "system", content: buildSystemPrompt(persona) },
    {
      role: "user",
      content: buildUserPrompt(text, pageTitle, url, persona.role, language),
    },
  ];

  // Call our local proxy server
  const response = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
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
  let parsed: {
    tldr: string;
    perspective: string;
    question: string;
    scenario: string;
    tags: string;
  };
  try {
    // Robust parsing: Find the first '{' and last '}'
    const startIndex = content.indexOf("{");
    const endIndex = content.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON object found in response");
    }

    const jsonStr = content.substring(startIndex, endIndex + 1);

    // SANITIZATION: Escape unescaped newlines inside string values
    // This is a naive heuristic but handles the common case where AI puts
    // real newlines inside the JSON string value for formatting.
    // We want to keep newlines that are already escaped (\\n) alone.
    // But honestly, it's safer to just rely on regex if formatting is bad.
    // A better approach for "scenario" which is multiline: use a standard replacement.

    // Attempt to parse. if it fails due to Bad Control Character, we might try to fix it.
    // But let's rely on prompt instructions first.
    // Actually, let's just make the prompt stricter.

    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error(
      "Failed to parse AI response. Content:",
      content,
      "Error:",
      e
    );
    throw new Error("Failed to parse AI response. Please try again.");
  }
  const now = Date.now();

  const formatWithTags = (text: string) => {
    return `${text}\n\n${parsed.tags || ""} #lumina #lumina_extension`;
  };

  const drafts: Draft[] = [
    {
      id: generateId(),
      type: "tldr",
      content: formatWithTags(parsed.tldr),
      createdAt: now,
      isEdited: false,
    },
    {
      id: generateId(),
      type: "perspective",
      content: formatWithTags(parsed.perspective),
      createdAt: now,
      isEdited: false,
    },
    {
      id: generateId(),
      type: "question",
      content: formatWithTags(parsed.question),
      createdAt: now,
      isEdited: false,
    },
    {
      id: generateId(),
      type: "scenario",
      content: formatWithTags(parsed.scenario),
      createdAt: now,
      isEdited: false,
    },
  ];

  return drafts;
}
