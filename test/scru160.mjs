import { scru160 as generate } from "scru160";
export const assert = (expression, message = "") => {
  if (!expression) {
    throw new Error("Assertion failed" + (message ? ": " + message : ""));
  }
};

describe("scru160()", function () {
  const samples = [];
  for (let i = 0; i < 100_000; i++) {
    samples[i] = generate();
  }

  it("generates 32-character base32hexupper string", function () {
    samples.forEach((e) => assert(typeof e === "string"));
    const re = /^[0-9A-V]{32}$/;
    assert(samples.every((e) => re.test(e)));
  });

  it("generates 100k identifiers without collision", function () {
    assert(new Set(samples).size === samples.length);
  });

  it("generates sortable string representation by creation time", function () {
    const sorted = samples.slice().sort();
    for (let i = 0; i < samples.length; i++) {
      assert(samples[i] === sorted[i]);
    }
  });

  it("encodes up-to-date unix timestamp", function () {
    const re = /^([0-9A-V]{10})/;
    for (let i = 0; i < 10_000; i++) {
      const now = Date.now();
      const m = re.exec(generate());
      const ts = Math.trunc(parseInt(m[1], 32) / 4);
      assert(Math.abs(now - ts) < 16);
    }
  });

  it("encodes unique sortable pair of timestamp and counter", function () {
    const re = /^([0-9A-V]{9})([0-9A-V])([0-9A-V]{3})/;
    const m = re.exec(samples[0]);
    let prevTs = Math.trunc(parseInt(m[1] + m[2], 32) / 4);
    let prevCnt = 0xffff & (parseInt(m[2] + m[3], 32) / 2);
    for (let i = 1; i < samples.length; i++) {
      const m = re.exec(samples[i]);
      const curTs = Math.trunc(parseInt(m[1] + m[2], 32) / 4);
      const curCnt = 0xffff & (parseInt(m[2] + m[3], 32) / 2);
      assert(prevTs < curTs || (prevTs === curTs && prevCnt < curCnt));
      prevTs = curTs;
      prevCnt = curCnt;
    }
  });

  it("sets random bits randomly (this may fail at 0.001% probability)", function () {
    // count '1' in each bit
    const bins = new Array(160).fill(0);
    for (const e of samples) {
      for (let i = 0; i < 8; i++) {
        let n = parseInt(e.substring(4 * i, 4 * i + 4), 32);
        for (let j = 0; j < 20; j++) {
          bins[20 * i + 19 - j] += n & 1;
          n >>>= 1;
        }
      }
    }

    // test if random bits are set to 1 at ~50% probability
    // set margin based on binom dist 99.999% confidence interval
    const n = samples.length;
    const margin = 4.417173 * Math.sqrt((0.5 * 0.5) / n);
    for (let i = 64; i < bins.length; i++) {
      const p = bins[i] / n;
      assert(Math.abs(p - 0.5) < margin, `Msb ${i}: ${p}`);
    }
  });
});
