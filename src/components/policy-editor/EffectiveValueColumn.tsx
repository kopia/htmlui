import React from "react";
import Col from "react-bootstrap/Col";
import PropTypes from "prop-types";

export function EffectiveValueColumn(props) {
  return (
    <Col xs={12} sm={4} className="policyEffectiveValue">
      {props.children}
    </Col>
  );
}

EffectiveValueColumn.propTypes = {
  children: PropTypes.node,
};
