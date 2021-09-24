/**
 * SCRU160: Sortable, Clock and Random number-based Unique identifier
 *
 * @license Apache-2.0
 * @copyright 2021 LiosK
 * @packageDocumentation
 */
export { scru160, scru160f };
/**
 * Generates a new SCRU160 ID encoded in the base32hex format.
 *
 * @returns 32-character base32hexupper string (`/^[0-9A-V]{32}$/`).
 */
declare const scru160: () => string;
/**
 * Generates a new SCRU160 ID encoded in the hexadecimal format.
 *
 * @returns 40-character hexadecimal string (`/^[0-9a-f]{40}$/`).
 */
declare const scru160f: () => string;
