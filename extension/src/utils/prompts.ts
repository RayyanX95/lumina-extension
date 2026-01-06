/**
 * Builds a prompt for the rewrite mode, instructing the AI to act as a human rewriter
 * who preserves meaning and structure while using natural, everyday wording.
 *
 * @param text - The input text to be rewritten.
 * @param language - The target language ("en" for English, "ar" for Egyptian Ammiya).
 * @returns A formatted prompt string for the AI.
 */
export const buildRewritePrompt = (
  text: string,
  language: "en" | "ar" = "en"
): string => {
  const languageRule =
    language === "ar"
      ? `
LANGUAGE RULE:
- Output in 100% Egyptian Ammiya.
- NO Fusha. NO "هذه", "قام بـ", "تلك".
- Keep all technical terms in English exactly as written.
- Match the input language exactly.
`
      : `
LANGUAGE RULE:
- Match the input language exactly.
- Keep all technical terms exactly as-is.
`;

  return `
MODE: rewrite

ROLE:
You are a Human Rewriter.
You are NOT a writer, editor, teacher, explainer, or commentator.

YOUR ONLY JOB:
Rewrite the input text using more natural, human wording
WITHOUT changing meaning, structure, intent, scope, or length.

THIS IS A REWRITE, NOT A REINTERPRETATION.

---

INPUT TEXT:
"${text}"

---

HARD RULES (BREAKING ANY = INVALID OUTPUT):

1. MEANING LOCK 🔒
- Every sentence must preserve the exact original meaning.
- Do NOT add new ideas, explanations, examples, opinions, or framing.
- Do NOT remove, merge, or split ideas.

2. STRUCTURE LOCK 🧱
- Keep the exact paragraph order.
- Keep all headings exactly where they are.
- If the input uses numbered sections, keep the same numbers.
- If the input uses lists or bullets, KEEP lists or bullets.
- Do NOT convert lists into paragraphs or paragraphs into lists.
- Do NOT add new sections or subsection titles.

3. CONTENT BOUNDARY 🚫
- Do NOT continue the content beyond where the input ends.
- If the input stops mid-section or feels incomplete, STOP at the same point.
- Do NOT “finish”, “complete”, or “extend” the text in any way.

4. NO CONTEXT INJECTION 🚫
- Do NOT add:
  - Personal experiences
  - Company names
  - Products
  - Projects
  - Clients
  - Timelines
  - Predictions
- If it is not explicitly written in the input, it MUST NOT appear.

5. NO TONE SHIFT 🎭
- Do NOT make the text more dramatic.
- Do NOT make it more opinionated.
- Do NOT make it more motivational or inspirational.
- Do NOT make it sound like a blog post, article, lesson, or debate.

6. HUMAN, NOT POLISHED 🧠
- Use simple, everyday wording.
- Slightly imperfect phrasing is OK.
- Avoid academic, marketing, or presentation-style language.
- Focus on rewriting each sentence naturally, not improving it.
- In Arabic: replace formal verbs with common spoken ones
  (e.g., "يتم استخدام" → "بنستخدم").

7. NO SUMMARY, NO CONCLUSION 🚫
- Do NOT add a wrap-up, verdict, or takeaway
  unless it already exists in the input.
- Do NOT add, remove, or change hashtags.
- If the input has hashtags, reproduce them exactly.

${languageRule}

---

ALLOWED TRANSFORMATIONS:
- Simplify wording
- Reduce stiffness
- Replace formal phrases with natural ones
- Minor sentence reordering ONLY if meaning is untouched

FORBIDDEN TRANSFORMATIONS:
- Reframing the topic
- Completing unfinished ideas
- Adding educational clarity not present in the input
- Making it sound smarter, deeper, or broader
- Turning it into an article, lesson, or opinion piece

---

OUTPUT FORMAT:
- Output ONLY the rewritten text.
- No explanations.
- No commentary.
- No analysis.
`;
};

/**
 * Builds a prompt for the user mode, instructing the AI to act as a specific persona
 * sharing a technical reflection on LinkedIn based on a provided page and text.
 *
 * @param text - The input text or reflection to be shared.
 * @param pageTitle - The title of the page being referenced.
 * @param url - The URL of the page being referenced.
 * @param userPersona - The professional persona of the user (e.g., "Software Engineer").
 * @param language - The target language ("en" for English, "ar" for Egyptian Ammiya).
 * @returns A formatted prompt string for the AI.
 */
export const buildUserPrompt = (
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
