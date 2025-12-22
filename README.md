# Business Requirements Document (BRD): Lumina

## 1. Project Overview

**Product Name:** Lumina

**Format:** Chrome / Chromium Browser Extension

**Tagline:** _Curation-to-Creation: Turn your digital footprint into social proof._

### 1.1 Problem Statement

Professionals feel "content guilt"—the pressure to maintain a personal brand on LinkedIn—but face two hurdles:

1. **Time/Friction:** It takes too much effort to switch from "working" to "writing."
2. **Authenticity Gap:** Current AI writing tools generate "cringe," generic content that sounds like a robot, harming the user's reputation rather than helping it.

### 1.2 Solution

Lumina is a context-aware browser extension that captures real-world professional activity (reading technical docs, researching, analyzing code) and transforms it into authentic, "human-first" LinkedIn drafts. It removes the "blank page" problem while keeping the user’s unique voice.

---

## 2. Target Audience

- **Developers/Technical Leads:** Sharing GitHub repos, StackOverflow solutions, or new documentation.
- **Product & Growth Managers:** Sharing industry trends, UI/UX insights, or market shifts.
- **Founders & Freelancers:** Building in public and sharing daily lessons.

---

## 3. Functional Requirements

### 3.1 Context Capture Engine

- **Selection Capture:** Ability to highlight any text on a webpage and right-click to "Send to Lumina."
- **URL Metadata:** Automatically extract Page Title, Meta Description, and URL for context.
- **Active Monitoring (Optional):** A "Spark" icon appears if a user spends >2 minutes on a whitelisted high-value domain (e.g., GitHub, Medium, Substack).

### 3.2 AI Insight Generator

- **Persona Personalization:** A settings profile where the user defines their role (e.g., "Senior DevOps Engineer") and tone (e.g., "Minimalist, technical, slightly skeptical").
- **Multi-Hook Generation:** For every captured item, the AI must generate three distinct options:

1. **The TL;DR:** A concise, value-driven summary.
2. **The Perspective:** A "Why this matters" take based on the user's persona.
3. **The Question:** A prompt-based post to drive engagement.

- **Anti-Cringe Filter:** Strict system prompting to avoid common AI tropes (e.g., "I'm thrilled to share," "In today's fast-paced world").

### 3.3 Seamless Integration

- **One-Click Injection:** A "Draft on LinkedIn" button that opens a new LinkedIn tab and automatically injects the text into the post modal.
- **History Log:** A local library of all captured "Sparks" and generated drafts for later use.

---

## 4. Technical Specifications

| Category          | Requirement                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| **Platform**      | Manifest V3 Chrome Extension                                               |
| **Frontend**      | React.js, Tailwind CSS                                                     |
| **Storage**       | Chrome Storage API (Local) + Supabase (Cloud Sync/Auth)                    |
| **AI Processing** | OpenAI API (`gpt-4o-mini`) or Anthropic API (`claude-3-haiku`)             |
| **Privacy**       | Local-first processing; "Incognito" mode to pause tracking; Site Blacklist |

---

## 5. Non-Functional Requirements

- **Low Latency:** AI drafting should take less than 4 seconds.
- **Privacy-First:** User browsing data must not be stored on servers unless explicitly "Saved as Draft."
- **UI/UX:** Minimalist design; must not interfere with the website's native UI.

---

## 6. "Zero-Marketing" Growth Strategy

- **ASO (App Store Optimization):** Focus on keywords like "LinkedIn for Developers," "Content Curation," and "Personal Branding Tool."
- **The "Built-with" Tag:** A small, optional footer at the end of posts: _Generated via Lumina._
- **Platform Parasitism:** Focus on the GitHub-to-LinkedIn pipeline, a specific niche where no good tools exist.

---

## 7. Success Metrics

- **The "Draft-to-Post" Ratio:** Percentage of generated drafts that the user actually publishes.
- **Weekly Active Captures:** Average number of "Sparks" saved per user.

---

### **Next Step for You:**

Would you like me to provide the **System Prompt** for the AI to ensure the drafts are high-quality and "anti-cringe"?
