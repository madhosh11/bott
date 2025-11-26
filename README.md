# Chrome Multi Controller

A desktop application for managing multiple isolated Chrome instances with virtual gamepad support.

## Features

- **Embedded Chrome Instances**: Launch multiple Chrome tabs embedded directly within the app window
- **Isolated Profiles**: Each tab runs with a separate Chrome profile (cookies, cache, and data are completely isolated)
- **Virtual Gamepad**: Inject and control virtual gamepad inputs to all tabs simultaneously
- **Auto Movement**: Toggle automated random gamepad inputs across all tabs
- **Tab Management**: Close and reopen tabs in their original grid positions
- **Responsive Grid Layout**: Grid view automatically adjusts to window size

## Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run in development mode:
\`\`\`bash
npm run dev
\`\`\`

This will start the Next.js dev server and launch the Electron app.

## Building

Build for Windows:
\`\`\`bash
npm run build:win
\`\`\`

Build for macOS:
\`\`\`bash
npm run build:mac
\`\`\`

Build for Linux:
\`\`\`bash
npm run build:linux
\`\`\`

The executable will be created in the `dist` folder.

## Usage

1. Launch the application
2. Enter the number of bots you want to open (1-50)
3. Click "Launch Bots" - each bot will open Xbox Cloud Gaming embedded in the app window
4. Use the control switches:
   - **Auto Movement**: Sends random gamepad inputs to all active tabs
   - **+1 Bot**: Reopens the most recently closed tab in its original position
5. Each bot can be:
   - Refreshed (reload the page)
   - Closed (close the Chrome instance)
   - Fullscreened (expand within the app)

## Technical Details

- Built with Electron (standalone desktop app)
- Uses Electron's BrowserView API to embed Chrome instances directly in the app
- Each bot has its own isolated Chrome session (separate partition)
- Virtual gamepad is injected into each embedded browser via JavaScript
- Grid layout automatically recalculates when bots are added/removed
- All Chrome instances run within the Electron window, not as separate processes
