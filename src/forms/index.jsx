import { getDeepStateProperty, setDeepStateProperty, setDeepStatePropertyReduce } from '../utils/deepstate';

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

/**
 * 
 * @param {*} state 
 * @param {*} action 
 * @returns 
 * The new state
 */
export function reducer(state, action) {
    switch (action.type) {
        case 'init': {
            return {
                ...action.data
            };
        }
        case 'update': {
            let updatedState = setDeepStatePropertyReduce(state, action);
            return {
                ...updatedState
            }
        }
        case 'set': {
            return {
                ...state,
                ...action.data
            }
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

/**
 * 
 * @param {The intial state to set} initialState 
 * @returns 
 * The initial state
 */
export function initState(initialState) {
    return initialState;
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
