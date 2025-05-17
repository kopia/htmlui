import React from 'react';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';

export function WideValueColumn(props) {
    return <Col xs={12} sm={4} className="policyValue">{props.children}</Col>;
}

WideValueColumn.propTypes = {
    children: PropTypes.node,
};