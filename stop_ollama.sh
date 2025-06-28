#!/bin/bash

# YouTube Summarizer - Ollama Stop Script
# This script stops the Ollama tmux session

SESSION_NAME="ollama-session"

echo "🛑 Stopping Ollama session..."

# Check if session exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "📋 Stopping tmux session: $SESSION_NAME"
    tmux kill-session -t $SESSION_NAME
    
    # Wait a moment for cleanup
    sleep 2
    
    # Check if Ollama is still running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "⚠️  Ollama is still running. You may need to stop it manually:"
        echo "   pkill ollama"
    else
        echo "✅ Ollama session stopped successfully!"
    fi
else
    echo "ℹ️  No Ollama session found with name: $SESSION_NAME"
    echo "   Checking if Ollama is running on port 11434..."
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "⚠️  Ollama is still running. To stop it manually:"
        echo "   pkill ollama"
    else
        echo "✅ Ollama is not running."
    fi
fi 