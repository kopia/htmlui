import {
  formatMilliseconds,
  separateMillisecondsIntoMagnitudes,
  formatMagnitudesUsingMultipleUnits,
  sizeDisplayName,
  parseQuery,
  rfc3339TimestampForDisplay,
  objectLink,
  formatOwnerName,
  compare,
  formatDuration,
} from "../../src/utils/formatutils";

describe("formatMilliseconds", () => {
  it("uses 'XXs' format by default", () => {
    expect(formatMilliseconds(1)).toBe("0.0s"); // 1ms
    expect(formatMilliseconds(1_000)).toBe("1.0s"); // 1s
    expect(formatMilliseconds(60_000)).toBe("60.0s"); // 1m
    expect(formatMilliseconds(3600_000)).toBe("3,600.0s"); // 1h
    expect(formatMilliseconds(86400_000)).toBe("86,400.0s"); // 1d
  });

  it("uses multi-unit format if flag is set", () => {
    expect(formatMilliseconds(1, true)).toBe("0.0s");
    expect(formatMilliseconds(1_000, true)).toBe("1.0s");
    expect(formatMilliseconds(60_000, true)).toBe("1m");
    expect(formatMilliseconds(3600_000, true)).toBe("1h");
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

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 10,
    };
    expect(fn(magnitudes)).toBe("0.0 seconds");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 100,
    };
    expect(fn(magnitudes)).toBe("0.1 seconds");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("0.9 seconds");
  });

  it("represents durations (1 second <= T < 10 seconds) using seconds (fractional)", () => {
    magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 1, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1.0 seconds");

    magnitudes = { days: 0, hours: 0, minutes: 0, seconds: 1, milliseconds: 1 };
    expect(fn(magnitudes)).toBe("1.0 seconds");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      milliseconds: 10,
    };
    expect(fn(magnitudes)).toBe("1.0 seconds");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      milliseconds: 100,
    };
    expect(fn(magnitudes)).toBe("1.1 seconds");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 9,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("9.9 seconds");
  });

  it("represents durations (10 seconds <= T < 1 minute) using seconds (integer)", () => {
    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 10,
      milliseconds: 0,
    };
    expect(fn(magnitudes)).toBe("10 seconds");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 10,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("10 seconds");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 11,
      milliseconds: 0,
    };
    expect(fn(magnitudes)).toBe("11 seconds");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 59,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("59 seconds");
  });

  it("represents durations (1 minute <= T < 1 hour) using minutes (integer) and seconds (integer)", () => {
    magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1 minute");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 1,
      seconds: 0,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("1 minute");

    magnitudes = { days: 0, hours: 0, minutes: 1, seconds: 1, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1 minute 1 second");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 1,
      seconds: 0,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("1 minute");

    magnitudes = {
      days: 0,
      hours: 0,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("59 minutes 59 seconds");
  });

  it("represents durations (1 hour <= T < 1 day) using hours (integer) and minutes (integer)", () => {
    magnitudes = { days: 0, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1 hour");

    magnitudes = {
      days: 0,
      hours: 1,
      minutes: 0,
      seconds: 59,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("1 hour 59 seconds");

    magnitudes = { days: 0, hours: 1, minutes: 1, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1 hour 1 minute");

    magnitudes = {
      days: 0,
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("23 hours 59 minutes 59 seconds");
  });

  it("represents durations (T >= 1 day) using multiple units", () => {
    magnitudes = { days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1 day");

    magnitudes = {
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 59,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("1 day 59 seconds");

    magnitudes = { days: 1, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1 day 1 hour");

    magnitudes = { days: 1, hours: 1, minutes: 1, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1 day 1 hour 1 minute");

    magnitudes = {
      days: 365,
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    };
    expect(fn(magnitudes)).toBe("365 days 23 hours 59 minutes 59 seconds");
  });

  it("uses localized number formatting", () => {
    magnitudes = {
      days: 1000,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };
    expect(fn(magnitudes)).toBe("1,000 days");

    magnitudes = {
      days: 1000,
      hours: 1000,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };
    expect(fn(magnitudes)).toBe("1,000 days 1,000 hours");
  });

  it("uses correct singular vs. plural unit names", () => {
    magnitudes = { days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1 day");

    magnitudes = { days: 1, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("1 day 1 hour");

    magnitudes = { days: 2, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("2 days");

    magnitudes = { days: 2, hours: 2, minutes: 0, seconds: 0, milliseconds: 0 };
    expect(fn(magnitudes)).toBe("2 days 2 hours");

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

describe("sizeDisplayName", () => {
  it("returns empty string for undefined size", () => {
    expect(sizeDisplayName(undefined)).toBe("");
  });

  it("formats size in base 10 by default", () => {
    expect(sizeDisplayName(0)).toBe("0 B");
    expect(sizeDisplayName(500)).toBe("500 B");
    expect(sizeDisplayName(1000)).toBe("1 KB");
    expect(sizeDisplayName(1500)).toBe("1.5 KB");
    expect(sizeDisplayName(1000000)).toBe("1 MB");
    expect(sizeDisplayName(1500000000)).toBe("1.5 GB");
  });

  it("formats size in base 2 when specified", () => {
    expect(sizeDisplayName(0, true)).toBe("0 B");
    expect(sizeDisplayName(512, true)).toBe("512 B");
    expect(sizeDisplayName(1024, true)).toBe("1 KiB");
    expect(sizeDisplayName(1536, true)).toBe("1.5 KiB");
    expect(sizeDisplayName(1048576, true)).toBe("1 MiB");
    expect(sizeDisplayName(1610612736, true)).toBe("1.5 GiB");
  });
});

describe("parseQuery", () => {
  it("parses empty query string", () => {
    expect(parseQuery("")).toEqual({ "": "" });
  });

  it("parses query string with question mark prefix", () => {
    expect(parseQuery("?foo=bar&baz=qux")).toEqual({
      foo: "bar",
      baz: "qux",
    });
  });

  it("parses query string without question mark prefix", () => {
    expect(parseQuery("foo=bar&baz=qux")).toEqual({
      foo: "bar",
      baz: "qux",
    });
  });

  it("handles URL encoded values", () => {
    expect(parseQuery("name=John%20Doe&email=test%40examplehost")).toEqual({
      name: "John Doe",
      email: "test@examplehost",
    });
  });

  it("handles missing values", () => {
    expect(parseQuery("foo&bar=baz")).toEqual({
      foo: "",
      bar: "baz",
    });
  });
});

describe("rfc3339TimestampForDisplay", () => {
  it("returns empty string for falsy input", () => {
    expect(rfc3339TimestampForDisplay(null)).toBe("");
    expect(rfc3339TimestampForDisplay(undefined)).toBe("");
    expect(rfc3339TimestampForDisplay("")).toBe("");
  });

  it("formats valid timestamp", () => {
    const timestamp = "2023-12-25T10:30:00Z";
    const result = rfc3339TimestampForDisplay(timestamp);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    // Don't test exact format since it depends on locale
  });
});

describe("objectLink", () => {
  it("returns snapshot directory link for objects starting with 'k'", () => {
    expect(objectLink("k123abc")).toBe("/snapshots/dir/k123abc");
  });

  it("returns snapshot directory link for objects starting with 'Ik'", () => {
    expect(objectLink("Ik123abc")).toBe("/snapshots/dir/Ik123abc");
  });

  it("returns API object link for other objects", () => {
    expect(objectLink("abc123")).toBe("/api/v1/objects/abc123");
    expect(objectLink("x123abc")).toBe("/api/v1/objects/x123abc");
  });
});

describe("formatOwnerName", () => {
  it("formats owner name correctly", () => {
    const source = {
      userName: "john",
      host: "examplehost",
    };
    expect(formatOwnerName(source)).toBe("john@examplehost");
  });
});

describe("compare", () => {
  it("returns negative for a < b", () => {
    expect(compare(1, 2)).toBe(-1);
    expect(compare("a", "b")).toBe(-1);
  });

  it("returns positive for a > b", () => {
    expect(compare(2, 1)).toBe(1);
    expect(compare("b", "a")).toBe(1);
  });

  it("returns zero for a === b", () => {
    expect(compare(1, 1)).toBe(0);
    expect(compare("a", "a")).toBe(0);
  });
});

describe("formatDuration", () => {
  it("returns empty string for missing from time", () => {
    expect(formatDuration(null)).toBe("");
    expect(formatDuration(undefined)).toBe("");
  });

  it("returns empty string for negative duration", () => {
    const from = new Date("2023-01-01T12:00:00Z").toISOString();
    const to = new Date("2023-01-01T11:00:00Z").toISOString();
    expect(formatDuration(from, to)).toBe("");
  });

  it("calculates duration between two times", () => {
    const from = new Date("2023-01-01T12:00:00Z").toISOString();
    const to = new Date("2023-01-01T12:01:30Z").toISOString();
    expect(formatDuration(from, to)).toBe("90.0s");
  });

  it("uses current time when to is not provided", () => {
    const from = new Date(Date.now() - 5000).toISOString();
    const result = formatDuration(from);
    expect(result).toMatch(/^[45]\.\ds$/);
  });

  it("formats using multiple units when requested", () => {
    const from = new Date("2023-01-01T12:00:00Z").toISOString();
    const to = new Date("2023-01-01T12:01:30Z").toISOString();
    expect(formatDuration(from, to, true)).toBe("1m 30s");
  });
});
