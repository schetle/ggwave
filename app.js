/**
 * app.js - Main application controller for ggwave web demo
 *
 * This module orchestrates the ggwave web demo by:
 * - Managing centralized configuration
 * - Initializing ggwave and audio subsystems
 * - Wiring UI event handlers
 * - Updating DOM to reflect application state
 * - Handling errors and user feedback
 */

import { initGgwave, encode, isInitialized } from './ggwave-client.js';
import { playSamples } from './audio.js';

/**
 * Centralized configuration object for the application
 * Single source of truth for audio and ggwave parameters
 */
export const CONFIG = {
    audio: {
        sampleRate: 48000,
        bufferSize: 1024,
    },
    ggwave: {
        defaultProtocol: 'GGWAVE_PROTOCOL_AUDIBLE_FAST',
        defaultVolume: 10,
        operatingMode: 'GGWAVE_OPERATING_MODE_RX_AND_TX',
    },
};

/**
 * Protocol ID mapping from select element values to ggwave protocol names
 */
const PROTOCOL_MAP = {
    '0': 'GGWAVE_PROTOCOL_AUDIBLE_NORMAL',
    '1': 'GGWAVE_PROTOCOL_AUDIBLE_FAST',
    '2': 'GGWAVE_PROTOCOL_AUDIBLE_FASTEST',
    '3': 'GGWAVE_PROTOCOL_ULTRASOUND_NORMAL',
    '4': 'GGWAVE_PROTOCOL_ULTRASOUND_FAST',
    '5': 'GGWAVE_PROTOCOL_ULTRASOUND_FASTEST',
};

// Application state
let currentProtocol = CONFIG.ggwave.defaultProtocol;
let currentVolume = CONFIG.ggwave.defaultVolume;
let isSending = false;

// DOM element references (populated on DOMContentLoaded)
let txDataInput;
let protocolSelect;
let volumeSlider;
let volumeValue;
let sendBtn;
let statusText;
let errorMessage;
let errorText;

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('ggwave web demo initializing...');

    // Get references to all DOM elements
    txDataInput = document.getElementById('txData');
    protocolSelect = document.getElementById('protocol');
    volumeSlider = document.getElementById('volume');
    volumeValue = document.getElementById('volumeValue');
    sendBtn = document.getElementById('sendBtn');
    statusText = document.getElementById('statusText');
    errorMessage = document.getElementById('errorMessage');
    errorText = document.getElementById('errorText');

    // Validate all required DOM elements are present
    if (!txDataInput || !protocolSelect || !volumeSlider || !volumeValue ||
        !sendBtn || !statusText || !errorMessage || !errorText) {
        console.error('Failed to find required DOM elements');
        showError('Application initialization failed: missing UI elements');
        return;
    }

    // Set initial UI state
    protocolSelect.value = '1'; // Fast protocol (default)
    volumeSlider.value = CONFIG.ggwave.defaultVolume;
    volumeValue.textContent = CONFIG.ggwave.defaultVolume;

    // Attach event listeners
    sendBtn.addEventListener('click', handleSend);
    protocolSelect.addEventListener('change', handleProtocolChange);
    volumeSlider.addEventListener('input', handleVolumeChange);

    console.log('ggwave web demo initialized successfully');
});

/**
 * Handle send button click
 * Encodes and transmits the message via audio
 */
async function handleSend() {
    // Prevent overlapping transmissions
    if (isSending) {
        return;
    }

    try {
        // Validate input text
        const text = txDataInput.value.trim();
        if (!text) {
            showError('Please enter a message to send');
            return;
        }

        // Check text length (ggwave has protocol-dependent limits, typically 30-140 bytes)
        if (text.length > 140) {
            showError('Message too long. Maximum length is approximately 140 characters.');
            return;
        }

        // Clear any previous errors
        hideError();

        // Initialize ggwave on first send (lazy initialization)
        // This ensures we have a user gesture for AudioContext creation
        if (!isInitialized()) {
            updateStatus('Initializing...');
            await initGgwave({
                sampleRate: CONFIG.audio.sampleRate,
                operatingMode: CONFIG.ggwave.operatingMode,
            });
            console.log('ggwave initialized on first send');
        }

        // Update UI state
        isSending = true;
        sendBtn.disabled = true;
        updateStatus('Sending...');

        // Encode text to audio waveform
        const waveform = encode(text, currentProtocol, currentVolume);
        console.log(`Encoded "${text}" using protocol ${currentProtocol}, volume ${currentVolume}`);
        console.log(`Waveform length: ${waveform.length} samples`);

        // Play the audio
        playSamples(waveform, CONFIG.audio.sampleRate);

        // Calculate approximate duration for status update
        // Duration in seconds = samples / sample rate
        const durationMs = (waveform.length / CONFIG.audio.sampleRate) * 1000;

        // Update status back to idle after transmission completes
        setTimeout(() => {
            updateStatus('Idle');
            isSending = false;
            sendBtn.disabled = false;
        }, durationMs + 100); // Add small buffer for audio completion

    } catch (error) {
        console.error('Send failed:', error);
        showError(`Failed to send: ${error.message}`);

        // Reset state on error
        isSending = false;
        sendBtn.disabled = false;
        updateStatus('Error');

        // Auto-hide error and reset status after a few seconds
        setTimeout(() => {
            if (statusText.textContent === 'Error') {
                updateStatus('Idle');
            }
        }, 3000);
    }
}

/**
 * Handle protocol selector change
 */
function handleProtocolChange() {
    const selectedValue = protocolSelect.value;
    currentProtocol = PROTOCOL_MAP[selectedValue];
    console.log(`Protocol changed to: ${currentProtocol}`);
}

/**
 * Handle volume slider change
 */
function handleVolumeChange() {
    currentVolume = parseInt(volumeSlider.value, 10);
    volumeValue.textContent = currentVolume;
    console.log(`Volume changed to: ${currentVolume}`);
}

/**
 * Update the status display
 * @param {string} status - Status text to display
 */
function updateStatus(status) {
    statusText.textContent = status;

    // Update status display container styling based on state
    const statusDisplay = statusText.closest('.status-display');
    if (statusDisplay) {
        statusDisplay.className = 'status-display';
        if (status === 'Sending...' || status === 'Initializing...') {
            statusDisplay.classList.add('sending');
        } else if (status === 'Error') {
            statusDisplay.classList.add('error');
        }
    }
}

/**
 * Show an error message to the user
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.hidden = false;
}

/**
 * Hide the error message
 */
function hideError() {
    errorMessage.hidden = true;
    errorText.textContent = '';
}
