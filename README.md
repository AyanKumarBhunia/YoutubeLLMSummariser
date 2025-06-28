# YouTube Summarizer Chrome Extension

A Chrome extension that extracts YouTube video captions/subtitles and generates AI-powered summaries using Ollama.

## Features

- 🎬 **YouTube Video Extraction**: Automatically extracts video information (title, channel, duration)
- 📝 **Caption Extraction**: Extracts captions/subtitles from YouTube videos
- 🤖 **AI Summarization**: Generates comprehensive summaries using Ollama
- 📱 **Beautiful UI**: Modern, responsive interface with YouTube-themed design
- 🔄 **Real-time Processing**: Instant extraction and summarization
- 📄 **Full-page Display**: View summaries in a dedicated full-page interface

## Prerequisites

1. **Ollama**: You need to have Ollama installed and running locally
   - Download from: https://ollama.ai/
   - Install and run: `ollama serve`
   - Pull the model: `ollama pull llama3.2`

2. **Chrome Browser**: This extension works with Chrome and Chromium-based browsers

## Installation

1. **Clone or Download**: Get the extension files
2. **Load Extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the folder containing the extension files

## Usage

1. **Navigate to YouTube**: Go to any YouTube video page
2. **Open Extension**: Click the YouTube Summarizer extension icon in your browser toolbar
3. **Extract & Summarize**: Click the "Extract & Summarize" button
4. **View Summary**: The summary will open in a new tab with a beautiful, formatted display

## How It Works

### Caption Extraction Methods

The extension tries multiple methods to extract captions:

1. **Player Captions**: Extracts from the video player's text tracks
2. **Transcript Panel**: Opens the transcript panel and extracts text
3. **Auto-generated Captions**: Looks for auto-generated caption elements
4. **Fallback**: Uses video description and comments if captions aren't available

### AI Summarization

The extension sends the extracted captions to Ollama with a structured prompt that requests:
- Concise summary (2-3 paragraphs)
- Key points and main topics
- Important insights and takeaways
- Overall tone and style analysis

## File Structure

```
YouTubeSummarise/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── popup.css             # Styling for popup
├── content.js            # YouTube page content extraction
├── background.js         # Background service worker
├── fullpage.html         # Full-page summary display
├── fullpage.js           # Full-page functionality
├── marked.min.js         # Markdown parser
├── icons/                # Extension icons
└── README.md             # This file
```

## Configuration

### Ollama Settings

The extension connects to Ollama at `http://localhost:11434`. If you need to change this:

1. Edit `popup.js` and `fullpage.js`
2. Update the fetch URL in the `generateSummary` function
3. Make sure Ollama is running on your specified port

### Model Selection

The extension uses `llama3.2` by default. To use a different model:

1. Pull your preferred model: `ollama pull <model-name>`
2. Update the `model` parameter in the fetch requests in `popup.js`

## Troubleshooting

### Common Issues

1. **"No captions found"**
   - Make sure the video has captions/subtitles enabled
   - Try enabling auto-generated captions on the video
   - Some videos may not have captions available

2. **"Failed to generate summary"**
   - Ensure Ollama is running: `ollama serve`
   - Check if the model is installed: `ollama list`
   - Verify the model name in the code matches your installed model

3. **Extension not working on YouTube**
   - Make sure you're on a YouTube video page (URL contains `youtube.com/watch`)
   - Check that the extension has the correct permissions
   - Try refreshing the page and reloading the extension

### Debug Mode

To enable debug logging:
1. Open Chrome DevTools
2. Go to the Console tab
3. Look for messages from the extension

## Development

### Adding New Features

1. **New Caption Sources**: Add methods to `content.js`
2. **UI Improvements**: Modify `popup.html` and `popup.css`
3. **Summary Format**: Update the prompt in `popup.js`

### Testing

1. Load the extension in developer mode
2. Navigate to various YouTube videos
3. Test with videos that have different caption types
4. Verify Ollama integration works correctly

## Privacy & Security

- **Local Processing**: All AI processing happens locally via Ollama
- **No Data Collection**: The extension doesn't collect or transmit any data
- **YouTube Terms**: Ensure compliance with YouTube's terms of service
- **Caption Usage**: Only extracts publicly available captions/subtitles

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension.

## License

This project is open source. Please check the license file for details.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are met
3. Verify Ollama is running correctly
4. Check the browser console for error messages

## Recent Changes and Fixes

### CORS Handling
- Implemented a Python proxy (`ollama_proxy.py`) to handle CORS issues by forwarding requests to Ollama.

### DOM Error Fix
- Resolved the "Cannot read properties of undefined" error by adding a null check for missing DOM elements.

### Debugging Enhancements
- Updated the extension to display the first 10 lines of captions in a new tab (`fullpage.html`) for debugging purposes.

### Script Updates
- Modified the `start_ollama.sh` script to run both Ollama and the proxy in a tmux session, ensuring the correct Python environment is used. 