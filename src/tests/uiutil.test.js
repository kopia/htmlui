import { formatMilliseconds } from "../uiutil";

describe("formatMilliseconds", () => {
    it("uses 'XXs' format by default", () => {
        expect(formatMilliseconds(        1)).toBe("0s");     // 1ms
        expect(formatMilliseconds(    1_000)).toBe("1s");     // 1s
        expect(formatMilliseconds(   60_000)).toBe("60s");    // 1m
        expect(formatMilliseconds( 3600_000)).toBe("3600s");  // 1h
        expect(formatMilliseconds(86400_000)).toBe("86400s"); // 1d
    });

    it("uses humanized format if flag is set", () => {
        // Exactly 1ms, 1s, 1m, 1h, 1d:
        expect(formatMilliseconds(        1, true)).toBe("a few seconds");
        expect(formatMilliseconds(    1_000, true)).toBe("a few seconds");
        expect(formatMilliseconds(   60_000, true)).toBe("a minute");
        expect(formatMilliseconds( 3600_000, true)).toBe("an hour");
        expect(formatMilliseconds(86400_000, true)).toBe("a day");

        // Edge cases (and some non-edge cases):
        expect(formatMilliseconds(        1, true)).toBe("a few seconds");
        expect(formatMilliseconds(   44_499, true)).toBe("a few seconds");
        expect(formatMilliseconds(   44_500, true)).toBe("a minute");
        expect(formatMilliseconds(   89_999, true)).toBe("a minute");
        expect(formatMilliseconds(   90_000, true)).toBe("2 minutes");
        expect(formatMilliseconds(  149_999, true)).toBe("2 minutes");
        expect(formatMilliseconds(  150_000, true)).toBe("3 minutes");
        expect(formatMilliseconds( 1800_000, true)).toBe("30 minutes");
        expect(formatMilliseconds( 2400_000, true)).toBe("40 minutes");
        expect(formatMilliseconds( 2640_000, true)).toBe("44 minutes");
        expect(formatMilliseconds( 2669_999, true)).toBe("44 minutes");
        expect(formatMilliseconds( 2670_000, true)).toBe("an hour"); // 44m 30s
        expect(formatMilliseconds( 3200_000, true)).toBe("an hour");
    });
});