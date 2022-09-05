import React from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

import { stateProperty } from '.';

function optionalBooleanValue(target) {
    if (target.value === "true") {
        return true;
    }
    if (target.value === "false") {
        return false;
    }

    return undefined;
}

export function OptionalBoolean(component, label, name, defaultLabel) {
    return <Form.Group as={Col}>
        {label && <Form.Label>{label}</Form.Label>}
        <Form.Control
            size="sm"
            name={name}
            value={stateProperty(component, name)}
            onChange={e => component.handleChange(e, optionalBooleanValue)}
            as="select">
            <option value="">{defaultLabel}</option>
            <option value="true">yes</option>
            <option value="false">no</option>
        </Form.Control>
    </Form.Group>;
}
