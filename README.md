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
├── index.html          # Main HTML entry point (to be created)
├── styles.css          # Global styles (to be created)
├── app.js              # Main application logic (to be created)
├── audio.js            # Audio handling abstraction (to be created)
├── ggwave-client.js    # ggwave wrapper (to be created)
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

## License

MIT License - see the ggwave repository for full license information.

## Resources

- [ggwave GitHub Repository](https://github.com/ggerganov/ggwave)
- [Live Demo](https://ggwave-js.ggerganov.com)
