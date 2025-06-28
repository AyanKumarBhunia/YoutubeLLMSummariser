// Content script for YouTube video extraction
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVideoInfo') {
        const videoInfo = extractVideoInfo();
        sendResponse({ success: true, data: videoInfo });
        return true;
    }
    
    if (request.action === 'extractYouTubeData') {
        extractYouTubeData()
            .then(data => {
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                console.error('YouTube data extraction error:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep the message channel open for async response
    }
});

function extractVideoInfo() {
    const title = document.querySelector('h1.ytd-video-primary-info-renderer, h1.title, .title h1')?.textContent?.trim() || 'Unknown Title';
    const channel = document.querySelector('#channel-name a, .ytd-channel-name a, .ytd-video-owner-renderer a')?.textContent?.trim() || 'Unknown Channel';
    const duration = document.querySelector('.ytp-time-duration')?.textContent?.trim() || 'Unknown Duration';
    
    return { title, channel, duration };
}

async function extractYouTubeData() {
    const videoInfo = extractVideoInfo();
    const captions = await extractCaptions();
    
    return { videoInfo, captions };
}

async function extractCaptions() {
    // Method 1: Try to get captions from the YouTube player
    let captions = await tryGetPlayerCaptions();
    
    // Method 2: If no captions found, try to get from transcript panel
    if (!captions) {
        captions = await tryGetTranscriptPanel();
    }
    
    // Method 3: Try to get from auto-generated captions
    if (!captions) {
        captions = await tryGetAutoCaptions();
    }
    
    if (!captions) {
        throw new Error('No captions or transcript found for this video. Please enable captions/subtitles on the video.');
    }
    
    return captions;
}

async function tryGetPlayerCaptions() {
    try {
        // Look for caption tracks in the video player
        const video = document.querySelector('video');
        if (!video) return null;
        
        // Check if there are any text tracks
        if (video.textTracks && video.textTracks.length > 0) {
            const track = video.textTracks[0];
            if (track.cues && track.cues.length > 0) {
                let captions = '';
                for (let i = 0; i < track.cues.length; i++) {
                    const cue = track.cues[i];
                    captions += cue.text + ' ';
                }
                return captions.trim();
            }
        }
        
        return null;
    } catch (error) {
        console.log('Player captions extraction failed:', error);
        return null;
    }
}

async function tryGetTranscriptPanel() {
    try {
        // Click on "Show transcript" button if it exists
        const transcriptButton = document.querySelector('button[aria-label*="transcript"], button[aria-label*="Transcript"], .ytd-transcript-segment-renderer');
        if (transcriptButton) {
            transcriptButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Look for transcript segments
        const transcriptSegments = document.querySelectorAll('.ytd-transcript-segment-renderer, .ytd-transcript-body-renderer .segment-text');
        if (transcriptSegments.length > 0) {
            let captions = '';
            transcriptSegments.forEach(segment => {
                const text = segment.textContent?.trim();
                if (text) captions += text + ' ';
            });
            return captions.trim();
        }
        
        return null;
    } catch (error) {
        console.log('Transcript panel extraction failed:', error);
        return null;
    }
}

async function tryGetAutoCaptions() {
    try {
        // Try to find auto-generated captions in the page
        const captionElements = document.querySelectorAll('[data-caption-target], .ytp-caption-segment, .ytp-caption-window-container');
        if (captionElements.length > 0) {
            let captions = '';
            captionElements.forEach(element => {
                const text = element.textContent?.trim();
                if (text) captions += text + ' ';
            });
            return captions.trim();
        }
        
        return null;
    } catch (error) {
        console.log('Auto captions extraction failed:', error);
        return null;
    }
}

// Alternative method: Try to extract from page content if captions are not available
function extractFromPageContent() {
    try {
        // Look for description and comments that might contain content information
        const description = document.querySelector('#description, .ytd-video-secondary-info-renderer #description')?.textContent?.trim() || '';
        const comments = Array.from(document.querySelectorAll('.ytd-comment-thread-renderer .ytd-expander')).slice(0, 5).map(el => el.textContent?.trim()).join(' ');
        
        return (description + ' ' + comments).trim();
    } catch (error) {
        console.log('Page content extraction failed:', error);
        return '';
    }
} 