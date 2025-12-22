// Lumina Background Service Worker
// Handles context menu and communication between content scripts and popup

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "lumina-capture",
    title: "Capture with Lumina ✨",
    contexts: ["selection"],
  });

  console.log("Lumina: Context menu created");
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "lumina-capture" && info.selectionText && tab?.id) {
    const spark = {
      type: "NEW_SPARK",
      text: info.selectionText,
      url: tab.url || "",
      pageTitle: tab.title || "Untitled Page",
    };

    // Store the spark data
    const sparks =
      (await chrome.storage.local.get("lumina_sparks")).lumina_sparks || [];
    const newSpark = {
      id: Math.random().toString(36).substring(2, 15),
      text: spark.text,
      url: spark.url,
      pageTitle: spark.pageTitle,
      domain: new URL(spark.url).hostname,
      capturedAt: Date.now(),
    };

    sparks.unshift(newSpark);
    await chrome.storage.local.set({ lumina_sparks: sparks });

    // Show notification
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#6366f1" });

    // Clear badge after 3 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 3000);

    console.log("Lumina: Spark captured!", newSpark);
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURE_SELECTION") {
    // Forward to popup if open
    chrome.runtime.sendMessage({
      type: "NEW_SPARK",
      ...message.data,
    });
    sendResponse({ success: true });
  }
  return true;
});
