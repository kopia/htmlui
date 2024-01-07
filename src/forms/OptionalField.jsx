import React from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { stateProperty } from '.';

export function OptionalField(component, label, name, props = {}, helpText = null) {
    return <Form.Group as={Col}>
        <Form.Label>{label}</Form.Label>
        <Form.Control
            size="sm"
            name={name}
            value={stateProperty(component, name)}
            data-testid={'control-' + name}
            onChange={component.handleChange}
            {...props} />
        {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
    </Form.Group>;
}
