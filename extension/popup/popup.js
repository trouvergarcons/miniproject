document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const serverUrlInput = document.getElementById('serverUrl');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load existing API key and Server URL
  chrome.storage.sync.get(['verasityApiKey', 'verasityServerUrl'], (result) => {
    if (result.verasityApiKey) {
      apiKeyInput.value = result.verasityApiKey;
    }
    if (result.verasityServerUrl) {
      serverUrlInput.value = result.verasityServerUrl;
    }
  });

  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    let serverUrl = serverUrlInput.value.trim();
    if (!apiKey) {
      statusDiv.textContent = 'Please enter an API Token.';
      statusDiv.className = 'error';
      return;
    }

    if (serverUrl && serverUrl.endsWith('/')) {
      serverUrl = serverUrl.slice(0, -1);
    }

    chrome.storage.sync.set({ verasityApiKey: apiKey, verasityServerUrl: serverUrl }, () => {
      statusDiv.textContent = 'Configuration saved successfully!';
      statusDiv.className = 'success';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 3000);
    });
  });
});
