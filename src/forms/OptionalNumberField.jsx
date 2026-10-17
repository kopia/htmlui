import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { isInvalidNumber, stateProperty, valueToNumber } from ".";
import i18n from "../utils/i18n";
import { localizedLabel, localizedProps } from "../utils/localization";

export function OptionalNumberField(component, label, name, props = {}) {
  return (
    <Form.Group as={Col}>
      {label && <Form.Label>{localizedLabel(label)}</Form.Label>}
      <Form.Control
        size="sm"
        name={name}
        isInvalid={isInvalidNumber(stateProperty(component, name))}
        value={stateProperty(component, name)}
        onChange={(e) => component.handleChange(e, valueToNumber)}
        data-testid={"control-" + name}
        {...localizedProps(props)}
      />
      <Form.Control.Feedback type="invalid">{i18n.t("common:validation.number")}</Form.Control.Feedback>
    </Form.Group>
  );
}
