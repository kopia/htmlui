import React from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { stateProperty } from '.';

function listToMultilineString(v) {
    if (v) {
        return v.join("\n");
    }

    return "";
}

function multilineStringToList(target) {
    const v = target.value;
    if (v === "") {
        return undefined;
    }

    return v.split(/\n/);
}

export function StringList(component, name, props = {}) {
    return <Form.Group as={Col}>
        <Form.Control
            size="sm"
            name={name}
            value={listToMultilineString(stateProperty(component, name))}
            onChange={e => component.handleChange(e, multilineStringToList)}
            as="textarea"
            rows="5"
            {...props}>
        </Form.Control>
    </Form.Group>;
}
