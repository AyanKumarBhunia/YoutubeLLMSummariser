#!/bin/bash

# YouTube Summarizer - Ollama Startup Script with Proxy
SESSION_NAME="ollama-session"
OLLAMA_CMD="ollama serve"
PROXY_CMD="/opt/miniconda3/envs/ayanLLM/bin/python ollama_proxy.py"
PROXY_WINDOW="proxy"

echo "🎬 Starting Ollama and Python proxy for YouTube Summarizer..."

# Check for tmux
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed. Please install it first."
    exit 1
fi

# Check for Ollama
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install it first."
    exit 1
fi

# Check for Python
if [ ! -x "/opt/miniconda3/envs/ayanLLM/bin/python" ]; then
    echo "❌ Python at /opt/miniconda3/envs/ayanLLM/bin/python is not executable or not found."
    exit 1
fi

# Check for Flask
if ! /opt/miniconda3/envs/ayanLLM/bin/python -c 'import flask, flask_cors' 2>/dev/null; then
    echo "❌ Flask or flask_cors is not installed in the ayanLLM environment. Run:"
    echo "   /opt/miniconda3/envs/ayanLLM/bin/pip install flask flask-cors requests"
    exit 1
fi

# Start tmux session if not exists
if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "🚀 Creating new tmux session and starting Ollama..."
    tmux new-session -d -s $SESSION_NAME -n ollama "$OLLAMA_CMD"
else
    echo "⚠️  Ollama session already exists."
fi

# Start proxy in a new tmux window
if ! tmux list-windows -t $SESSION_NAME | grep -q $PROXY_WINDOW; then
    echo "🚀 Starting Python proxy in tmux window '$PROXY_WINDOW'..."
    tmux new-window -t $SESSION_NAME -n $PROXY_WINDOW "$PROXY_CMD"
else
    echo "⚠️  Proxy window already exists in tmux session."
fi

echo "⏳ Waiting for services to start..."
sleep 3

# Check Ollama
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running!"
else
    echo "❌ Ollama did not start correctly."
fi

# Check Proxy
if curl -s http://localhost:3002/ollama -X POST -H "Content-Type: application/json" -d '{"model":"llama3.2","prompt":"Hello","stream":false}' | grep -q response; then
    echo "✅ Python proxy is running!"
else
    echo "❌ Python proxy did not start correctly."
fi

echo "🎯 Both Ollama and the proxy are ready!"
echo "   Attach to tmux: tmux attach-session -t $SESSION_NAME"

chmod +x start_ollama.sh 