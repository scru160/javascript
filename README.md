# SCRU160: Sortable, Clock and Random number-based Unique identifier

SCRU160 ID is yet another attempt to supersede [UUID] in the use cases that need
decentralized, globally unique time-ordered identifiers. SCRU160 is inspired by
[ULID] and [KSUID] and has the following features:

- 160-bit feature-rich worry-free design suitable for general purposes
- Sortable by generation time (in binary and in text)
- Case-insensitive, highly portable encodings: 32-char base32hex and 40-char hex
- More than 32,000 unique, time-ordered but unpredictable IDs per millisecond
- Nearly 111-bit randomness for collision resistance

```javascript
import { scru160, scru160f } from "scru160";

console.log(scru160()); // e.g. "05TTUP1HNCPNH30VEK64KDQT9BSNU4C4"
console.log(scru160()); // e.g. "05TTUP1HNCPNIB63R8IN5V2L3VFGNFET"

console.log(scru160f()); // e.g. "017bdf6431bb33750751eb63beb3c3f8c5969d86"
console.log(scru160f()); // e.g. "017bdf6431bb337662412e6a5758890735c33c2b"
```

See [the specification] for further details.

[uuid]: https://en.wikipedia.org/wiki/Universally_unique_identifier
[ulid]: https://github.com/ulid/spec
[ksuid]: https://github.com/segmentio/ksuid
[the specification]: https://github.com/scru160/spec

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
