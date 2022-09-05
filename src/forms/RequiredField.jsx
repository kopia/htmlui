import React from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { stateProperty } from '.';

export function RequiredField(component, label, name, props = {}, helpText = null) {
    return <Form.Group as={Col}>
        <Form.Label className="required">{label}</Form.Label>
        <Form.Control
            size="sm"
            isInvalid={stateProperty(component, name, null) === ''}
            name={name}
            value={stateProperty(component, name)}
            data-testid={'control-' + name}
            onChange={component.handleChange}
            {...props} />
        {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
        <Form.Control.Feedback type="invalid">Required field</Form.Control.Feedback>
    </Form.Group>;
}
