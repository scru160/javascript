/**
 * SCRU-160: Sortable, Clock and Random number-based Unique identifier
 *
 * @license Apache-2.0
 * @copyright 2021 LiosK
 * @packageDocumentation
 */

import { randomFillSync } from "crypto";

export { scru160, scru160f };

/**
 * Generates a new SCRU-160 ID encoded in the base32hex format.
 *
 * @returns 32-character base32hexupper string (`/^[0-9A-V]{32}$/`).
 */
const scru160 = (): string => {
  return generateQuad()
    .map((x) => ("0000000" + x.toString(32).toUpperCase()).slice(-8))
    .join("");
};

/**
 * Generates a new SCRU-160 ID encoded in the hexadecimal format.
 *
 * @returns 40-character hexadecimal string (`/^[0-9a-f]{40}$/`).
 */
const scru160f = (): string => {
  return generateQuad()
    .map((x) => ("000000000" + x.toString(16)).slice(-10))
    .join("");
};

/**
 * Generates a byte sequence that represents a new SCRU-160 ID.
 *
 * @returns 20-byte sequence.
 */
const generateBytes = () => {
  const [ts, cnt] = getTsAndCnt();
  const tsBytes = new Uint8Array(6);
  for (let i = 0, n = ts; i < 6; i++, n = Math.trunc(n / 0x100)) {
    tsBytes[5 - i] = n % 0x100;
  }
  return Uint8Array.of(...tsBytes, cnt >> 8, cnt & 0xff, ...getRandomBytes(12));
};

/** Generates a new SCRU-160 ID in the form of four 40-bit integer values. */
const generateQuad = () => {
  const bs = generateBytes();
  const result: [number, number, number, number] = [0, 0, 0, 0];
  for (let i = 0; i < 20; i++) {
    result[Math.trunc(i / 5)] += bs[i] * 0x100 ** (4 - (i % 5));
  }
  return result;
};

/** Internal state - timestamp at last generation */
let ts = 0;

/** Internal state - counter at last generation */
let cnt = 0;

/**
 * Updates the internal state and returns the latest values.
 *
 * @returns The latest timestamp and counter.
 */
const getTsAndCnt = (): [number, number] => {
  let newTs = Date.now();
  if (newTs <= ts) {
    if (++cnt < 0x1_0000) {
      return [ts, cnt];
    }

    // wait a moment until clock goes forward
    let i = 0;
    while (newTs <= ts) {
      newTs = Date.now();
      if (++i > 1_000_000) {
        console.warn(
          "scru160: reinitialized internal state as clock did not go forward; monotonicity may be broken"
        );
        break;
      }
    }
  }

  const [hi, lo] = getRandomBytes(2);
  ts = newTs;
  cnt = ((0x7f & hi) << 8) | lo; // reset to 15-bit random number
  return [ts, cnt];
};

/** Returns a Uint8Array filled with cryptographically strong random values. */
const getRandomBytes: (length: number) => Uint8Array = (() => {
  // detect CSPRNG
  if (typeof window !== "undefined" && window.crypto) {
    // Web Crypto API on browsers
    return (length: number) =>
      window.crypto.getRandomValues(new Uint8Array(length));
  } else if (randomFillSync) {
    // Node.js Crypto
    return (length: number) => randomFillSync(new Uint8Array(length));
  } else {
    console.warn(
      "scru160: fell back on Math.random() as no cryptographic RNG was detected"
    );
    return (length: number) => {
      const buffer = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        buffer[i] = Math.trunc(Math.random() * 0x100);
      }
      return buffer;
    };
  }
})();
