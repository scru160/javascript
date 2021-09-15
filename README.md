# SCRU-160: Sortable, Clock and Random number-based Unique identifier

SCRU-160 ID is yet another attempt to supersede [UUID] in the use cases that
need decentralized, globally unique time-ordered identifiers. SCRU-160 is
inspired by [ULID] and [KSUID] and has the following features:

- 160-bit length
- Sortable by generation time (in binary and in text)
- Two case-insensitive encodings: 32-character base32hex and 40-character hex
- More than 32,768 unique, time-ordered but unpredictable IDs per millisecond
- Nearly 111-bit randomness for collision resistance

```javascript
import { scru160, scru160f } from "scru160";

console.log(scru160()); // e.g. "05TTUP1HNCPNH30VEK64KDQT9BSNU4C4"
console.log(scru160()); // e.g. "05TTUP1HNCPNIB63R8IN5V2L3VFGNFET"

console.log(scru160f()); // e.g. "017bdf6431bb33750751eb63beb3c3f8c5969d86"
console.log(scru160f()); // e.g. "017bdf6431bb337662412e6a5758890735c33c2b"
```

[uuid]: https://en.wikipedia.org/wiki/Universally_unique_identifier
[ulid]: https://github.com/ulid/spec
[ksuid]: https://github.com/segmentio/ksuid

## Binary Layout and Byte Order

A SCRU-160 ID is an 160-bit object that consists of the following four fields:

| Bit #        | Field     | Data Type                           |
| ------------ | --------- | ----------------------------------- |
| Msb 0 - 47   | timestamp | 48-bit unsigned integer, big-endian |
| Msb 48 - 63  | counter   | 16-bit unsigned integer, big-endian |
| Msb 64 - 79  | random16  | 16-bit unsigned integer, big-endian |
| Msb 80 - 159 | random80  | 80-bit unsigned integer, big-endian |

- `timestamp` - Unix time in milliseconds
- `counter` - Reset to a 15-bit random number when `timestamp` changes;
  incremented by one for each new ID generated within the same `timestamp` (a
  different implementation may reset it to a smaller random number or zero to
  accommodate more IDs per millisecond)
- `random16` - Random number (documented separately from `random80` for future
  expansion)
- `random80` - Random number

Cryptographically secure random number generators are employed if possible.

## Encodings

The _base32hex_ encoding as defined in [RFC 4648] is used by default to produce
a 32-character textual representation consisting of `[0-9A-V]`.

```javascript
scru160(); // e.g. "05TUIM8J8SU9O6P30I56PP49PI0RGNPM"
```

Alternatively, hexadecimal encoding can be used to produce a 40-character hex
string that looks like the commonly seen SHA-1 hashes.

```javascript
scru160f(); // e.g. "017be95b2d6042db903a19a0974182ec7445188a"
```

The base32hex representations and hex representations cannot be mixed when
SCRU-160 IDs need to be lexicographically sortable.

[rfc 4648]: https://datatracker.ietf.org/doc/html/rfc4648

## License

Copyright 2021 LiosK

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

## See Also

- [npm package](https://www.npmjs.com/package/scru160)
- [API Documentation](https://scru160.github.io/javascript/docs/)
- [Run tests on your browser](https://scru160.github.io/javascript/test/)
