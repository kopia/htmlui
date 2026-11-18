import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from ".";
import i18n from "../utils/i18n";
import { localizedLabel, localizedProps } from "../utils/localization";

export function RequiredField(component, label, name, props = {}, helpText = null) {
  return (
    <Form.Group as={Col}>
      <Form.Label className="required">{localizedLabel(label)}</Form.Label>
      <Form.Control
        size="sm"
        isInvalid={stateProperty(component, name, null) === ""}
        name={name}
        value={stateProperty(component, name)}
        data-testid={"control-" + name}
        onChange={component.handleChange}
        {...localizedProps(props)}
      />
      {helpText && <Form.Text className="text-muted">{localizedLabel(helpText)}</Form.Text>}
      <Form.Control.Feedback type="invalid">{i18n.t("common:validation.required")}</Form.Control.Feedback>
    </Form.Group>
  );
}
