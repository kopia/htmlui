import React from 'react';
import Col from 'react-bootstrap/Col';

export function EffectiveValueColumn(props) {
    return <Col xs={12} sm={4} className="policyEffectiveValue">{props.children}</Col>;
}
