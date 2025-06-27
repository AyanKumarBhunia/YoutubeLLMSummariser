document.addEventListener('DOMContentLoaded', function() {
    const outputArea = document.getElementById('outputArea');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const analyseBtn = document.getElementById('extractLeetCodeBtn');

    async function showLoading() {
        outputArea.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
    }
    function showError() {
        outputArea.classList.add('hidden');
        loadingDiv.classList.add('hidden');
        errorDiv.classList.remove('hidden');
    }
    function showOutput(text) {
        outputArea.innerHTML = marked.parse(text);
        outputArea.classList.remove('hidden');
        loadingDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
    }

    async function getOllamaResponse(problem, code) {
        const prompt = `I'm working on a LeetCode problem. Please act like NeetCode and help me understand:
- The key concepts needed to solve it
- Common patterns or techniques involved
- Any edge cases I should watch out for
Don't give me the full solution yet—just guide me through the thinking process like a mentor.

Here is the problem statement:
${problem}

Here is the code attempt:
${code}`;
        try {
            const response = await fetch('http://localhost:3002/ollama', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3.2',
                    prompt: prompt,
                    stream: false,
                    num_predict: 2048
                })
            });
            const data = await response.json();
            console.log('Ollama raw response:', data);
            return data.response || 'No response from Ollama.';
        } catch (err) {
            return 'Error calling Ollama: ' + err.message;
        }
    }

    async function analyse() {
        showLoading();
        chrome.storage.local.get(['leetcodeProblem'], async function(result) {
            const data = result.leetcodeProblem;
            if (!data) {
                showError();
                return;
            }
            const ollamaOutput = await getOllamaResponse(data['problem statement'], data['code']);
            showOutput(ollamaOutput);
        });
    }

    analyseBtn.addEventListener('click', analyse);
    // Optionally, auto-analyse on load:
    analyse();
}); 