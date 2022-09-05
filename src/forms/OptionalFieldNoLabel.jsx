import React from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

import { stateProperty } from '.';

export function OptionalFieldNoLabel(component, label, name, props = {}, helpText = null, invalidFeedback = null) {
    return <Form.Group as={Col}>
        <Form.Control
            size="sm"
            name={name}
            value={stateProperty(component, name)}
            data-testid={'control-' + name}
            onChange={component.handleChange}
            {...props} />
        {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
        {invalidFeedback && <Form.Control.Feedback type="invalid">{invalidFeedback}</Form.Control.Feedback>}
    </Form.Group>;
}
