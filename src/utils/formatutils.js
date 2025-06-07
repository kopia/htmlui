// locale to use for number formatting (undefined would use default locale, but we stick to EN for now)
const locale = "en-US";
const base10UnitPrefixes = ["", "K", "M", "G", "T"];
const base2UnitPrefixes = ["", "Ki", "Mi", "Gi", "Ti"];

function formatNumber(f) {
  return Math.round(f * 10) / 10.0 + "";
}

function toDecimalUnitString(f, thousand, prefixes, suffix) {
  for (var i = 0; i < prefixes.length; i++) {
    if (f < 0.9 * thousand) {
      return formatNumber(f) + " " + prefixes[i] + suffix;
    }
    f /= thousand;
  }

  return formatNumber(f) + " " + prefixes[prefixes.length - 1] + suffix;
}

export function sizeDisplayName(size, bytesStringBase2) {
  if (size === undefined) {
    return "";
  }
  if (bytesStringBase2) {
    return toDecimalUnitString(size, 1024, base2UnitPrefixes, "B");
  }
  return toDecimalUnitString(size, 1000, base10UnitPrefixes, "B");
}

export function intervalDisplayName() {
  return "-";
}

export function timesOfDayDisplayName(v) {
  if (!v) {
    return "(none)";
  }
  return v.length + " times";
}

export function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === "?" ? queryString.substr(1) : queryString).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}

export function rfc3339TimestampForDisplay(n) {
  if (!n) {
    return "";
  }

  let t = new Date(n);
  return t.toLocaleString();
}

export function objectLink(n) {
  if (n.startsWith("k") || n.startsWith("Ik")) {
    return "/snapshots/dir/" + n;
  }
  return "/api/v1/objects/" + n;
}

export function formatOwnerName(s) {
  return s.userName + "@" + s.host;
}

export function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Convert a number of milliseconds into a string containing multiple units.
 *
 * e.g. 90000 --> "1m 30s" or "1 minute 30 seconds"
 *
 * @param {number} ms - A duration (as a number of milliseconds).
 * @returns {string} A string representation of the duration.
 */
export function formatMillisecondsUsingMultipleUnits(ms) {
  const magnitudes = separateMillisecondsIntoMagnitudes(ms);
  const str = formatMagnitudesUsingMultipleUnits(magnitudes, true);
  return str;
}

/**
 * Separate a duration into integer magnitudes of multiple units which,
 * when combined together, equal the original duration (minus any partial
 * milliseconds, if the original duration included any partial milliseconds).
 *
 * e.g. 100000123.999 --> 1 day 3 hours 46 minutes 40 seconds 123 milliseconds
 *
 * @param {number} ms - A duration (as a number of milliseconds).
 * @returns {object} An object having numeric properties named `days`, `hours`,
 *                   `minutes`, `seconds`, and `milliseconds`; whose values,
 *                   when combined together, represent the original duration
 *                   (minus any partial milliseconds).
 */
export function separateMillisecondsIntoMagnitudes(ms) {
  const magnitudes = {
    days: Math.trunc(ms / (1000 * 60 * 60 * 24)),
    hours: Math.trunc(ms / (1000 * 60 * 60)) % 24,
    minutes: Math.trunc(ms / (1000 * 60)) % 60,
    seconds: Math.trunc(ms / 1000) % 60,
    milliseconds: Math.trunc(ms) % 1000,
  };

  return magnitudes;
}

/**
 * Format a duration in terms of the largest unit having a non-zero magnitude,
 * together with the next largest unit (e.g. hours --> hours and minutes),
 * disregarding all smaller units (i.e. truncate, as opposed to round).
 *
 * There are some exceptions, which are listed below.
 *
 * Exceptions:
 * 1. If the largest unit having a non-zero magnitude is `seconds` and the
 *    magnitude is at least 10, format it as an integer number of seconds.
 * 2. If the largest unit having a non-zero magnitude is `seconds` and the
 *    magnitude is less than 10, or if the largest unit having a non-zero
 *    magnitude is `milliseconds`, format it as a fractional number of seconds.
 *
 * @param {object} magnitudes - An object having numeric properties named
 *                              `days`, `hours`, `minutes`, `seconds`, and
 *                              `milliseconds`; whose values, when combined
 *                              together, represent a duration.
 * @param {boolean} abbreviateUnits - Whether you want to use short unit names.
 * @returns {string} Formatted string representing the specified duration.
 */
export function formatMagnitudesUsingMultipleUnits(magnitudes, abbreviateUnits = false) {
  // Define the label we will use for each unit, depending upon whether that
  // unit's magnitude is `1` or not (e.g. "0 minutes" vs. "1 minute").
  // Note: This object is not used in the final "else" block below.
  const units = abbreviateUnits
    ? {
        days: "d",
        hours: "h",
        minutes: "m",
        seconds: "s",
      }
    : {
        days: magnitudes.days === 1 ? " day" : " days",
        hours: magnitudes.hours === 1 ? " hour" : " hours",
        minutes: magnitudes.minutes === 1 ? " minute" : " minutes",
        seconds: magnitudes.seconds === 1 ? " second" : " seconds",
      };

  // Format the duration, depending upon the magnitudes of its parts.
  const parts = [];
  if (magnitudes.days) {
    parts.push(`${magnitudes.days.toLocaleString(locale)}${units.days}`);
  }
  if (magnitudes.hours) {
    parts.push(`${magnitudes.hours.toLocaleString(locale)}${units.hours}`);
  }
  if (magnitudes.minutes) {
    parts.push(`${magnitudes.minutes.toLocaleString(locale)}${units.minutes}`);
  }
  if (!parts.length || magnitudes.seconds || (magnitudes.milliseconds && magnitudes.seconds < 10 && !parts.length)) {
    // Convert seconds and ms into seconds
    let seconds = magnitudes.seconds;
    let fractionDigits = 0;

    // add ms only if duration is < 10s
    if (seconds < 10 && !parts.length) {
      seconds += magnitudes.milliseconds / 1000;
      fractionDigits = 1;
    }

    // `toFixed()` doesn't support localization, use `toLocaleString()` instead
    // Given that the number always has a decimal place, use the "plural"
    // unit label, even if the number is `1.0`.
    parts.push(
      `${seconds.toLocaleString(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
        roundingMode: "trunc",
      })}${fractionDigits ? (abbreviateUnits ? "s" : " seconds") : units.seconds}`,
    );
  }

  return parts.join(" ");
}

/**
 * Convert a number of milliseconds into a formatted string, either
 * using multiple units (e.g. "1m 5s") or using seconds (e.g. "65.0s").
 *
 * @param {number} ms - The number of milliseconds (i.e. some duration).
 * @param {boolean} useMultipleUnits - Whether you want to use multiple units.
 * @returns {string} The formatted string.
 */
export function formatMilliseconds(ms, useMultipleUnits = false) {
  if (useMultipleUnits) {
    return formatMillisecondsUsingMultipleUnits(ms);
  }

  // return Math.round(ms / 100.0) / 10.0 + "s"
  // always show one fraction digit, to avoid layout changes every 0.5 sec for running tasks
  // `toFixed()` doesn't support localization, use `toLocaleString()` instead
  return (
    (ms / 1000.0).toLocaleString(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + "s"
  );
}

export function formatDuration(from, to, useMultipleUnits = false) {
  if (!from) {
    return "";
  }

  const ms = (to ? new Date(to) : new Date()).valueOf() - new Date(from).valueOf();
  if (ms < 0) {
    return "";
  }

  return formatMilliseconds(ms, useMultipleUnits);
}
