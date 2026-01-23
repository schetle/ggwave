/**
 * ggwave-client.js
 *
 * Wrapper module for the ggwave.js library that provides a clean JavaScript API
 * for encoding text to audio. This module abstracts the low-level Emscripten details
 * and provides a simpler interface for the main application.
 *
 * Usage:
 *   // 1. Ensure ggwave.js is loaded via <script> tag in HTML:
 *   //    <script src="lib/ggwave.js"></script>
 *
 *   // 2. Import and initialize in your ES6 module:
 *   import { initGgwave, encode } from './ggwave-client.js';
 *
 *   const config = {
 *     sampleRate: 48000,
 *     operatingMode: 'GGWAVE_OPERATING_MODE_RX_AND_TX'
 *   };
 *
 *   await initGgwave(config);
 *
 *   // 3. Encode text to audio:
 *   const waveform = encode('Hello World', 'GGWAVE_PROTOCOL_AUDIBLE_FAST', 50);
 *   // waveform is a Float32Array ready for Web Audio API playback
 */

/**
 * List of supported protocol names.
 * These constants are defined in the ggwave C++ library and exposed via the JS bindings.
 *
 * Protocol descriptions:
 * - AUDIBLE protocols: Human-audible frequencies (around 1-6 kHz)
 * - ULTRASOUND protocols: High-frequency, inaudible to most humans (around 15-20 kHz)
 * - DT protocols: Dual-tone protocols
 * - MT protocols: Multi-tone protocols
 *
 * Speed variants:
 * - NORMAL: Slower, more robust
 * - FAST: Medium speed
 * - FASTEST: Fastest, but less robust to noise
 */
const SUPPORTED_PROTOCOLS = [
    'GGWAVE_PROTOCOL_AUDIBLE_NORMAL',
    'GGWAVE_PROTOCOL_AUDIBLE_FAST',
    'GGWAVE_PROTOCOL_AUDIBLE_FASTEST',
    'GGWAVE_PROTOCOL_ULTRASOUND_NORMAL',
    'GGWAVE_PROTOCOL_ULTRASOUND_FAST',
    'GGWAVE_PROTOCOL_ULTRASOUND_FASTEST',
    'GGWAVE_PROTOCOL_DT_NORMAL',
    'GGWAVE_PROTOCOL_DT_FAST',
    'GGWAVE_PROTOCOL_DT_FASTEST',
    'GGWAVE_PROTOCOL_MT_NORMAL',
    'GGWAVE_PROTOCOL_MT_FAST',
    'GGWAVE_PROTOCOL_MT_FASTEST',
];

/**
 * Operating mode constants for ggwave initialization.
 * These can be combined using bitwise OR.
 */
const OPERATING_MODE_RX = 1;
const OPERATING_MODE_TX = 2;
const OPERATING_MODE_RX_AND_TX = OPERATING_MODE_RX | OPERATING_MODE_TX;
const OPERATING_MODE_USE_DSS = 4;

// Global state
let ggwaveModule = null;
let ggwaveInstance = null;

/**
 * Initialize the ggwave module and create an instance.
 *
 * @param {Object} config - Configuration object
 * @param {number} config.sampleRate - Audio sample rate in Hz (e.g., 48000)
 * @param {string} config.operatingMode - Operating mode string (e.g., 'GGWAVE_OPERATING_MODE_RX_AND_TX')
 * @returns {Promise<Object>} - Object containing the initialized ggwave instance and helper methods
 * @throws {Error} - If ggwave_factory is not available or initialization fails
 */
export async function initGgwave(config) {
    // Check if ggwave_factory is available (loaded via script tag)
    if (typeof ggwave_factory === 'undefined') {
        throw new Error('ggwave_factory is not available. Make sure ggwave.js is loaded via <script> tag before this module.');
    }

    try {
        // Call the factory function to get the ggwave module
        // ggwave_factory returns a promise that resolves to the module
        ggwaveModule = await ggwave_factory();

        // Get default parameters from the module
        const parameters = ggwaveModule.getDefaultParameters();

        // Apply configuration
        parameters.sampleRateInp = config.sampleRate;
        parameters.sampleRateOut = config.sampleRate;

        // Set operating mode
        // Convert string operating mode to numeric value
        let operatingModeValue = OPERATING_MODE_RX_AND_TX;
        if (config.operatingMode) {
            if (config.operatingMode === 'GGWAVE_OPERATING_MODE_TX') {
                operatingModeValue = OPERATING_MODE_TX;
            } else if (config.operatingMode === 'GGWAVE_OPERATING_MODE_RX') {
                operatingModeValue = OPERATING_MODE_RX;
            } else if (config.operatingMode === 'GGWAVE_OPERATING_MODE_RX_AND_TX') {
                operatingModeValue = OPERATING_MODE_RX_AND_TX;
            }
        }
        parameters.operatingMode = operatingModeValue;

        // Initialize the ggwave instance with the configured parameters
        ggwaveInstance = ggwaveModule.init(parameters);

        console.log('ggwave initialized successfully with instance:', ggwaveInstance);

        return {
            module: ggwaveModule,
            instance: ggwaveInstance,
        };
    } catch (error) {
        throw new Error(`Failed to initialize ggwave: ${error.message}`);
    }
}

/**
 * Encode text to audio waveform using ggwave.
 *
 * @param {string} text - The text to encode (max length depends on protocol, typically ~30-140 bytes)
 * @param {string} protocolName - Protocol name (e.g., 'GGWAVE_PROTOCOL_AUDIBLE_FAST')
 * @param {number} volume - Volume level (0-100, default 50)
 * @returns {Float32Array} - Encoded audio waveform as PCM samples
 * @throws {Error} - If ggwave is not initialized, text is invalid, or encoding fails
 */
export function encode(text, protocolName, volume = 50) {
    // Validate that ggwave is initialized
    if (!ggwaveModule || ggwaveInstance === null) {
        throw new Error('ggwave is not initialized. Call initGgwave() first.');
    }

    // Validate input text
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string.');
    }

    if (text.length === 0) {
        throw new Error('Invalid input: text cannot be empty.');
    }

    // Map protocol name to ggwave ProtocolId constant
    // Use ggwaveModule.ProtocolId to access the protocol constants dynamically
    const protocolId = ggwaveModule.ProtocolId[protocolName];
    if (protocolId === undefined) {
        throw new Error(`Unknown protocol: ${protocolName}. Available protocols: ${SUPPORTED_PROTOCOLS.join(', ')}`);
    }

    // Validate volume range
    const volumeClamped = Math.max(0, Math.min(100, volume));
    if (volumeClamped !== volume) {
        console.warn(`Volume ${volume} out of range, clamped to ${volumeClamped}`);
    }

    try {
        // Encode the text using ggwave
        // The encode function returns an Int8Array of PCM samples
        const waveform = ggwaveModule.encode(ggwaveInstance, text, protocolId, volumeClamped);

        if (!waveform || waveform.length === 0) {
            throw new Error('Encoding failed: ggwave returned empty waveform.');
        }

        // Convert Int8Array to Float32Array for Web Audio API compatibility
        // This performs a binary reinterpretation, matching the reference implementation
        // from examples/ggwave-js/index-tmpl.html lines 61-64
        const buffer = new ArrayBuffer(waveform.byteLength);
        new Int8Array(buffer).set(waveform);
        return new Float32Array(buffer);
    } catch (error) {
        throw new Error(`Failed to encode text: ${error.message}`);
    }
}

/**
 * Get the list of available protocol names.
 *
 * @returns {string[]} - Array of protocol name strings
 */
export function getAvailableProtocols() {
    return [...SUPPORTED_PROTOCOLS];
}

/**
 * Get the numeric ID for a protocol name.
 *
 * @param {string} protocolName - Protocol name
 * @returns {number|null} - Protocol ID or null if not found
 */
export function getProtocolId(protocolName) {
    if (!ggwaveModule) {
        return null;
    }
    return ggwaveModule.ProtocolId[protocolName] ?? null;
}

/**
 * Check if ggwave is initialized and ready to use.
 *
 * @returns {boolean} - True if initialized, false otherwise
 */
export function isInitialized() {
    return ggwaveModule !== null && ggwaveInstance !== null;
}
