const base10UnitPrefixes = ['', 'K', 'M', 'G', 'T'];
const base2UnitPrefixes = ['', 'Ki', 'Mi', 'Gi', 'Ti'];

const niceNumber = (f: number) => Math.round(f * 10) / 10.0 + '';

const toUnitString = (
    num: number,
    divisor: number,
    prefixes: string[],
    suffix: string
) => {
    for (let i = 0; i < prefixes.length; i++) {
        if (num < 0.9 * divisor) {
            return niceNumber(num) + ' ' + prefixes[i] + suffix;
        }
        num /= divisor;
    }

    return niceNumber(num) + ' ' + prefixes[prefixes.length - 1] + suffix;
};

export const sizeDisplayName = (size?: number, bytesStringBase2?: boolean) => {
    if (size === undefined) return '';

    if (bytesStringBase2)
        return toUnitString(size, 1024, base2UnitPrefixes, 'B');

    return toUnitString(size, 1000, base10UnitPrefixes, 'B');
};

type Error = {
    path: string;
    error: string;
};
export type Summary = {
    errors: Error[];
    numFailed: number;
};
export const getErrorList = (summ?: Summary): string => {
    if (!summ?.errors?.length && !summ?.numFailed) return '';

    let caption = 'Encountered ' + summ.numFailed + ' errors:\n\n';
    let prefix = '- ';
    if (summ.numFailed === 1) {
        caption = 'Error: ';
        prefix = '';
    }

    caption += summ.errors
        .map((err: Error) => prefix + err.path + ': ' + err.error)
        .join('\n');

    return caption;
};
