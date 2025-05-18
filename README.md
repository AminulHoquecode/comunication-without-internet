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
```bash
git clone [repository-url]
cd wireless-walkie-talkie
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

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
