/**
 * SCRU-160: Sortable, Clock and Random number-based Unique identifier
 *
 * @license Apache-2.0
 * @copyright 2021 LiosK
 * @packageDocumentation
 */

import { randomFillSync } from "crypto";

export { scru160, scru160f };

/** Represents SCRU-160 ID generator. */
class Generator {
  /**
   * Generates a new SCRU-160 ID encoded in the base32hex format.
   *
   * @returns 32-character base32hexupper string (`/^[0-9A-V]{32}$/`).
   */
  scru160(): string {
    return this.generateQuad()
      .map((x) => ("0000000" + x.toString(32).toUpperCase()).slice(-8))
      .join("");
  }

  /**
   * Generates a new SCRU-160 ID encoded in the hexadecimal format.
   *
   * @returns 40-character hexadecimal string (`/^[0-9a-f]{40}$/`).
   */
  scru160f(): string {
    return this.generateQuad()
      .map((x) => ("000000000" + x.toString(16)).slice(-10))
      .join("");
  }

  /**
   * Generates a byte sequence that represents a new SCRU-160 ID.
   *
   * @returns 20-byte sequence.
   */
  generate(): Uint8Array {
    const [ts, cnt] = this.getTsAndCnt();
    const tsBytes = new Uint8Array(6);
    for (let i = 0, n = ts; i < 6; i++, n = Math.trunc(n / 0x100)) {
      tsBytes[5 - i] = n % 0x100;
    }
    return Uint8Array.of(
      ...tsBytes,
      cnt >> 8,
      cnt & 0xff,
      ...this.getRandomBytes(12)
    );
  }

  /** Generates a new SCRU-160 ID in the form of four 40-bit integer values. */
  private generateQuad() {
    const bs = this.generate();
    const result: [number, number, number, number] = [0, 0, 0, 0];
    for (let i = 0; i < 20; i++) {
      result[Math.trunc(i / 5)] += bs[i] * 0x100 ** (4 - (i % 5));
    }
    return result;
  }

  /** Internal state - timestamp at last generation */
  private ts = 0;

  /** Internal state - counter at last generation */
  private cnt = 0;

  /**
   * Updates the internal state and returns the latest values.
   *
   * @returns The latest timestamp and counter.
   */
  private getTsAndCnt(): [number, number] {
    let newTs = Date.now();
    if (newTs <= this.ts) {
      if (++this.cnt < 0x1_0000) {
        return [this.ts, this.cnt];
      }

      // wait a moment until clock goes forward
      let i = 0;
      while (newTs <= this.ts) {
        newTs = Date.now();
        if (++i > 1_000_000) {
          console.warn(
            "scru160: reinitialized internal state as clock did not go forward; monotonicity may be broken"
          );
          break;
        }
      }
    }

    const [hi, lo] = this.getRandomBytes(2);
    this.ts = newTs;
    this.cnt = ((0x7f & hi) << 8) | lo; // reset to 15-bit random number
    return [this.ts, this.cnt];
  }

  /**
   * Returns a Uint8Array filled with (cryptographically strong) random values.
   */
  private getRandomBytes = (length: number): Uint8Array => {
    const buffer = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      buffer[i] = Math.trunc(Math.random() * 0x100);
    }
    return buffer;
  };

  /** Create a new SCRU-160 generator. */
  constructor() {
    // detect CSPRNG
    if (typeof window !== "undefined" && window.crypto) {
      // Web Crypto API on browsers
      this.getRandomBytes = (length: number) =>
        window.crypto.getRandomValues(new Uint8Array(length));
    } else if (randomFillSync) {
      // Node.js Crypto
      this.getRandomBytes = (length: number) =>
        randomFillSync(new Uint8Array(length));
    } else {
      console.warn(
        "scru160: fell back on Math.random() as no cryptographic RNG was detected"
      );
    }
  }
}

const defaultGenerator = new Generator();

/**
 * Generates a new SCRU-160 ID encoded in the base32hex format.
 *
 * @returns 32-character base32hexupper string (`/^[0-9A-V]{32}$/`).
 */
const scru160 = (): string => defaultGenerator.scru160();

/**
 * Generates a new SCRU-160 ID encoded in the hexadecimal format.
 *
 * @returns 40-character hexadecimal string (`/^[0-9a-f]{40}$/`).
 */
const scru160f = (): string => defaultGenerator.scru160f();
