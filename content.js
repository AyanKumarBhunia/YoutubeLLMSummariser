// Content script for screen capture
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureScreen') {
        captureScreen()
            .then(imageData => {
                sendResponse({ success: true, imageData: imageData });
            })
            .catch(error => {
                console.error('Screen capture error:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep the message channel open for async response
    }
    if (request.action === 'extractPageText') {
        // Extract all visible text from the page
        const bodyText = document.body.innerText || '';
        sendResponse({ success: true, text: bodyText });
        return true;
    }
    if (request.action === 'extractLeetCodeProblem') {
        let problemStatement = '';
        let code = '';
        // Try multiple selectors for the problem statement
        const selectors = [
            '.description__24sA',
            '.question-content__JfgR',
            '.content__u3I1.question-content__JfgR',
            '.description__1bq2',
            '[data-key="description-content"]',
            '.question-description',
            '.content__u3I1',
            '.css-10o4wqw',
            '.problem-content',
            '.content__u3I1',
            'main .content',
            'main'
        ];
        let descElem = null;
        for (const sel of selectors) {
            descElem = document.querySelector(sel);
            if (descElem && descElem.innerText.trim().length > 50) break;
        }
        if (descElem) {
            problemStatement = descElem.innerText.trim();
        }
        // --- New logic: Use all visible text and split at 'Python' ---
        if (!problemStatement || problemStatement.length < 30) {
            let main = document.querySelector('main');
            let allText = '';
            if (main) {
                allText = main.innerText || '';
            } else {
                allText = document.body.innerText || '';
            }
            // Find the first occurrence of 'Python' (case-insensitive)
            const pythonIdx = allText.search(/python/i);
            if (pythonIdx > 0) {
                problemStatement = allText.substring(0, pythonIdx).trim();
            }
        }
        // Try to extract the title and prepend it
        let title = '';
        const titleElem = document.querySelector('h4, h3, .css-v3d350, .css-1jyt9hm, .question-title, .css-1l1z6i7');
        if (titleElem) {
            title = titleElem.innerText.trim();
        }
        if (title && problemStatement && !problemStatement.startsWith(title)) {
            problemStatement = title + '\n\n' + problemStatement;
        }
        // LeetCode code is usually in a textarea or code editor
        const codeElem = document.querySelector('textarea, .view-lines');
        if (codeElem) {
            if (codeElem.tagName.toLowerCase() === 'textarea') {
                code = codeElem.value.trim();
            } else {
                code = Array.from(codeElem.querySelectorAll('div')).map(div => div.innerText).join('\n').trim();
            }
        }
        sendResponse({ success: true, data: { 'problem statement': problemStatement, 'code': code } });
        return true;
    }
});

async function captureScreen() {
    try {
        // Request screen capture permission
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                mediaSource: 'screen',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });
        
        // Get the first video track
        const videoTrack = stream.getVideoTracks()[0];
        
        // Create a canvas to capture the frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create a video element to receive the stream
        const video = document.createElement('video');
        video.srcObject = stream;
        
        return new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                // Set canvas size to match video dimensions
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Draw the video frame to canvas
                ctx.drawImage(video, 0, 0);
                
                // Convert canvas to base64 image data
                const imageData = canvas.toDataURL('image/png');
                
                // Stop all tracks to release the stream
                stream.getTracks().forEach(track => track.stop());
                
                resolve(imageData);
            };
            
            video.onerror = (error) => {
                stream.getTracks().forEach(track => track.stop());
                reject(new Error('Failed to load video stream'));
            };
            
            // Start playing the video to trigger onloadedmetadata
            video.play();
        });
        
    } catch (error) {
        throw new Error('Screen capture failed: ' + error.message);
    }
} 