document.addEventListener('DOMContentLoaded', function() {
    const outputArea = document.getElementById('outputArea');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const videoHeader = document.getElementById('videoHeader');
    const videoDetails = document.getElementById('videoDetails');

    // Only show the summary if present
    chrome.storage.local.get(['summary'], function(result) {
        if (result.summary) {
            // Try to extract bullet points and render as <ul>
            let summary = result.summary;
            let bulletPoints = [];
            // Match lines starting with a bullet or dash
            summary.split(/\r?\n/).forEach(line => {
                if (/^\s*[-•\u2022]/.test(line)) {
                    bulletPoints.push(line.replace(/^\s*[-•\u2022]\s*/, ''));
                }
            });
            let summaryHtml = '';
            if (bulletPoints.length > 0) {
                summaryHtml = '<ul style="font-size:1.2em;line-height:2;">' + bulletPoints.map(pt => `<li>${pt}</li>`).join('') + '</ul>';
            } else {
                summaryHtml = '<div style="font-size:1.2em;line-height:2;">' + marked.parse(summary) + '</div>';
            }
            outputArea.innerHTML =
                '<div style="background:#e3f0ff;padding:24px 32px 32px 32px;border-radius:18px;box-shadow:0 2px 12px #0001;">' +
                '<h2 style="color:#1976d2;font-size:2em;margin-bottom:18px;">Summary (in English, point-wise):</h2>' +
                summaryHtml +
                '</div>';
            outputArea.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
            errorDiv.classList.add('hidden');
            chrome.storage.local.remove(['summary']);
            return;
        }
        // ... existing summary display logic ...
        async function showLoading() {
            outputArea.classList.add('hidden');
            videoHeader.classList.add('hidden');
            loadingDiv.classList.remove('hidden');
            errorDiv.classList.add('hidden');
        }

        function showError(message) {
            outputArea.classList.add('hidden');
            videoHeader.classList.add('hidden');
            loadingDiv.classList.add('hidden');
            errorDiv.classList.remove('hidden');
            if (message) {
                errorDiv.querySelector('p').textContent = message;
            }
        }

        function showOutput(summary) {
            outputArea.innerHTML = marked.parse(summary);
            outputArea.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
            errorDiv.classList.add('hidden');
        }

        function showVideoInfo(videoInfo) {
            videoDetails.innerHTML = `
                <p><strong>Title:</strong> ${videoInfo.title}</p>
                <p><strong>Channel:</strong> ${videoInfo.channel}</p>
                <p><strong>Duration:</strong> ${videoInfo.duration}</p>
            `;
            videoHeader.classList.remove('hidden');
        }

        async function displaySummary() {
            showLoading();
            
            chrome.storage.local.get(['youtubeData', 'summary'], function(result) {
                if (!result.youtubeData || !result.summary) {
                    showError('No summary data found. Please extract a YouTube video first.');
                    return;
                }

                const { videoInfo, captions } = result.youtubeData;
                const summary = result.summary;

                // Show video information
                showVideoInfo(videoInfo);

                // Display the summary
                showOutput(summary);
            });
        }

        // Auto-display summary on page load
        displaySummary();
    });
}); 