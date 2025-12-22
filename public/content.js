// Lumina Content Script for LinkedIn
// Handles auto-injection of posts into LinkedIn's composer

(function () {
  "use strict";

  // Check for pending post to inject
  async function checkPendingPost() {
    try {
      const result = await chrome.storage.local.get("pendingPost");
      if (result.pendingPost) {
        // Wait for LinkedIn's post modal to be ready
        await waitForElement(".share-box-feed-entry__trigger");

        // Click the "Start a post" button
        const startPostBtn = document.querySelector(
          ".share-box-feed-entry__trigger"
        );
        if (startPostBtn) {
          startPostBtn.click();

          // Wait for the editor to appear
          await waitForElement(".ql-editor");

          // Insert the text
          setTimeout(() => {
            const editor = document.querySelector(".ql-editor");
            if (editor) {
              editor.focus();
              document.execCommand("insertText", false, result.pendingPost);

              // Clear the pending post
              chrome.storage.local.remove("pendingPost");

              console.log("Lumina: Post injected successfully!");
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error("Lumina: Error injecting post", error);
    }
  }

  // Helper to wait for an element to appear
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error("Element not found: " + selector));
      }, timeout);
    });
  }

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkPendingPost);
  } else {
    checkPendingPost();
  }

  // Also check when URL changes (LinkedIn is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(checkPendingPost, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
})();
