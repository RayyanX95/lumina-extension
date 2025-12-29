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
- NO Modern Standard Arabic (Fusha). NO "هذه", "قام بـ", "تلك".
- DO NOT translate technical terms. Keep them in English (e.g., "PRs", "Pull Requests", "Code Review", "Bottleneck", "YAML").
- Use: "الأدوات دي", "اللي بيحصل", "بجد", "عشان".
`
      : "";

  return `
Role: You are a Senior ${userPersona}. 
Context: You are commenting on a technical topic: "${pageTitle}" (${url}).
Input Text: "${text}"

${languageInstructions}

STRICT QUALITY RULES:
1. NO STORYTELLING: Do not write a "Once upon a time" story. Do not say "One day I found...".
2. TONE: Direct, professional, and peer-to-peer. Like a Slack message or a coffee-shop chat.
3. NO FAKE DRAMA: Do not invent personal events. Use technical frustrations only (e.g., "ضيعت يومي كله") as a way to describe a common work problem.
4. LANGUAGE: ${
    language === "ar"
      ? "Egyptian Ammiya. Keep technical English terms as they are."
      : "Conversational English."
  }

---
Generate 4 versions in JSON:

1. "tldr": (The Practical Win)
   - One sentence. A direct result or a punchy takeaway.

2. "perspective": (The Insight)
   - 2-3 lines max. Explain the "Why" (e.g., DX, Team Velocity).

3. "question": (The Discussion)
   - A technical trade-off question to engage other seniors.

4. "scenario": (The Problem/Solution Deep Dive) 
   - DO NOT tell a fairy tale. Describe a complex technical situation.
   - Breakdown:
     1. The Mess: Start with a common frustration (e.g., "أصعب حاجة لما التيم يغرق في...")
     2. The "Why": Explain the root cause or the technical bottleneck.
     3. The Practical Fix: Describe the "Aha!" moment and the direct result.
   - LENGTH: Make it 6-8 short, punchy paragraphs. 
   - ARABIC TONE: Use "كان هيجيلي جلطة" or "ضيعت يومي كله" only to show technical frustration.
   - Formatting: Use double newlines (\\n\\n) for readability.

5. "tags": (Hashtags)
   - 3-5 high-traffic hashtags (e.g., #NextJS #Engineering).

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
