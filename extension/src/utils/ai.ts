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
CRITICAL LANGUAGE RULE: OUTPUT IN EGYPTIAN ARABIC SLANG (AMMIYA).
- Do NOT use Modern Standard Arabic (Fusha).
- Tone: Like a Senior Engineer explaining a concept to a junior friend at a coffee shop.
- Avoid dramatic storytelling (e.g., "I was crying", "The world changed"). Keep it grounded.
- Use Egyptian idioms/words naturally (e.g., "يا جماعة", "اللي حصل", "شغل عالي", "الموضوع ده").
- Keep technical terms in English (e.g., "Refactoring", "Bug", "API") but sentence structure in Egyptian Arabic.
`
      : "";

  return `
Role: You are a Senior ${userPersona}. You are sharing a technical insight on LinkedIn.
Context: You just read: "${pageTitle}" (${url}).
Input Text: "${text}"

${languageInstructions}

STRICT QUALITY RULES:
1. NO INTROS: Do not start with "I'm excited" or generic hooks.
2. NO DATA DRAMA: Do not say "My life changed forever." Say "This saved me 2 hours."
3. FORMATTING: No em-dashes (—). No sparkles (✨). Use simple periods.
4. TONE: ${
    language === "ar"
      ? "Friendly, direct Egyptian Ammiya. Explaining, not storytelling."
      : "Conversational, direct, credible. Like a Slack message to a peer."
  }

---
STYLE REFERENCE (Follow this "Lumina" style):
${
  language === "ar"
    ? '✅ RIGHT: "لما الـ App يبدأ يتقل مع كتر الـ rendering، المشكلة غالبًا بتكون في structure الكود نفسه. الحل مش دايماً React.memo، ساعات كتير بيكون في الـ state placement."'
    : '❌ WRONG (AI-speak): "Mastering Chrome DevTools can significantly improve your debugging efficiency and save you time."'
}
✅ RIGHT (Lumina-speak): "We often blame the network for slow loads, but usually, it is just unoptimized assets crushing the main thread."
---

Generate 4 versions in JSON:

1. "tldr": (The Practical Win)
   - Start with a specific result.
   - Example: "The Coverage tab in DevTools just pruned 40% of my unused CSS. My bundle size thanks me."

2. "perspective": (The Insight)
   - Explain the "Why" behind the tech.
   - Connect it to a real engineering principle (e.g., DX, Performance, Maintenance).
   - Max 3 lines.

3. "question": (The Discussion)
   - Ask a technical question based on a specific trade-off.
   - Example: "Computed Tab vs. Styles Tab: Which one do you actually trust for debugging layout shifts?"

4. "story": (The Mentorship Scenario) 
   - GOAL: Explain a concept by describing a common situation/pattern.
   - DO NOT write a personal diary entry ("I was working on a project...").
   - DO NOT use past tense narrative ("I decided to...").
   - STRUCTURE:
     1. The Situation: "When you have [Problem]..." or "We often face [Issue]..."
     2. The Explanation: "The real bottleneck is usually..."
     3. The Fix: "That is where [Concept] comes in. It helps by..."
   - TONE: Educational, conversational, "Senior explaining to Junior".
   - Length: 3-5 short, punchy paragraphs. Use white space between lines.

5. "tags": (Hashtags)
   - Generate 3-5 relevant, high-traffic hashtags based on the topic.
   - Format: "#Tag1 #Tag2 #Tag3" (space separated string).

JSON OUTPUT:
{
  "tldr": "",
  "perspective": "",
  "question": "",
  "story": "",
  "tags": ""
}

IMPORTANT: Ensure all newlines inside string values are escaped (use \\n). Valid JSON only.
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
    story: string;
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
    // A better approach for "story" which is multiline: use a standard replacement.

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
      type: "story",
      content: formatWithTags(parsed.story),
      createdAt: now,
      isEdited: false,
    },
  ];

  return drafts;
}
