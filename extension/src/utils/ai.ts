import type {
  Draft,
  GenerateDraftsParams,
  OpenAIMessage,
  OpenAIResponse,
} from "../types";
import { buildRewritePrompt, buildUserPrompt } from "./prompts";

const generateId = () => Math.random().toString(36).substring(2, 15);

export async function generateDrafts(
  params: GenerateDraftsParams
): Promise<Draft[]> {
  const {
    text,
    pageTitle,
    url,
    persona,
    language = "en",
    mode = "drafts",
  } = params;

  // Build the appropriate prompt based on mode
  const promptContent =
    mode === "rewrite"
      ? buildRewritePrompt(text, language)
      : buildUserPrompt(text, pageTitle, url, persona.role, language);

  const messages: OpenAIMessage[] = [
    {
      role: "user",
      content: promptContent,
    },
  ];

  // Call our local proxy server
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const response = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      mode, // Pass mode to server for potential model/temperature adjustments
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

  const now = Date.now();

  // ============================================
  // REWRITE MODE - Single draft, raw text output
  // ============================================
  if (mode === "rewrite") {
    return [
      {
        id: generateId(),
        type: "rewrite",
        content: content.trim(),
        createdAt: now,
        isEdited: false,
      },
    ];
  }

  // ============================================
  // DRAFTS MODE - Multi-draft JSON parsing
  // ============================================
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

  const formatWithTags = (draftText: string) => {
    return `${draftText}\n\n${parsed.tags || ""} #lumina #lumina_extension`;
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
