import { scru160f as generate } from "scru160";
export const assert = (expression, message = "") => {
  if (!expression) {
    throw new Error("Assertion failed" + (message ? ": " + message : ""));
  }
};

describe("scru160f()", function () {
  const samples = [];
  for (let i = 0; i < 100_000; i++) {
    samples[i] = generate();
  }

  it("generates 40-character hexadecimal string", function () {
    samples.forEach((e) => assert(typeof e === "string"));
    const re = /^[0-9a-f]{40}$/;
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
    const re = /^[0-9a-f]{12}/;
    for (let i = 0; i < 10_000; i++) {
      const now = Date.now();
      const m = re.exec(generate());
      const ts = parseInt(m[0], 16);
      assert(Math.abs(now - ts) < 16);
    }
  });

  it("encodes sortable timestamp and counter", function () {
    const re = /^([0-9a-f]{12})([0-9a-f]{4})/;
    const m = re.exec(samples[0]);
    let prevTs = parseInt(m[1], 16);
    let prevCnt = parseInt(m[2], 16);
    for (let i = 1; i < samples.length; i++) {
      const m = re.exec(samples[i]);
      const curTs = parseInt(m[1], 16);
      const curCnt = parseInt(m[2], 16);
      assert(prevTs < curTs || (prevTs === curTs && prevCnt < curCnt));
      prevTs = curTs;
      prevCnt = curCnt;
    }
  });

  it("sets random bits randomly (this may fail at 0.001% probability)", function () {
    // count '1' in each bit
    const bins = new Array(160).fill(0);
    for (const e of samples) {
      for (let i = 0; i < 10; i++) {
        const n = parseInt(e.substring(4 * i, 4 * i + 4), 16);
        for (let j = 0; j < 16; j++) {
          const mask = 0x8000 >>> j;
          if (n & mask) {
            bins[16 * i + j]++;
          }
        }
      }
    }

    // test if random bits are set to 1 at ~50% probability
    // set margin based on binom dist 99.999% confidence interval
    const n = samples.length;
    const margin = 4.417173 * Math.sqrt((0.5 * 0.5) / n);
    for (let i = 64; i < bins.length; i++) {
      const p = bins[i] / n;
      assert(Math.abs(p - 0.5) < margin, `random bit ${i}: ${p}`);
    }
  });
});
