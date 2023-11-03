import { formatMilliseconds, separateMillisecondsIntoMagnitudes, formatMagnitudesUsingMultipleUnits } from "../utils/uiutil";

describe("formatMilliseconds", () => {
    it("uses 'XXs' format by default", () => {
        expect(formatMilliseconds(        1)).toBe("0.0s");     // 1ms
        expect(formatMilliseconds(    1_000)).toBe("1.0s");     // 1s
        expect(formatMilliseconds(   60_000)).toBe("60.0s");    // 1m
        expect(formatMilliseconds( 3600_000)).toBe("3,600.0s");  // 1h
        expect(formatMilliseconds(86400_000)).toBe("86,400.0s"); // 1d
    });

    it("uses multi-unit format if flag is set", () => {
        expect(formatMilliseconds(        1, true)).toBe("0.0s");
        expect(formatMilliseconds(    1_000, true)).toBe("1.0s");
        expect(formatMilliseconds(   60_000, true)).toBe("1m");
        expect(formatMilliseconds( 3600_000, true)).toBe("1h");
        expect(formatMilliseconds(86400_000, true)).toBe("1d");
    });
});

describe("separateMillisecondsIntoMagnitudes", () => {
    // Concise alias for function-under-test.
    const fn = separateMillisecondsIntoMagnitudes;

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

describe("formatMagnitudesUsingMultipleUnits", () => {
    let magnitudes;

    // Concise alias for function-under-test.
    const fn = formatMagnitudesUsingMultipleUnits;

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
        expect(fn(magnitudes)).toBe("1 minute");

        magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 0, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("1 minute");

        magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 1, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 minute 1 second");

        magnitudes = { days: 0, hours: 0, minutes: 59, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("59 minutes 59 seconds");
    });

    it("represents durations (1 hour <= T < 1 day) using hours (integer) and minutes (integer)", () => {
        magnitudes = { days: 0, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 hour");

        magnitudes = { days: 0, hours: 1, minutes: 0, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("1 hour 59 seconds");

        magnitudes = { days: 0, hours: 1, minutes: 1, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 hour 1 minute");

        magnitudes = { days: 0, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("23 hours 59 minutes 59 seconds");
    });

    it("represents durations (T >= 1 day) using multiple units", () => {
        magnitudes = { days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 day");

        magnitudes = { days: 1, hours: 0, minutes: 59, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("1 day 59 minutes 59 seconds");

        magnitudes = { days: 1, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 day 1 hour");

        magnitudes = { days: 1, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 };
        expect(fn(magnitudes)).toBe("1 day 23 hours 59 minutes 59 seconds");

        magnitudes = { days: 7, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("7 days"); // even a week uses units of days
    });

    it("uses localized number formatting", () => {
        magnitudes = { days: 1000, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1,000 days");

        magnitudes = { days: 1234567, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1,234,567 days");
    })

    it("uses correct singular vs. plural unit names", () => {
        magnitudes = { days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 day");

        magnitudes = { days: 1, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 day 1 hour");

        magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 minute");

        magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 1, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1 minute 1 second");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 1, milliseconds: 0 };
        expect(fn(magnitudes)).toBe("1.0 seconds"); // plural, since it includes decimal places

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 1 };
        expect(fn(magnitudes)).toBe("0.0 seconds");
    });

    it("uses abbreviated unit names when caller requests it", () => {
        magnitudes = { days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes, true)).toBe("1d");

        magnitudes = { days: 1, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes, true)).toBe("1d 1h");

        magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 0, milliseconds: 0 };
        expect(fn(magnitudes, true)).toBe("1m");

        magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 1, milliseconds: 0 };
        expect(fn(magnitudes, true)).toBe("1m 1s");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 1, milliseconds: 0 };
        expect(fn(magnitudes, true)).toBe("1.0s");

        magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 1 };
        expect(fn(magnitudes, true)).toBe("0.0s");
    });    
});
