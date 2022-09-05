import React from 'react';
import Form from 'react-bootstrap/Form';
import { valueToNumber, stateProperty } from '.';

export function LogDetailSelector(component, name) {
    return <Form.Control as="select" size="sm"
        name={name}
        onChange={e => component.handleChange(e, valueToNumber)}
        value={stateProperty(component, name)}>
        <option value="">(inherit from parent)</option>
        <option value="0">0 - no output</option>
        <option value="1">1 - minimal details</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5 - normal details</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10 - maximum details</option>
    </Form.Control>;
}
