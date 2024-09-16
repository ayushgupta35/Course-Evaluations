chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startScrape') {
      // Get the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          sendResponse({ error: 'No active tab found.' });
          return;
        }
  
        const tabId = tabs[0].id;
  
        // Inject the content script into the active tab
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ['content.js'],
          },
          () => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
            } else {
              // Send a message to the content script with the course and professor
              chrome.tabs.sendMessage(tabId, { action: 'scrapeData', course: message.course, professor: message.professor }, (response) => {
                if (chrome.runtime.lastError) {
                  sendResponse({ error: chrome.runtime.lastError.message });
                } else {
                  sendResponse(response);
                }
              });
            }
          }
        );
      });
  
      // Return true to indicate that we will send a response asynchronously
      return true;
    }
  });  