import React from 'react';
import Col from 'react-bootstrap/Col';

export function WideValueColumn(props) {
    return <Col xs={12} sm={4} className="policyValue">{props.children}</Col>;
}
