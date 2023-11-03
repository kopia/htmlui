import { getDeepStateProperty, setDeepStateProperty } from '../utils/deepstate';

export function validateRequiredFields(component, fields) {
    let updateState = {};
    let failed = false;

    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];

        if (!component.state[field]) {
            // explicitly set field to empty string, component triggers validation error UI.
            updateState[field] = '';
            failed = true;
        }
    }

    if (failed) {
        component.setState(updateState);
        return false;
    }

    return true;
}

export function handleChange(event, valueGetter = x => x.value) {
    setDeepStateProperty(this, event.target.name, valueGetter(event.target));
}

export function stateProperty(component, name, defaultValue = "") {
    return getDeepStateProperty(component, name);
}

export function valueToNumber(t) {
    if (t.value === "") {
        return undefined;
    }

    const v = Number.parseInt(t.value);
    if (isNaN(v)) {
        return t.value + '';
    }

    return v;
}

export function isInvalidNumber(v) {
    if (v === undefined || v === '') {
        return false
    }

    if (isNaN(Number.parseInt(v))) {
        return true;
    }

    return false;
}
