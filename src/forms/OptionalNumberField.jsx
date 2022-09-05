import React from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { isInvalidNumber, stateProperty, valueToNumber } from '.';

export function OptionalNumberField(component, label, name, props = {}) {
    return <Form.Group as={Col}>
        {label && <Form.Label>{label}</Form.Label>}
        <Form.Control
            size="sm"
            name={name}
            isInvalid={isInvalidNumber(stateProperty(component, name))}
            value={stateProperty(component, name)}
            onChange={e => component.handleChange(e, valueToNumber)}
            data-testid={'control-' + name}
            {...props} />
        <Form.Control.Feedback type="invalid">Must be a valid number or empty</Form.Control.Feedback>
    </Form.Group>;
}
