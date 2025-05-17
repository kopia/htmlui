import React from 'react';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';

export function LabelColumn(props) {
    return <Col xs={12} sm={4} className="policyFieldColumn">
        <span className="policyField">{props.name}</span>
        {props.help && <><p className="label-help">{props.help}</p></>}
    </Col>;
}

LabelColumn.propTypes = {
    name: PropTypes.string.isRequired,
    help: PropTypes.string,
};