"use strict";
/**
 * SCRU-160: Sortable, Clock and Random number-based Unique identifier
 *
 * @license Apache-2.0
 * @copyright 2021 LiosK
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scru160f = exports.scru160 = void 0;
const crypto_1 = require("crypto");
/** Represents SCRU-160 ID generator. */
class Generator {
    /** Create a new SCRU-160 generator. */
    constructor() {
        /** Internal state - timestamp at last generation */
        this.ts = 0;
        /** Internal state - counter at last generation */
        this.cnt = 0;
        /**
         * Returns a Uint8Array filled with (cryptographically strong) random values.
         */
        this.getRandomBytes = (length) => {
            const buffer = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                buffer[i] = Math.trunc(Math.random() * 0x100);
            }
            return buffer;
        };
        // detect CSPRNG
        if (typeof window !== "undefined" && window.crypto) {
            // Web Crypto API on browsers
            this.getRandomBytes = (length) => window.crypto.getRandomValues(new Uint8Array(length));
        }
        else if (crypto_1.randomFillSync) {
            // Node.js Crypto
            this.getRandomBytes = (length) => (0, crypto_1.randomFillSync)(new Uint8Array(length));
        }
        else {
            console.warn("scru160: fell back on Math.random() as no cryptographic RNG was detected");
        }
    }
    /**
     * Generates a new SCRU-160 ID encoded in the base32hex format.
     *
     * @returns 32-character base32hexupper string (`/^[0-9A-V]{32}$/`).
     */
    scru160() {
        return this.generateQuad()
            .map((x) => ("0000000" + x.toString(32).toUpperCase()).slice(-8))
            .join("");
    }
    /**
     * Generates a new SCRU-160 ID encoded in the hexadecimal format.
     *
     * @returns 40-character hexadecimal string (`/^[0-9a-f]{40}$/`).
     */
    scru160f() {
        return this.generateQuad()
            .map((x) => ("000000000" + x.toString(16)).slice(-10))
            .join("");
    }
    /**
     * Generates a byte sequence that represents a new SCRU-160 ID.
     *
     * @returns 20-byte sequence.
     */
    generate() {
        const [ts, cnt] = this.getTsAndCnt();
        const tsBytes = new Uint8Array(6);
        for (let i = 0, n = ts; i < 6; i++, n = Math.trunc(n / 0x100)) {
            tsBytes[5 - i] = n % 0x100;
        }
        return Uint8Array.of(...tsBytes, cnt >> 8, cnt & 0xff, ...this.getRandomBytes(12));
    }
    /** Generates a new SCRU-160 ID in the form of four 40-bit integer values. */
    generateQuad() {
        const bs = this.generate();
        const result = [0, 0, 0, 0];
        for (let i = 0; i < 20; i++) {
            result[Math.trunc(i / 5)] += bs[i] * Math.pow(0x100, (4 - (i % 5)));
        }
        return result;
    }
    /**
     * Updates the internal state and returns the latest values.
     *
     * @returns The latest timestamp and counter.
     */
    getTsAndCnt() {
        let newTs = Date.now();
        if (newTs <= this.ts) {
            if (++this.cnt < 65536) {
                return [this.ts, this.cnt];
            }
            // wait a moment until clock goes forward
            let i = 0;
            while (newTs <= this.ts) {
                newTs = Date.now();
                if (++i > 1000000) {
                    console.warn("scru160: reinitialized internal state as clock did not go forward; monotonicity may be broken");
                    break;
                }
            }
        }
        const [hi, lo] = this.getRandomBytes(2);
        this.ts = newTs;
        this.cnt = ((0x7f & hi) << 8) | lo; // reset to 15-bit random number
        return [this.ts, this.cnt];
    }
}
const defaultGenerator = new Generator();
/**
 * Generates a new SCRU-160 ID encoded in the base32hex format.
 *
 * @returns 32-character base32hexupper string (`/^[0-9A-V]{32}$/`).
 */
const scru160 = () => defaultGenerator.scru160();
exports.scru160 = scru160;
/**
 * Generates a new SCRU-160 ID encoded in the hexadecimal format.
 *
 * @returns 40-character hexadecimal string (`/^[0-9a-f]{40}$/`).
 */
const scru160f = () => defaultGenerator.scru160f();
exports.scru160f = scru160f;
