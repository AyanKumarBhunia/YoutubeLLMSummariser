document.addEventListener('DOMContentLoaded', function() {
    const extractYouTubeBtn = document.getElementById('extractYouTubeBtn');
    const outputArea = document.getElementById('outputArea');
    const videoInfo = document.getElementById('videoInfo');
    const videoDetails = document.getElementById('videoDetails');

    // Check if we're on a YouTube page
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentTab = tabs[0];
        if (!currentTab.url.includes('youtube.com/watch')) {
            extractYouTubeBtn.disabled = true;
            extractYouTubeBtn.textContent = 'Not a YouTube video page';
            return;
        }
        
        // Show video info if available
        chrome.tabs.sendMessage(currentTab.id, { action: 'getVideoInfo' }, function(response) {
            if (response && response.success) {
                showVideoInfo(response.data);
            }
        });
    });

    extractYouTubeBtn.addEventListener('click', async function() {
        try {
            showLoading();
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.tabs.sendMessage(tab.id, { action: 'extractYouTubeData' }, async (response) => {
                if (chrome.runtime.lastError) {
                    showError('This extension only works on YouTube video pages.');
                    return;
                }
                if (response && response.success) {
                    const { videoInfo, captions } = response.data;
                    // Use the full captions
                    const lines = captions;
                    // Build the prompt for Ollama
                    const prompt = `Give a short, concise, point-wise summary (not in-depth) of the following transcript in English, regardless of the original language.\n\nTranscript:\n${lines}`;
                    // Call Ollama via the proxy
                    try {
                        const ollamaResponse = await fetch('http://localhost:3002/ollama', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                model: 'llama3.2',
                                prompt: prompt,
                                stream: false
                            })
                        });
                        if (!ollamaResponse.ok) {
                            throw new Error(`HTTP error! status: ${ollamaResponse.status}`);
                        }
                        const data = await ollamaResponse.json();
                        const summary = data.response || 'No summary generated.';
                        chrome.storage.local.set({ summary: summary }, function() {
                            chrome.tabs.create({ url: chrome.runtime.getURL('fullpage.html') });
                        });
                    } catch (error) {
                        showError('Failed to generate summary. Make sure Ollama is running on localhost:3002');
                    }
                    return;
                } else {
                    showError('Failed to extract video data. Make sure you\'re on a YouTube video page with captions available.');
                }
            });
        } catch (error) {
            console.error('Error extracting YouTube data:', error);
            showError('Error processing video');
        }
    });

    async function generateSummary(videoInfo, captions) {
        try {
            const prompt = `Please provide a comprehensive summary of this YouTube video based on its captions:

Video Title: ${videoInfo.title}
Channel: ${videoInfo.channel}
Duration: ${videoInfo.duration}

Captions:
${captions}

Please provide:
1. A concise summary (2-3 paragraphs)
2. Key points and main topics discussed
3. Important insights or takeaways
4. Overall tone and style of the content

Format the response in a clear, structured way.`;

            // Use background script to make the API call to avoid CORS issues
            chrome.runtime.sendMessage({
                action: 'callOllama',
                data: {
                    model: 'llama3.2',
                    prompt: prompt,
                    stream: false
                }
            }, function(response) {
                if (response && response.success) {
                    const summary = response.data.response || 'No summary generated.';
                    
                    // Save summary to storage
                    chrome.storage.local.set({ 
                        summary: summary,
                        summaryTimestamp: Date.now()
                    }, function() {
                        // Open fullpage.html in a new tab to display the summary
                        chrome.tabs.create({ url: chrome.runtime.getURL('fullpage.html') });
                    });
                } else {
                    showError('Failed to generate summary. Make sure Ollama is running on localhost:11434');
                }
            });

        } catch (error) {
            console.error('Error generating summary:', error);
            showError('Failed to generate summary. Make sure Ollama is running on localhost:11434');
        }
    }

    function showVideoInfo(videoInfoData) {
        const videoInfo = document.getElementById('videoInfo');
        const videoDetails = document.getElementById('videoDetails');
        if (videoDetails && videoInfoData) {
            videoDetails.innerHTML = `
                <p><strong>Title:</strong> ${videoInfoData.title}</p>
                <p><strong>Channel:</strong> ${videoInfoData.channel}</p>
                <p><strong>Duration:</strong> ${videoInfoData.duration}</p>
            `;
        }
        if (videoInfo) {
            videoInfo.classList.remove('hidden');
        }
    }

    function showLoading() {
        hideAllExceptOutput();
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) loadingDiv.classList.remove('hidden');
    }

    function showError(message) {
        hideAllExceptOutput();
        const errorDiv = document.getElementById('error');
        if (errorDiv) {
            errorDiv.querySelector('p').textContent = message || '❌ Something went wrong. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    }

    function hideAllExceptOutput() {
        const loadingDiv = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (errorDiv) errorDiv.classList.add('hidden');
    }
}); 