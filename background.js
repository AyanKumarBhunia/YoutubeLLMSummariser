// Background service worker for YouTube Summarizer
chrome.runtime.onInstalled.addListener(() => {
    console.log('YouTube Summarizer extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically due to the manifest configuration
    console.log('YouTube Summarizer extension icon clicked');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'log') {
        console.log('Content script log:', request.message);
    }
    return true;
}); 