import React from "react";
import Col from "react-bootstrap/Col";
import PropTypes from "prop-types";
import { localizedLabel } from "../../utils/localization";

export function LabelColumn(props) {
  return (
    <Col xs={12} sm={4} className="policyFieldColumn">
      <span className="policyField">{localizedLabel(props.name)}</span>
      {props.help && (
        <>
          <p className="label-help">{localizedLabel(props.help)}</p>
        </>
      )}
    </Col>
  );
}

LabelColumn.propTypes = {
  name: PropTypes.string.isRequired,
  help: PropTypes.string,
};
