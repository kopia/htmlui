import axios from 'axios';
import { Backend } from '../backend';

const base10UnitPrefixes = ["", "K", "M", "G", "T"];

function formatWithUnit(value: number, thousand: number, prefixes: string[], unit: string) {
    for (var i = 0; i < prefixes.length - 1; i++) {
        if (value < 0.9 * thousand) {
            break;
        }
        value /= thousand;
    }

    return (Math.round(value * 10) / 10.0) + ' ' + prefixes[i] + unit;
}

export function sizeToDisplayWithUnit(size: number | undefined) {
    if (size === undefined) {
        return "";
    }

    return formatWithUnit(size, 1000, base10UnitPrefixes, "B");
}

export function timesOfDayDisplayName(v: any[] | undefined) {
    if (!v) {
        return "(none)";
    }

    return v.length + " times";
}

export function parseQuery(queryString: string) {
    var query = new Map<string, string>();
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query.set(decodeURIComponent(pair[0]), decodeURIComponent(pair[1] || ''));
    }
    return query;
}

export function objectLink(n: string) {
    if (n.startsWith("k")) {
        return "/snapshots/dir/" + n;
    }
    return "/api/v1/objects/" + n;
}

export function formatOwner(source: Backend.SourceInfo) {
    return source.userName + "@" + source.host;
}

export function compare(a: any, b: any) {
    return (a < b ? -1 : (a > b ? 1 : 0));
}

export function redirectIfNotConnected(e: any) {
    if (e && e.response && e.response.data && e.response.data.code === "NOT_CONNECTED") {
        window.location.replace("/repo");
        return;
    }
}

/**
 * Convert a number of milliseconds into a string containing multiple units.
 * 
 * e.g. 90000 --> "1m 30s" or "1 minute 30 seconds"
 *
 * @param {number} ms - A duration (as a number of milliseconds).
 * @returns {string} A string representation of the duration.
 */
export function formatMillisecondsUsingMultipleUnits(ms: number) {
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
export function separateMillisecondsIntoMagnitudes(ms: number): Magnitudes {
    const magnitudes = {
        days: Math.trunc(ms / (1000 * 60 * 60 * 24)),
        hours: Math.trunc(ms / (1000 * 60 * 60)) % 24,
        minutes: Math.trunc(ms / (1000 * 60)) % 60,
        seconds: Math.trunc(ms / 1000) % 60,
        milliseconds: Math.trunc(ms) % 1000,
    };

    return magnitudes as Magnitudes;
}

export interface Magnitudes {
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number
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
export function formatMagnitudesUsingMultipleUnits(magnitudes: Magnitudes, abbreviateUnits = false) {
    let str;

    // Define the label we will use for each unit, depending upon whether that
    // unit's magnitude is `1` or not (e.g. "0 minutes" vs. "1 minute").
    // Note: This object is not used in the final "else" block below.
    const units = abbreviateUnits ? {
        days: magnitudes.days === 1 ? "d" : "d",
        hours: magnitudes.hours === 1 ? "h" : "h",
        minutes: magnitudes.minutes === 1 ? "m" : "m",
        seconds: magnitudes.seconds === 1 ? "s" : "s",
        milliseconds: magnitudes.milliseconds === 1 ? "ms" : "ms",
    } : {
        days: magnitudes.days === 1 ? " day" : " days",
        hours: magnitudes.hours === 1 ? " hour" : " hours",
        minutes: magnitudes.minutes === 1 ? " minute" : " minutes",
        seconds: magnitudes.seconds === 1 ? " second" : " seconds",
        milliseconds: magnitudes.milliseconds === 1 ? " millisecond" : " milliseconds",
    };

    // Format the duration, depending upon the magnitudes of its parts.
    if (magnitudes.days > 0) {
        str = `${magnitudes.days}${units.days} ${magnitudes.hours}${units.hours}`;
    } else if (magnitudes.hours > 0) {
        str = `${magnitudes.hours}${units.hours} ${magnitudes.minutes}${units.minutes}`;
    } else if (magnitudes.minutes > 0) {
        str = `${magnitudes.minutes}${units.minutes} ${magnitudes.seconds}${units.seconds}`;
    } else if (magnitudes.seconds >= 10) {
        str = `${magnitudes.seconds}${units.seconds}`;
    } else {
        // Combine the magnitudes into the equivalent total number of milliseconds.
        const ms = (
            magnitudes.milliseconds +
            magnitudes.seconds * 1000 +
            magnitudes.minutes * 60 * 1000 +
            magnitudes.hours * 60 * 60 * 1000 +
            magnitudes.days * 24 * 60 * 60 * 1000
        );

        // Convert into seconds and round to the nearest tenth of a second.
        // Given that the number always has a decimal place, use the "plural"
        // unit label, even if the number is `1.0`.
        const seconds = ms / 1000;
        str = `${seconds.toFixed(1)}${abbreviateUnits ? "s" : " seconds"}`;
    }

    return str;
}

/**
 * Convert a number of milliseconds into a formatted string, either
 * using multiple units (e.g. "1m 5s") or using seconds (e.g. "65.0s").
 * 
 * @param {number} ms - The number of milliseconds (i.e. some duration).
 * @param {boolean} useMultipleUnits - Whether you want to use multiple units.
 * @returns {string} The formatted string.
 */
export function formatMilliseconds(ms: number, useMultipleUnits = false) {
    if (useMultipleUnits) {
        return formatMillisecondsUsingMultipleUnits(ms);
    }

    return Math.round(ms / 100.0) / 10.0 + "s"
}

export function policyEditorURL(s: Backend.SourceInfo) {
    return `/policies/edit?${sourceQueryStringParams(s)}`;
}

export function sourceQueryStringParams(source: Backend.SourceInfo) {
    return `userName=${encodeURIComponent(source.userName)}&host=${encodeURIComponent(source.host)}&path=${encodeURIComponent(source.path)}`;
}

export function formatDuration(from: Backend.Time | undefined, to: Backend.Time | undefined, useMultipleUnits = false) {
    if (!from) {
        return "";
    }

    if (!to) {
        const ms = new Date().valueOf() - new Date(from).valueOf();
        if (ms < 0) {
            return ""
        }

        return formatMilliseconds(ms)
    }

    return formatMilliseconds(new Date(to).valueOf() - new Date(from).valueOf(), useMultipleUnits);
}

export function cancelTask(tid: string) {
    axios.post('/api/v1/tasks/' + tid + '/cancel', {}).then(result => {
    }).catch(error => {
    });
}

export function PolicyTypeName(source: Backend.SourceInfo) {
    if (!source.host && !source.userName) {
        return "Global Policy"
    }

    if (!source.userName) {
        return `Host: ${source.host}`;
    }

    if (!source.path) {
        return `User: ${source.userName}@${source.host}`;
    }

    return `Directory: ${source.userName}@${source.host}:${source.path}`;
}

export function isAbsolutePath(path: string) {
    // Unix-style path.
    if (path.startsWith("/")) {
        return true;
    }

    // Windows-style X:\... path.
    if (path.length >= 3 && path.substring(1, 3) === ":\\") {
        const letter = path.substring(0, 1).toUpperCase();

        return letter >= "A" && letter <= "Z";
    }

    // Windows UNC path.
    if (path.startsWith("\\\\")) {
        return true;
    }

    return false;
}

export function errorAlert(err: any, prefix: string | undefined) {
    if (!prefix) {
        prefix = "Error"
    }

    prefix += ": ";

    if (err.response && err.response.data && err.response.data.error) {
        alert(prefix + err.response.data.error);
    } else if (err instanceof Error) {
        alert(err);
    } else {
        alert(prefix + JSON.stringify(err));
    }
}
