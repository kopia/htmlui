import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { SetStateAction } from 'react';

export function RequiredFieldHook(state: [string | undefined, React.Dispatch<SetStateAction<string | undefined>>], label: string, name: string, props = {}, helpText = null) {
    const [stateValue, setStateValue] = state;

    return <Form.Group as={Col}>
        <Form.Label className="required">{label}</Form.Label>
        <Form.Control
            size="sm"
            isInvalid={stateValue === undefined || stateValue === null || stateValue.trim() === ''}
            name={name}
            value={stateValue}
            data-testid={'control-' + name}
            onChange={value => {
                console.log(value);
                setStateValue(value.target.value);
            }}
            {...props} />
        {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
        <Form.Control.Feedback type="invalid">Required field</Form.Control.Feedback>
    </Form.Group>
}