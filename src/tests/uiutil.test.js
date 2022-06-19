import { formatMilliseconds, separateMillisecondsIntoMultipleUnits, formatMultipleUnits } from "../uiutil";

describe("formatMilliseconds", () => {
    it("uses 'XXs' format by default", () => {
        expect(formatMilliseconds(        1)).toBe("0s");     // 1ms
        expect(formatMilliseconds(    1_000)).toBe("1s");     // 1s
        expect(formatMilliseconds(   60_000)).toBe("60s");    // 1m
        expect(formatMilliseconds( 3600_000)).toBe("3600s");  // 1h
        expect(formatMilliseconds(86400_000)).toBe("86400s"); // 1d
    });

    it("uses humanized format if flag is set", () => {
        expect(formatMilliseconds(        1, true)).toBe("0.0 seconds");
        expect(formatMilliseconds(    1_000, true)).toBe("1.0 seconds");
        expect(formatMilliseconds(   60_000, true)).toBe("1 minutes 0 seconds");
        expect(formatMilliseconds( 3600_000, true)).toBe("1 hours 0 minutes");
        expect(formatMilliseconds(86400_000, true)).toBe("1 days 0 hours");
    });
});

describe("separateMillisecondsIntoMultipleUnits", () => {
    // Concise alias for function-under-test.
    const fn = separateMillisecondsIntoMultipleUnits;

    it("handles 0 milliseconds", () => {
        expect(fn(0)).toMatchObject({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
        });
    });

    it("includes all units from days to milliseconds", () => {
        expect(fn(3601000)).toMatchObject({
            days: 0,
            hours: 1,
            minutes: 0,
            seconds: 1,
            milliseconds: 0,
        });
    });

    it("omits partial milliseconds from result", () => {
        expect(fn(100000123.999)).toMatchObject({
            days: 1,
            hours: 3,
            minutes: 46,
            seconds: 40,
            milliseconds: 123, // omits the partial millisecond (.999)
        });
    });
});

describe("formatMultipleUnits", () => {
    let magnitudes;

    // Concise alias for function-under-test.
    const fn = formatMultipleUnits;

    it("represents durations (T < 1 second) using seconds (fractional)", () => {
        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("0.0 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 1 };
        expect(fn(magnitudes)).toBe("0.0 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 10 };
        expect(fn(magnitudes)).toBe("0.0 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 100 };
        expect(fn(magnitudes)).toBe("0.1 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("1.0 seconds"); // input was < 1, but rounded value is 1
    });

    it("represents durations (1 second <= T < 10 seconds) using seconds (fractional)", () => {
        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 1, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1.0 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 1, milliseconds: 1 };
        expect(fn(magnitudes)).toBe("1.0 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 1, milliseconds: 10 };
        expect(fn(magnitudes)).toBe("1.0 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 1, milliseconds: 100 };
        expect(fn(magnitudes)).toBe("1.1 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 9, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("10.0 seconds"); // input was < 10, but rounded value is 10
    });

    it("represents durations (10 seconds <= T < 1 minute) using seconds (integer)", () => {
        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 10, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("10 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 10, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("10 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 11, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("11 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("59 seconds");
    });

    it("represents durations (1 minute <= T < 1 hour) using minutes (integer) and seconds (integer)", () => {
        magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 minutes 0 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 0, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("1 minutes 0 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 1, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 minutes 1 seconds");

        magnitudes = { days: 0, hours: 0, minutes: 59, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("59 minutes 59 seconds");
    });

    it("represents durations (1 hour <= T < 1 day) using hours (integer) and minutes (integer)", () => {
        magnitudes = { days: 0, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 hours 0 minutes");

        magnitudes = { days: 0, hours: 1, minutes: 0, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("1 hours 0 minutes");

        magnitudes = { days: 0, hours: 1, minutes: 1, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 hours 1 minutes");

        magnitudes = { days: 0, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("23 hours 59 minutes");
    });

    it("represents durations (T >= 1 day) using days (integer) and hours (integer)", () => {
        magnitudes = { days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 days 0 hours");

        magnitudes = { days: 1, hours: 0, minutes: 59, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("1 days 0 hours");

        magnitudes = { days: 1, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 days 1 hours");

        magnitudes = { days: 1, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("1 days 23 hours");

        magnitudes = { days: 7, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("7 days 0 hours"); // even a week uses units of days
    });
});