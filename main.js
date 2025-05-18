const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableBlinkFeatures: 'WebBluetooth'
    }
  });

  mainWindow.loadFile('index.html');
}

// Start UDP discovery service
function startDiscoveryService() {
  const socket = dgram.createSocket('udp4');
  
  socket.on('message', (msg, rinfo) => {
    if (msg.toString() === 'WALKIE_TALKIE_DISCOVERY') {
      const response = Buffer.from('WALKIE_TALKIE_HERE');
      socket.send(response, 0, response.length, rinfo.port, rinfo.address);
      connectToPeer(rinfo.address);
    }
  });

  socket.bind(DISCOVERY_PORT);

  // Broadcast presence
  setInterval(() => {
    const message = Buffer.from('WALKIE_TALKIE_DISCOVERY');
    socket.setBroadcast(true);
    socket.send(message, 0, message.length, DISCOVERY_PORT, '255.255.255.255');
  }, 5000);
}

function connectToPeer(address) {
  if (!peers.has(address)) {
    const socket = io(`http://${address}:3000`);
    
    socket.on('connect', () => {
      peers.add(address);
      mainWindow.webContents.send('peer-connected', address);
    });

    socket.on('audio-data', (data) => {
      mainWindow.webContents.send('audio-data', data);
    });

    socket.on('disconnect', () => {
      peers.delete(address);
      mainWindow.webContents.send('peer-disconnected', address);
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  
  // Start WebSocket server for audio transmission
  io_server = new Server(3000);
  
  io_server.on('connection', (socket) => {
    socket.on('audio-data', (data) => {
      // Broadcast to all other connected clients
      socket.broadcast.emit('audio-data', data);
    });
  });

  startDiscoveryService();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
