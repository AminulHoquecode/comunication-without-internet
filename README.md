# Wireless Walkie-Talkie

A desktop application that enables wireless communication between devices using Bluetooth technology, built with Electron.

## Features

- Push-to-talk functionality
- Real-time volume metering
- Bluetooth device discovery and pairing 
- System tray integration
- Cross-platform support

## Prerequisites

- Node.js (Latest LTS version recommended)
- A device with Bluetooth capability

## Installation

1. Clone this repository:
```powershell
git clone https://github.com/AminulHoquecode/comunication-without-internet.git
cd comunication-without-internet
```

2. Install Node.js:
   - Download and install from https://nodejs.org/ (LTS version recommended)
   - Verify installation by running `node --version` in terminal

3. Install dependencies:
```powershell
npm install
```

4. Start the application (choose one method):
   - Double-click the "Start Walkie-Talkie.bat" file
   - OR run in terminal: `npm start`

## Building the Application

To create a distribution package:

```bash
# For Windows
.\package-app.ps1
```

The packaged application will be available in the `dist` folder.

## Development

- `main.js` - Main Electron process
- `renderer.js` - Renderer process, handles UI and audio
- `index.html` - Application UI

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
