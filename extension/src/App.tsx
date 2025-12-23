import { useState, useEffect, useCallback } from "react";
import "./index.css";
import type { Spark, Settings, View } from "./types";
import { storage } from "./utils/storage";
import { Header } from "./components/Header";
import { HomeView } from "./components/views/HomeView";
import { DraftsView } from "./components/views/DraftsView";
import { HistoryView } from "./components/views/HistoryView";
import { SettingsView } from "./components/views/SettingsView";

const defaultSettings: Settings = {
  persona: {
    role: "Software Engineer",
    tone: "Professional yet conversational",
    industry: "Technology",
  },
  enableSparkIcon: true,
  blacklistedDomains: [],
};

// Demo spark for testing
const createDemoSpark = (): Spark => ({
  id: Math.random().toString(36).substring(2, 15),
  text: "The best engineers I know don't just write code — they understand the business context. They ask 'why' before 'how.' This shift in mindset is what separates good from great.",
  url: "https://medium.com/engineering-leadership/what-makes-great-engineers",
  pageTitle: "What Makes Great Engineers Stand Out",
  domain: "medium.com",
  capturedAt: Date.now(),
});

function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [activeSpark, setActiveSpark] = useState<Spark | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const [loadedSparks, loadedSettings] = await Promise.all([
        storage.getSparks(),
        storage.getSettings(),
      ]);
      setSparks(loadedSparks);
      // Use stored settings
      setSettings(loadedSettings);
    };
    loadData();

    // Listen for messages from background script (context menu captures)
    if (typeof chrome !== "undefined" && chrome.runtime) {
      console.log(
        "Lumina: Listening for messages from background script",
        chrome
      );
      chrome?.runtime?.onMessage?.addListener((message) => {
        if (message.type === "NEW_SPARK") {
          const newSpark: Spark = {
            id: Math.random().toString(36).substring(2, 15),
            text: message.text,
            url: message.url,
            pageTitle: message.pageTitle,
            domain: new URL(message.url).hostname,
            capturedAt: Date.now(),
          };
          setSparks((prev) => [newSpark, ...prev]);
          storage.addSpark(newSpark);
          setActiveSpark(newSpark);
          setCurrentView("drafts");
        }
      });
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const handleNavigate = (view: View) => {
    if (view === "home" || view === "history" || view === "settings") {
      setActiveSpark(null);
    }
    setCurrentView(view);
  };

  const handleSparkClick = (spark: Spark) => {
    setActiveSpark(spark);
    setCurrentView("drafts");
  };

  const handleAddDemo = async () => {
    const demoSpark = createDemoSpark();
    setSparks((prev) => [demoSpark, ...prev]);
    await storage.addSpark(demoSpark);
    showToast("Demo Spark added!");
  };

  const handleUpdateSpark = async (id: string, updates: Partial<Spark>) => {
    setSparks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    await storage.updateSpark(id, updates);

    // Update active spark if it's the one being updated
    if (activeSpark?.id === id) {
      setActiveSpark((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleDeleteSpark = async (id: string) => {
    setSparks((prev) => prev.filter((s) => s.id !== id));
    await storage.removeSpark(id);
    showToast("Spark deleted");
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
    showToast("Settings saved!");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  };

  const handleSendToLinkedIn = (text: string) => {
    // Open LinkedIn with the text
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true`;

    if (typeof chrome !== "undefined" && chrome.tabs) {
      // In extension context, open new tab and inject text
      chrome.tabs.create({ url: linkedInUrl }, (tab) => {
        if (tab.id) {
          // Store the text to inject
          chrome.storage.local.set({ pendingPost: text });
        }
      });
    } else {
      // In dev mode, just copy and open LinkedIn
      navigator.clipboard.writeText(text);
      window.open(linkedInUrl, "_blank");
      showToast("Text copied! Paste it in LinkedIn.");
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "home":
        return (
          <HomeView
            sparks={sparks}
            onSparkClick={handleSparkClick}
            onAddDemo={handleAddDemo}
          />
        );
      case "drafts":
        return activeSpark ? (
          <DraftsView
            spark={activeSpark}
            settings={settings}
            onBack={() => handleNavigate("home")}
            onUpdateSpark={handleUpdateSpark}
            onDeleteSpark={handleDeleteSpark}
            onCopy={handleCopy}
            onSendToLinkedIn={handleSendToLinkedIn}
          />
        ) : (
          <HomeView
            sparks={sparks}
            onSparkClick={handleSparkClick}
            onAddDemo={handleAddDemo}
          />
        );
      case "history":
        return (
          <HistoryView
            sparks={sparks}
            onSparkClick={handleSparkClick}
            onBack={() => handleNavigate("home")}
          />
        );
      case "settings":
        return (
          <SettingsView
            settings={settings}
            onSave={handleSaveSettings}
            onBack={() => handleNavigate("home")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      <main className="main">{renderView()}</main>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast--visible toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
