document.addEventListener('DOMContentLoaded', function() {
    const extractLeetCodeBtn = document.getElementById('extractLeetCodeBtn');
    const outputArea = document.getElementById('outputArea');

    extractLeetCodeBtn.addEventListener('click', async function() {
        try {
            showLoading();
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.tabs.sendMessage(tab.id, { action: 'extractLeetCodeProblem' }, async (response) => {
                if (response && response.success) {
                    // Download the extracted JSON
                    const jsonString = JSON.stringify(response.data, null, 2);
                    downloadLeetCodeJson(jsonString);
                    // Save problem and code to chrome.storage.local
                    chrome.storage.local.set({ leetcodeProblem: response.data }, function() {
                        // Open fullpage.html in a new tab
                        chrome.tabs.create({ url: chrome.runtime.getURL('fullpage.html') });
                    });
                } else {
                    showError();
                }
            });
        } catch (error) {
            console.error('Error extracting LeetCode problem:', error);
            showError();
        }
    });

    async function getOllamaResponse(problem, code) {
        const prompt = `Given this LeetCode problem and code, provide relevant background knowledge and hints to solve it (do not give the code solution):\n\n${problem}\n\n${code}`;
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
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
            const data = await response.json();
            console.log('Ollama raw response:', data); // Debug log
            return data.response || 'No response from Ollama.';
        } catch (err) {
            return 'Error calling Ollama: ' + err.message;
        }
    }

    function showLoading() {
        hideAllExceptOutput();
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) loadingDiv.classList.remove('hidden');
    }

    function showError() {
        hideAllExceptOutput();
        const errorDiv = document.getElementById('error');
        if (errorDiv) errorDiv.classList.remove('hidden');
    }

    function hideAllExceptOutput() {
        const loadingDiv = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (errorDiv) errorDiv.classList.add('hidden');
    }

    function downloadLeetCodeJson(jsonString) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `leetcode-problem-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}); 