import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { SetStateAction, useEffect, useState } from 'react';

export interface FormField {
    value: string | undefined,
    isValid: boolean,
    render: (props: any) => JSX.Element
}

export function makeRequiredField(label: string, name: string, helpText: string | undefined = undefined, defaultValue: string | undefined = undefined): FormField {
    const [stateValue, setStateValue] = useState<string>();
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (defaultValue) {
            setStateValue(defaultValue);
        }
    }, []);

    useEffect(() => {
        setIsValid(stateValue !== undefined && stateValue !== null && stateValue.trim() !== '');
    }, [stateValue]);

    return {
        value: stateValue,
        isValid,
        render(props = {}) {
            return <RequiredField state={[stateValue, setStateValue, isValid]} label={label} name={name} props={props} helpText={helpText} />;
        },
    };
}

const RequiredField: React.FC<{ state: [string | undefined, React.Dispatch<SetStateAction<string | undefined>>, boolean], label: string, name: string, props: object, helpText: string | undefined }> = ({ state, label, name, props = {}, helpText = undefined }) => {
    const [stateValue, setStateValue, isValid] = state;

    return <Form.Group as={Col}>
        <Form.Label className="required">{label}</Form.Label>
        <Form.Control
            size="sm"
            isInvalid={!isValid}
            name={name}
            defaultValue={stateValue}
            data-testid={'control-' + name}
            onChange={event => setStateValue(event.target.value)}
            {...props} />
        {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
        <Form.Control.Feedback type="invalid">Required field</Form.Control.Feedback>
    </Form.Group>
}