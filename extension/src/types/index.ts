// Core types for Lumina extension

export interface Spark {
  id: string;
  text: string;
  url: string;
  pageTitle: string;
  domain: string;
  capturedAt: number;
  drafts?: Draft[];
}

// Generation modes for AI
export type GenerationMode = "drafts" | "rewrite";

export interface Draft {
  id: string;
  type: "tldr" | "perspective" | "question" | "scenario" | "rewrite";
  content: string;
  createdAt: number;
  isEdited: boolean;
}

export interface UserPersona {
  role: string;
  tone: string;
  industry: string;
}

export interface Settings {
  persona: UserPersona;
  language: "en" | "ar";
  enableSparkIcon: boolean;
  blacklistedDomains: string[];
}

export type View = "home" | "capture" | "drafts" | "history" | "settings";

export interface AppState {
  currentView: View;
  sparks: Spark[];
  activeSpark: Spark | null;
  isGenerating: boolean;
  settings: Settings;
}

export interface GenerateDraftsParams {
  text: string;
  pageTitle: string;
  url: string;
  persona: UserPersona;
  language?: "en" | "ar";
  mode?: GenerationMode;
}

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
