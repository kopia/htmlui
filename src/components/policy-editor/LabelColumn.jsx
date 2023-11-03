import React from 'react';
import Col from 'react-bootstrap/Col';

export function LabelColumn(props) {
    return <Col xs={12} sm={4} className="policyFieldColumn">
        <span className="policyField">{props.name}</span>
        {props.help && <><p className="label-help">{props.help}</p></>}
    </Col>;
}
