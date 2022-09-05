import { faBan, faCheck, faChevronLeft, faCopy, faExclamationCircle, faExclamationTriangle, faFolderOpen, faTerminal, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
import { Link } from 'react-router-dom';

const base10UnitPrefixes = ["", "K", "M", "G", "T"];

function niceNumber(f) {
    return (Math.round(f * 10) / 10.0) + '';
}

function toDecimalUnitString(f, thousand, prefixes, suffix) {
    for (var i = 0; i < prefixes.length; i++) {
        if (f < 0.9 * thousand) {
            return niceNumber(f) + ' ' + prefixes[i] + suffix;
        }
        f /= thousand
    }

    return niceNumber(f) + ' ' + prefixes[prefixes.length - 1] + suffix;
}

export function sizeWithFailures(size, summ) {
    if (size === undefined) {
        return "";
    }

    if (!summ || !summ.errors || !summ.numFailed) {
        return <span>{sizeDisplayName(size)}</span>
    }

    let caption = "Encountered " + summ.numFailed + " errors:\n\n";
    let prefix = "- "
    if (summ.numFailed === 1) {
        caption = "Error: ";
        prefix = "";
    }

    caption += summ.errors.map(x => prefix + x.path + ": " + x.error).join("\n");

    return <span>
        {sizeDisplayName(size)}&nbsp;
        <FontAwesomeIcon color="red" icon={faExclamationTriangle} title={caption} />
    </span>;
}

export function sizeDisplayName(s) {
    if (s === undefined) {
        return "";
    }
    return toDecimalUnitString(s, 1000, base10UnitPrefixes, "B");
}

export function intervalDisplayName(v) {
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
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
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
    if (n.startsWith("k")) {
        return "/snapshots/dir/" + n;
    }
    return "/api/v1/objects/" + n;
}

export function ownerName(s) {
    return s.userName + "@" + s.host;
}

export function compare(a, b) {
    return (a < b ? -1 : (a > b ? 1 : 0));
}

export function redirectIfNotConnected(e) {
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
export function formatMilliseconds(ms, useMultipleUnits = false) {
    if (useMultipleUnits) {
        return formatMillisecondsUsingMultipleUnits(ms);
    }

    return Math.round(ms / 100.0) / 10.0 + "s"
}

export function formatDuration(from, to, useMultipleUnits = false) {
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

export function taskStatusSymbol(task) {
    const st = task.status;
    const dur = formatDuration(task.startTime, task.endTime);
    const durMultiUnit = formatDuration(task.startTime, task.endTime, true);

    switch (st) {
        case "RUNNING":
            return <>
                <Spinner animation="border" variant="primary" size="sm" /> Running for {dur}
                &nbsp;
                <FontAwesomeIcon size="sm" color="red" icon={faWindowClose} title="Cancel task" onClick={() => cancelTask(task.id)} />
            </>;

        case "SUCCESS":
            return <p title={dur}><FontAwesomeIcon icon={faCheck} color="green" /> Finished in {durMultiUnit}</p>;

        case "FAILED":
            return <p title={dur}><FontAwesomeIcon icon={faExclamationCircle} color="red" /> Failed after {durMultiUnit}</p>;

        case "CANCELED":
            return <p title={dur}><FontAwesomeIcon icon={faBan} /> Canceled after {durMultiUnit}</p>;

        default:
            return st;
    }
}

export function cancelTask(tid) {
    axios.post('/api/v1/tasks/' + tid + '/cancel', {}).then(result => {
    }).catch(error => {
    });
}

export function GoBackButton(props) {
    return <Button size="sm" variant="outline-secondary" {...props}><FontAwesomeIcon icon={faChevronLeft} /> Return </Button>;
}

export function PolicyTypeName(s) {
    if (!s.host && !s.userName) {
        return "Global Policy"
    }

    if (!s.userName) {
        return "Host: " + s.host;
    }

    if (!s.path) {
        return "User: " + s.userName + "@" + s.host;
    }

    return "Directory: " + s.userName + "@" + s.host + ":" + s.path;
}

export function policyEditorURL(s) {
    return '/policies/edit?' + sourceQueryStringParams(s);
}

export function PolicyEditorLink(s) {
    return <Link to={policyEditorURL(s)}>{PolicyTypeName(s)}</Link>;
}

export function sourceQueryStringParams(src) {
    return 'userName=' + encodeURIComponent(src.userName) + '&host=' + encodeURIComponent(src.host) + '&path=' + encodeURIComponent(src.path);
}

export function isAbsolutePath(p) {
    // Unix-style path.
    if (p.startsWith("/")) {
        return true;
    }

    // Windows-style X:\... path.
    if (p.length >= 3 && p.substring(1, 3) === ":\\") {
        const letter = p.substring(0, 1).toUpperCase();

        return letter >= "A" && letter <= "Z";
    }

    // Windows UNC path.
    if (p.startsWith("\\\\")) {
        return true;
    }

    return false;
}

export function errorAlert(err, prefix) {
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

export function DirectorySelector(props) {
    let { onDirectorySelected, ...inputProps } = props;

    if (!window.kopiaUI) {
        return <Form.Control size="sm" {...inputProps} />
    }

    return <InputGroup>
        <FormControl size="sm" {...inputProps} />
        <Button size="sm" onClick={() => window.kopiaUI.selectDirectory(onDirectorySelected)}>
            <FontAwesomeIcon icon={faFolderOpen} />
        </Button>
    </InputGroup>;
}

export function CLIEquivalent(props) {
    let [visible, setVisible] = useState(false);
    let [cliInfo, setCLIInfo] = useState({});

    if (visible && !cliInfo.executable) {
        axios.get('/api/v1/cli').then(result => {
            setCLIInfo(result.data);
        }).catch(error => { });
    }

    const ref = React.createRef()

    function copyToClibopard() {
        const el = ref.current;
        if (!el) {
            return
        }

        el.select();
        el.setSelectionRange(0, 99999);

        document.execCommand("copy");
    }


    return <>
        <InputGroup size="sm" >
            <Button size="sm" title="Click to show CLI equivalent" variant="warning" onClick={() => setVisible(!visible)}><FontAwesomeIcon size="sm" icon={faTerminal} /></Button>
            {visible && <Button class="sm" variant="outline-dark" title="Copy to clipboard" onClick={copyToClibopard} ><FontAwesomeIcon size="sm" icon={faCopy} /></Button>}
            {visible && <FormControl size="sm" ref={ref} className="cli-equivalent" value={`${cliInfo.executable} ${props.command}`} />}
        </InputGroup>
    </>;
}

export function toAlgorithmOption(x, defaultID) {
    let text = x.id;

    if (x.id === defaultID) {
        text = x.id + " (RECOMMENDED)";
    }

    if (x.deprecated) {
        text = x.id + " (NOT RECOMMENDED)";
    }

    return <option key={x.id} value={x.id}>{text}</option>;
}
