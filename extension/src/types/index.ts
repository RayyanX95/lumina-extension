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

export interface Draft {
  id: string;
  type: "tldr" | "perspective" | "question" | "story";
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
