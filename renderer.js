const { ipcRenderer } = require('electron');

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let bluetoothDevice = null;
let sendCharacteristic = null;
let receiveCharacteristic = null;
const WALKIE_TALKIE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const SEND_CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
const RECEIVE_CHARACTERISTIC_UUID = '00002a38-0000-1000-8000-00805f9b34fb';

// UI elements
const talkButton = document.getElementById('talk-btn');
const peersList = document.getElementById('peers-list');
const peerCount = document.getElementById('peer-count');
const connectionStatus = document.getElementById('connection-status');
const volumeLevel = document.getElementById('volume-level');

// Setup audio context for volume meter
const audioContext = new AudioContext();
let analyser;

async function connectBluetooth() {
    try {
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [
                { services: [WALKIE_TALKIE_SERVICE_UUID] }
            ]
        });

        const server = await bluetoothDevice.gatt.connect();
        const service = await server.getPrimaryService(WALKIE_TALKIE_SERVICE_UUID);
        
        sendCharacteristic = await service.getCharacteristic(SEND_CHARACTERISTIC_UUID);
        receiveCharacteristic = await service.getCharacteristic(RECEIVE_CHARACTERISTIC_UUID);
        
        // Listen for incoming audio data
        await receiveCharacteristic.startNotifications();
        receiveCharacteristic.addEventListener('characteristicvaluechanged', handleIncomingAudio);
        
        // Update UI
        connectionStatus.innerHTML = `
            <span class="status-indicator connected"></span>
            Connected to ${bluetoothDevice.name}
        `;
        peerCount.textContent = '1 peer connected';
        
        // Add device to peers list
        updatePeersList();
        
    } catch (error) {
        console.error('Bluetooth connection failed:', error);
        connectionStatus.innerHTML = `
            <span class="status-indicator disconnected"></span>
            Failed to connect: ${error.message}
        `;
    }
}

// Initialize audio input
async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup volume meter
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        // Setup media recorder
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = async (event) => {
            if (bluetoothDevice && bluetoothDevice.gatt.connected) {
                const chunk = event.data;
                const arrayBuffer = await chunk.arrayBuffer();
                
                // Send audio data in chunks that fit Bluetooth MTU size (typically 20 bytes)
                const chunkSize = 20;
                for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
                    const chunk = arrayBuffer.slice(i, i + chunkSize);
                    await sendCharacteristic.writeValue(chunk);
                }
            }
        };
        
        updateVolumeMeter();
    } catch (error) {
        console.error('Error accessing microphone:', error);
        talkButton.textContent = 'Microphone access denied';
        talkButton.classList.add('disabled');
    }
}

function handleIncomingAudio(event) {
    if (isRecording) return; // Don't play while recording
    
    const audioData = event.target.value;
    const audioBlob = new Blob([audioData], { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
}

// Update volume meter animation
function updateVolumeMeter() {
    if (!analyser) return;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    function update() {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const volume = Math.min(100, (average / 128) * 100);
        volumeLevel.style.width = `${volume}%`;
        requestAnimationFrame(update);
    }
    
    update();
}

// Push-to-talk functionality
talkButton.addEventListener('mousedown', () => {
    if (!mediaRecorder || mediaRecorder.state === 'recording' || !bluetoothDevice || !bluetoothDevice.gatt.connected) return;
    
    isRecording = true;
    talkButton.style.background = '#f44336';
    talkButton.textContent = 'Talking...';
    mediaRecorder.start(100); // Send data every 100ms
});

talkButton.addEventListener('mouseup', () => {
    if (!mediaRecorder || mediaRecorder.state !== 'recording') return;
    
    isRecording = false;
    talkButton.style.background = '';
    talkButton.textContent = 'Press and Hold to Talk';
    mediaRecorder.stop();
});

function updatePeersList() {
    peersList.innerHTML = '';
    if (bluetoothDevice) {
        const peerElement = document.createElement('div');
        peerElement.className = 'peer-item';
        peerElement.innerHTML = `
            <span><span class="status-indicator connected"></span>${bluetoothDevice.name}</span>
            <span>Connected</span>
        `;
        peersList.appendChild(peerElement);
    }
}

// Add connect button to UI
const connectButton = document.createElement('button');
connectButton.className = 'btn';
connectButton.style.background = '#2196F3';
connectButton.style.marginRight = '10px';
connectButton.textContent = 'Connect Bluetooth Device';
document.querySelector('.controls').insertBefore(connectButton, talkButton);

connectButton.addEventListener('click', connectBluetooth);

// Initialize audio when the page loads
initAudio();
