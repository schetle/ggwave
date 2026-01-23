/**
 * audio.js - Audio playback module for ggwave web demo
 * Handles audio transmission via Web Audio API
 */

// Shared AudioContext instance (created lazily on first use)
let audioContext = null;

/**
 * Helper function to convert typed arrays between different types
 * @param {TypedArray} src - Source typed array
 * @param {Function} type - Target typed array constructor
 * @returns {TypedArray} New typed array of the target type
 */
function convertTypedArray(src, type) {
    const buffer = new ArrayBuffer(src.byteLength);
    new src.constructor(buffer).set(src);
    return new type(buffer);
}

/**
 * Initializes the AudioContext with the specified sample rate
 * Uses webkit prefix fallback for Safari compatibility
 * @param {number} sampleRate - Sample rate in Hz (default: 48000)
 * @returns {AudioContext} The initialized AudioContext
 * @throws {Error} If AudioContext creation fails
 */
function initAudioContext(sampleRate = 48000) {
    if (audioContext) {
        return audioContext;
    }

    try {
        // Handle webkit prefix for Safari
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            throw new Error('Web Audio API is not supported in this browser');
        }

        audioContext = new AudioContextClass({ sampleRate });
        return audioContext;
    } catch (error) {
        throw new Error(`Failed to create AudioContext: ${error.message}`);
    }
}

/**
 * Plays PCM audio samples through device speakers
 * Initializes AudioContext lazily on first call to comply with browser autoplay policies
 *
 * @param {Int8Array|Float32Array|Array} samples - PCM audio samples to play
 * @param {number} sampleRate - Sample rate in Hz (default: 48000)
 * @throws {Error} If samples are invalid or playback fails
 */
export function playSamples(samples, sampleRate = 48000) {
    // Validate input samples
    if (!samples || samples.length === 0) {
        throw new Error('Invalid samples: samples must be a non-empty array');
    }

    try {
        // Initialize AudioContext lazily on first use
        const context = initAudioContext(sampleRate);

        // Convert Int8Array to Float32Array if needed
        let floatSamples;
        if (samples instanceof Int8Array) {
            floatSamples = convertTypedArray(samples, Float32Array);
        } else if (samples instanceof Float32Array) {
            floatSamples = samples;
        } else {
            // Handle regular arrays
            floatSamples = new Float32Array(samples);
        }

        // Create AudioBuffer with the correct sample rate
        // Using mono audio (1 channel)
        // Use context.sampleRate instead of the parameter, as browsers may not support
        // the exact requested rate and will use the closest supported rate instead
        const buffer = context.createBuffer(1, floatSamples.length, context.sampleRate);

        // Copy samples into the buffer's channel data
        buffer.getChannelData(0).set(floatSamples);

        // Create source node for playback
        const source = context.createBufferSource();
        source.buffer = buffer;

        // Connect to speakers
        source.connect(context.destination);

        // Start playback immediately
        source.start(0);

    } catch (error) {
        throw new Error(`Audio playback failed: ${error.message}`);
    }
}

/**
 * Returns the current AudioContext instance
 * Useful for future RX functionality that needs access to the same context
 *
 * @returns {AudioContext|null} The current AudioContext or null if not initialized
 */
export function getAudioContext() {
    return audioContext;
}
