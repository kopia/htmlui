import React from "react";
import Col from "react-bootstrap/Col";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export function LabelColumn(props) {
  const { t } = useTranslation("labels");
  const localizedLabel = (value) =>
    typeof value === "string" ? t(value, { defaultValue: value }) : value;

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
