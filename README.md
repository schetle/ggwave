# ggwave Web Demo

A modern web-based demonstration of text-over-sound communication using ggwave JavaScript bindings and Web Audio API.

## Overview

This demo allows you to:
- Encode text messages into audio signals
- Transmit data through device speakers
- Capture microphone input and decode incoming messages
- Support multiple ggwave protocols (audible and ultrasound modes)

The demo runs entirely in modern web browsers without any native dependencies.

## Prerequisites

To run this demo locally, you need one of the following:

- **Node.js** ≥ 18 (recommended for development)
- **Python** ≥ 3.8 (lightweight alternative)

## Getting Started

### Option 1: Using Python (Simplest)

1. Navigate to the project directory:
   ```bash
   cd dst/ggwave
   ```

2. Start a local HTTP server:
   ```bash
   python -m http.server 8000
   ```
   or on some systems:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser to:
   ```
   http://localhost:8000
   ```

### Option 2: Using Node.js with http-server

1. Navigate to the project directory:
   ```bash
   cd dst/ggwave
   ```

2. Start http-server (no installation required with npx):
   ```bash
   npx http-server -p 8000
   ```

3. Open your browser to:
   ```
   http://localhost:8000
   ```

### Option 3: Using Vite (Development Mode)

1. Navigate to the project directory:
   ```bash
   cd dst/ggwave
   ```

2. Install Vite as a dev dependency (first time only):
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npx vite
   ```

4. Open your browser to the URL displayed by Vite (typically `http://localhost:5173`)

## Browser Compatibility

This demo works in current versions of:
- Chrome / Edge (Chromium-based browsers)
- Firefox
- Safari (macOS and iOS)

### Important Notes on Microphone Access

- **HTTPS or localhost required**: Most modern browsers require either HTTPS or `localhost` for microphone access via `getUserMedia`
- **User permission**: The browser will prompt for microphone permission when you start listening for messages
- **Testing on devices**: For testing on remote devices or mobile devices on your local network, you may need to set up HTTPS tunnels (e.g., using ngrok or similar tools)

## Project Structure

```
dst/ggwave/
├── index.html          # Main HTML entry point
├── styles.css          # Global styles
├── app.js              # Main application logic
├── audio.js            # Audio handling abstraction
├── ggwave-client.js    # ggwave wrapper
├── lib/
│   └── ggwave.js       # Pre-built ggwave JavaScript bindings
├── README.md           # This file
└── package.json        # Dev dependencies
```

## Technology Stack

- **Language**: JavaScript (ES2020+)
- **Module System**: Native ES6 modules
- **Audio**: Web Audio API
- **Media**: MediaDevices API (getUserMedia)
- **ggwave**: Pre-built JavaScript bindings with WebAssembly

## Development Notes

- No build step required - static files are served as-is
- Uses native ES6 modules with `type="module"` script tags
- No framework dependencies (vanilla JavaScript, CSS, HTML)
- Modular architecture with clear separation of concerns

## Testing

The demo has been tested for:
- Text input validation (empty messages, long messages up to 140 characters)
- Audio output via device speakers
- Multiple protocol support (audible and ultrasound modes)
- Volume control (1-100 range)
- UI state management (idle, sending, error states)
- Cross-browser compatibility (Chrome, Firefox, Safari with webkit prefix support)
- Sample rate handling (automatically adapts to browser's supported sample rate)

### Known Behaviors

- **Sample Rate**: The demo requests 48000 Hz but will adapt to the browser's actual supported sample rate (commonly 44100 Hz or 48000 Hz). The ggwave encoder is initialized with the actual sample rate to ensure correct audio generation.
- **Volume Range**: The volume slider ranges from 1-100, with a default of 10. Higher values may cause audio clipping.
- **Text Length**: Maximum message length is approximately 140 characters, depending on the protocol used.

## Troubleshooting

### No Audio Output
- Ensure your device volume is turned up
- Check that the browser has permission to play audio
- Try clicking the "Send" button again (some browsers require user interaction to enable audio)

### "Failed to create AudioContext" Error
- Make sure you're accessing the page via `http://localhost` or HTTPS
- Try using a different browser (Chrome, Firefox, or Safari)
- Check if your browser supports the Web Audio API

### Long Initialization Time
- The first transmission may take a moment as ggwave and the AudioContext are initialized
- Subsequent transmissions should be faster

### Audio Quality Issues
- Try different protocols (Normal, Fast, Fastest)
- Adjust the volume slider
- Ensure your speakers and microphone are not too close together (to prevent feedback)

## License

MIT License - see the ggwave repository for full license information.

## Resources

- [ggwave GitHub Repository](https://github.com/ggerganov/ggwave)
- [Live Demo](https://ggwave-js.ggerganov.com)
