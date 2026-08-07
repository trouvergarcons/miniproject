// CSS is injected via manifest.json content_scripts

console.log("Verasity content script loaded");

// Detect platform
const hostname = window.location.hostname;
let platform = 'generic';
if (hostname.includes('reddit.com')) platform = 'reddit';
else if (hostname.includes('facebook.com')) platform = 'facebook';
else if (hostname.includes('instagram.com')) platform = 'instagram';

// Function to inject "Check" button
function injectVerificationButton() {
    if (platform === 'generic') return; // For generic pages, we use context menu instead

    // Basic MVP selector for identifying posts
    const postSelectors = {
        reddit: 'shreddit-post', // Modern reddit web component
        facebook: '[role="article"]',
        instagram: 'article'
    };

    const selector = postSelectors[platform];
    if (!selector) return;

    const posts = document.querySelectorAll(selector);

    posts.forEach(post => {
        // Avoid double injection
        if (post.dataset.verasityInjected) return;
        post.dataset.verasityInjected = "true";

        const btnContainer = document.createElement('div');
        btnContainer.className = 'verasity-action-bar-item';

        const btn = document.createElement('button');
        btn.className = 'verasity-check-btn';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg> Verify`;

        // Add click handler
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await handleCheck(post, btn);
        });

        // Reddit-specific placement
        if (platform === 'reddit') {
            btnContainer.style.display = 'inline-flex';
            btnContainer.style.alignItems = 'center';
            btnContainer.style.marginLeft = '8px';
            btnContainer.appendChild(btn);

            const actionBar = post.querySelector('shreddit-async-action-bar') ||
                post.querySelector('shreddit-post-action-bar') ||
                post.querySelector('[slot="action-bar"]') ||
                post.querySelector('[slot="action-bar-control-container"]');

            if (actionBar) {
                actionBar.appendChild(btnContainer);
            } else {
                post.appendChild(btnContainer);
            }
        } else if (platform === 'instagram') {
            btnContainer.style.display = 'inline-block';
            btnContainer.style.marginTop = '8px';
            btnContainer.style.marginBottom = '8px';
            btnContainer.style.marginLeft = '16px';
            btnContainer.appendChild(btn);

            // Try to find the action bar (where like, comment, share buttons are)
            const actionBars = Array.from(post.querySelectorAll('section'));
            const actionBar = actionBars.find(s => s.querySelector('svg'));

            if (actionBar) {
                actionBar.appendChild(btnContainer);
            } else {
                post.appendChild(btnContainer);
            }
        } else {
            btnContainer.appendChild(btn);
            post.appendChild(btnContainer);
        }
    });
}

async function handleCheck(postElement, btnElement) {
    // 1. Show scanning animation on post
    postElement.classList.add('verasity-scanning-active');
    btnElement.disabled = true;
    btnElement.innerHTML = 'Scanning...';

    try {
        let content = postElement.innerText;
        let postUrl = window.location.href;
        let imageUrl = null;

        if (platform === 'reddit') {
            const title = postElement.getAttribute('post-title') || '';
            let linkUrl = postElement.getAttribute('content-href') || postElement.getAttribute('permalink') || '';
            const textContent = postElement.querySelector('div[slot="text-body"]')?.innerText || '';

            content = `${title}\n${textContent}`.trim();
            if (linkUrl) {
                postUrl = linkUrl.startsWith('http') ? linkUrl : `https://www.reddit.com${linkUrl}`;
            }

            // Attempt to grab image from post. Avoid UI elements like logos.
            const mediaContainer = postElement.querySelector('[slot="post-media-container"]') || postElement;
            const imgEls = Array.from(mediaContainer.querySelectorAll('img'));

            // Filter out obvious tracking/UI pixels and logos
            const mainImg = imgEls.find(img => {
                const src = img.src.toLowerCase();
                return src.startsWith('http') &&
                    !src.includes('avatar') &&
                    !src.includes('award') &&
                    !src.includes('logo') &&
                    !src.includes('favicon') &&
                    !src.includes('icon') &&
                    img.width !== 1 && img.height !== 1; // ignore tracking pixels
            });

            if (mainImg) {
                imageUrl = mainImg.src;
            } else if (postElement.getAttribute('content-href')?.match(/\.(jpeg|jpg|gif|png)$/i)) {
                // Sometimes the content-href is a direct image link
                imageUrl = postElement.getAttribute('content-href');
            }
        } else if (platform === 'instagram') {
            // Attempt to grab image from post.
            const imgEls = Array.from(postElement.querySelectorAll('img'));

            // Filter out profile pics and small UI elements
            const mainImg = imgEls.find(img => {
                const src = img.src.toLowerCase();
                const alt = (img.alt || '').toLowerCase();
                return src.startsWith('http') &&
                    !alt.includes('profile picture') &&
                    img.clientWidth > 100 && img.clientHeight > 100;
            });

            if (mainImg) {
                imageUrl = mainImg.src;
            }

            // Attempt to grab post URL if we are in feed
            const linkEls = Array.from(postElement.querySelectorAll('a'));
            const postLink = linkEls.find(a => a.href.includes('/p/') || a.href.includes('/reel/'));
            if (postLink) {
                postUrl = postLink.href.startsWith('http') ? postLink.href : `https://www.instagram.com${postLink.href}`;
            }

            content = postElement.innerText; // Fallback to innerText, captures caption
        }

        // 3. Get API Key
        const { verasityApiKey } = await chrome.storage.sync.get('verasityApiKey');
        if (!verasityApiKey) {
            throw new Error('Please set your Verasity API Token in the extension popup.');
        }

        // 4. Call Background script to hit Next.js Backend
        const response = await chrome.runtime.sendMessage({
            type: 'VERIFY_CLAIM',
            payload: {
                text: content || 'Analyze this provided image',
                token: verasityApiKey,
                url: postUrl,
                image: imageUrl
            }
        });

        if (response.error) throw new Error(response.error);

        // 5. Show Results panel
        showResultsPanel(postElement, response.data);

    } catch (error) {
        alert(`Verasity Error: ${error.message}`);
        btnElement.innerHTML = 'Retry';
        btnElement.disabled = false;
        postElement.classList.remove('verasity-scanning-active');
        return; // exit early on error
    }

    postElement.classList.remove('verasity-scanning-active');
    btnElement.innerHTML = 'Checked';
}

function showResultsPanel(postElement, data) {
    // Check if panel already exists
    let panel = postElement.querySelector('.verasity-results-panel');
    if (panel) panel.remove();

    panel = document.createElement('div');
    panel.className = `verasity-results-panel verdict-${data.verdict.toLowerCase()}`;

    let verdictColor = '#a1a1aa';
    if (data.verdict.toLowerCase() === 'true') verdictColor = '#10b981';
    if (data.verdict.toLowerCase() === 'false') verdictColor = '#ef4444';
    if (data.verdict.toLowerCase() === 'inconclusive') verdictColor = '#f59e0b';

    panel.innerHTML = `
    <div class="v-header">
      <strong style="color: ${verdictColor}">${data.verdict.toUpperCase()}</strong>
      <span>Confidence: ${Math.round(data.confidence * 100)}%</span>
    </div>
    <div class="v-summary">${data.summary}</div>
    <div class="v-sources">
      <strong>Sources:</strong>
      <ul>
        ${data.sources.slice(0, 3).map(s => `<li><a href="${s.url}" target="_blank">${s.title || s.url}</a></li>`).join('')}
      </ul>
    </div>
  `;

    postElement.appendChild(panel);
}

// Run injection periodically for SPAs
setInterval(injectVerificationButton, 2000);
injectVerificationButton();
