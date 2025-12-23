import type { Spark, Settings } from "../types";

const STORAGE_KEYS = {
  SPARKS: "lumina_sparks",
  SETTINGS: "lumina_settings",
} as const;

const defaultSettings: Settings = {
  persona: {
    role: "Software Engineer",
    tone: "Professional yet conversational",
    industry: "Technology",
  },
  enableSparkIcon: true,
  blacklistedDomains: [],
};

// Check if we're in a Chrome extension context
const isChromeExtension = typeof chrome !== "undefined" && chrome.storage;

export const storage = {
  async getSparks(): Promise<Spark[]> {
    if (isChromeExtension) {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SPARKS);
      return (result[STORAGE_KEYS.SPARKS] as Spark[] | undefined) || [];
    }
    const stored = localStorage.getItem(STORAGE_KEYS.SPARKS);
    return stored ? JSON.parse(stored) : [];
  },

  async saveSparks(sparks: Spark[]): Promise<void> {
    if (isChromeExtension) {
      await chrome.storage.local.set({ [STORAGE_KEYS.SPARKS]: sparks });
    } else {
      localStorage.setItem(STORAGE_KEYS.SPARKS, JSON.stringify(sparks));
    }
  },

  async addSpark(spark: Spark): Promise<void> {
    const sparks = await this.getSparks();
    sparks.unshift(spark);
    await this.saveSparks(sparks);
  },

  async removeSpark(id: string): Promise<void> {
    const sparks = await this.getSparks();
    const filtered = sparks.filter((s) => s.id !== id);
    await this.saveSparks(filtered);
  },

  async updateSpark(id: string, updates: Partial<Spark>): Promise<void> {
    const sparks = await this.getSparks();
    const index = sparks.findIndex((s) => s.id === id);
    if (index !== -1) {
      sparks[index] = { ...sparks[index], ...updates };
      await this.saveSparks(sparks);
    }
  },

  async getSettings(): Promise<Settings> {
    if (isChromeExtension) {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
      const storedSettings =
        (result[STORAGE_KEYS.SETTINGS] as Partial<Settings> | undefined) || {};
      return { ...defaultSettings, ...storedSettings };
    }
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored
      ? { ...defaultSettings, ...JSON.parse(stored) }
      : defaultSettings;
  },

  async saveSettings(settings: Settings): Promise<void> {
    if (isChromeExtension) {
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
    } else {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  },
};
