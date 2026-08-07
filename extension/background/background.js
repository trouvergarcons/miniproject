// API Config
const API_URL = 'http://localhost:3000'; // Target Next.js backend

// Install / Update logic
chrome.runtime.onInstalled.addListener(() => {
    // Create Context Menu
    chrome.contextMenus.create({
        id: "checkWithVerasity",
        title: "Check page with Verasity",
        contexts: ["page", "selection"]
    });
    console.log("Verasity background worker initialized.");
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "checkWithVerasity") {

        // Check for API Key
        const { verasityApiKey } = await chrome.storage.sync.get('verasityApiKey');
        if (!verasityApiKey) {
            // In MVP, we can alert via script injection
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => alert('Please set your Verasity API Token in the extension popup.')
            });
            return;
        }

        const contentToCheck = info.selectionText || tab.url; // Use selection if available, else page URL

        // Inject loading state
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Simple loading UI
                let loading = document.createElement('div');
                loading.id = 'verasity-global-loading';
                loading.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;background:#18181b;color:#f8fafc;padding:12px 24px;border-radius:999px;box-shadow:0 0 0 2px #3b82f6,0 0 20px rgba(59,130,246,0.4);animation:pulse 2s infinite;font-family:-apple-system,sans-serif;font-size:14px;';
                loading.innerText = 'Verasity is scanning the page...';
                document.body.appendChild(loading);
            }
        });

        try {
            const result = await performCheck(contentToCheck, verasityApiKey, tab.url);

            // Inject results
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (data) => {
                    const loading = document.getElementById('verasity-global-loading');
                    if (loading) loading.remove();

                    // Let's reuse the robust results panel style injected via content script CSS
                    let verdictColor = '#a1a1aa';
                    if (data.verdict.toLowerCase() === 'true') verdictColor = '#10b981';
                    if (data.verdict.toLowerCase() === 'false') verdictColor = '#ef4444';
                    if (data.verdict.toLowerCase() === 'inconclusive') verdictColor = '#f59e0b';

                    let panel = document.createElement('div');
                    panel.className = 'verasity-results-panel';
                    panel.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;min-width:300px;max-width:400px;';

                    panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:16px;">
              <strong style="color: ${verdictColor}">${data.verdict.toUpperCase()}</strong>
              <span>Confidence: ${Math.round(data.confidence * 100)}%</span>
            </div>
            <div style="color:#d4d4d8;line-height:1.5;margin-bottom:12px;">${data.summary}</div>
            <div style="font-size:12px;">
              <strong>Sources:</strong>
              <ul style="list-style:none;padding-left:0;margin-top:4px;">
                ${data.sources.slice(0, 3).map(s => `<li><a href="${s.url}" target="_blank" style="color:#3b82f6;text-decoration:none;">${s.title || s.url}</a></li>`).join('')}
              </ul>
            </div>
            <button onclick="this.parentElement.remove()" style="margin-top:12px;width:100%;padding:8px;background:#f8fafc;color:#09090b;border:none;border-radius:6px;cursor:pointer;font-weight:500;">Close</button>
          `;
                    document.body.appendChild(panel);
                },
                args: [result]
            });

        } catch (error) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (msg) => {
                    const loading = document.getElementById('verasity-global-loading');
                    if (loading) loading.remove();
                    alert(`Verasity Error: ${msg}`);
                },
                args: [error.message]
            });
        }
    }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'VERIFY_CLAIM') {
        // Return true to indicate we will send response asynchronously
        performCheck(request.payload.text, request.payload.token, request.payload.url, request.payload.image)
            .then(data => sendResponse({ data }))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
});

// The core fetch function to our Next.js backend
async function performCheck(text, token, sourceUrl, image) {
    try {
        const { verasityServerUrl } = await chrome.storage.sync.get('verasityServerUrl');
        const apiUrl = verasityServerUrl || API_URL;

        const response = await fetch(`${apiUrl}/api/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Custom auth header utilizing API token
            },
            body: JSON.stringify({
                content: text,
                source_url: sourceUrl,
                image: image
            })
        });

        if (!response.ok) {
            let errorMsg = `Server responded with ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error) errorMsg = errorData.error;
            } catch (e) {
                if (response.status === 401) errorMsg = "Invalid API Token.";
                if (response.status === 429) errorMsg = "Rate limit exceeded. Try again later.";
            }
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (err) {
        if (err.message.includes('Failed to fetch')) {
            throw new Error('Could not connect to Verasity server. Is the local backend running on port 3000?');
        }
        throw err;
    }
}
