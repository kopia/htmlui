import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import React, { SetStateAction, useEffect, useState } from 'react';
import { FormField } from './FormField';

const REQUIRED_FIELD = "Required field";

export function makeRequiredField(label: string, name: string, helpText: string | undefined = undefined, defaultValue: string | undefined = undefined, customValidator: ((value: string | undefined, requiredFullfilled: true | string) => true | string) | undefined = undefined): FormField {
    const [stateValue, setStateValue] = useState<string>();
    const [isValid, setIsValid] = useState<true | string>(REQUIRED_FIELD);

    useEffect(() => {
        if (defaultValue) {
            setStateValue(defaultValue);
        }
    }, []);

    useEffect(() => {
        const requiredFullfilled = (stateValue !== undefined && stateValue !== null && stateValue.trim() !== '') === true || REQUIRED_FIELD;
        if (customValidator !== undefined) {
            setIsValid(customValidator(stateValue, requiredFullfilled));
        } else {
            setIsValid(requiredFullfilled);
        }
    }, [stateValue]);

    return {
        name,
        value: stateValue || '',
        setValue: setStateValue,
        isRequired: true,
        isValid: isValid === true,
        render(props = {}) {
            return <RequiredField state={[stateValue, setStateValue, isValid]} label={label} name={name} props={props} helpText={helpText} />;
        },
    };
}

export function makeBooleanField(label: string, name: string, helpText: string | undefined = undefined, defaultValue: boolean = false, customValidator: ((value: boolean) => true | string) | undefined = undefined): FormField {
    const [stateValue, setStateValue] = useState<boolean>(defaultValue);
    const [isValid, setIsValid] = useState<true | string>(REQUIRED_FIELD);

    useEffect(() => {
        if (customValidator !== undefined) {
            setIsValid(customValidator(stateValue));
        } else {
            setIsValid(true);
        }
    }, [stateValue]);

    const failSetValue: React.Dispatch<SetStateAction<string | undefined>> = (action) => { throw new Error("Cannot set value") };

    return {
        name,
        value: `${stateValue}`,
        isRequired: true,
        setValue: failSetValue,
        isValid: isValid === true,
        render(props = {}) {
            return <BooleanField state={[stateValue, setStateValue, isValid]} label={label} name={name} props={props} helpText={helpText} />;
        },
    };
}

export function makeOptionalField(label: string, name: string, helpText: string | undefined = undefined, defaultValue: string | undefined = undefined, additonalValidator: ((value: string | undefined) => true | string) | undefined = undefined): FormField {
    const [stateValue, setStateValue] = useState<string>();
    const [isValid, setIsValid] = useState<true | string>(true);

    useEffect(() => {
        if (defaultValue) {
            setStateValue(defaultValue);
        }
    }, []);

    useEffect(() => {
        setIsValid((additonalValidator === undefined || additonalValidator(stateValue)));
    }, [stateValue]);

    return {
        name,
        value: stateValue || '',
        setValue: setStateValue,
        isRequired: false,
        isValid: isValid === true,
        render(props = {}) {
            return <OptionalField state={[stateValue, setStateValue]} label={label} name={name} props={props} helpText={helpText} invalidFeedback={isValid === true ? undefined : isValid} />;
        },
    };
}

const RequiredField: React.FC<{ state: [string | undefined, React.Dispatch<SetStateAction<string | undefined>>, true | string], label: string, name: string, props: object, helpText: string | undefined }> = ({ state, label, name, props = {}, helpText = undefined }) => {
    const [stateValue, setStateValue, isValid] = state;

    return <Form.Group as={Col}>
        <Form.Label className="required">{label}</Form.Label>
        <Form.Control
            size="sm"
            isInvalid={isValid !== true}
            name={name}
            defaultValue={stateValue}
            data-testid={'control-' + name}
            onChange={event => setStateValue(event.target.value)}
            {...props} />
        {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
        <Form.Control.Feedback type="invalid">{isValid}</Form.Control.Feedback>
    </Form.Group>
}

const BooleanField: React.FC<{ state: [boolean, React.Dispatch<SetStateAction<boolean>>, true | string], label: string, name: string, props: object, helpText: string | undefined }> = ({ state, label, name, props = {}, helpText = undefined }) => {
    const [stateValue, setStateValue, isValid] = state;

    return <Form.Group as={Col}>
        <Form.Check
            isInvalid={isValid !== true}
            label={label}
            name={name}
            className="required"
            checked={stateValue}
            onChange={event => setStateValue(event.target.checked)}
            data-testid={'control-' + name}
            type="checkbox" />
        {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
        <Form.Control.Feedback type="invalid">{isValid}</Form.Control.Feedback>
    </Form.Group>
}

const OptionalField: React.FC<{ state: [string | undefined, React.Dispatch<SetStateAction<string | undefined>>], label: string | undefined, name: string, props: object, helpText: string | undefined, invalidFeedback: string | undefined }> = ({ state, label, name, props = {}, helpText = undefined, invalidFeedback = undefined }) => {
    const [stateValue, setStateValue] = state;

    return <Form.Group as={Col}>
        {label && <Form.Label>{label}</Form.Label>}
        <Form.Control
            size="sm"
            name={name}
            defaultValue={stateValue}
            data-testid={'control-' + name}
            onChange={event => setStateValue(event.target.value)}
            autoComplete="off"
            {...props} />
        {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
        {invalidFeedback && <Form.Control.Feedback type="invalid">{invalidFeedback}</Form.Control.Feedback>}
    </Form.Group>
}