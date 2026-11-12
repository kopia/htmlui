import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from ".";
import { localizedLabel, localizedProps } from "../utils/localization";

export function OptionalField(component, label, name, props = {}, helpText = null) {
  return (
    <Form.Group as={Col}>
      <Form.Label>{localizedLabel(label)}</Form.Label>
      <Form.Control
        size="sm"
        name={name}
        value={stateProperty(component, name)}
        data-testid={"control-" + name}
        onChange={component.handleChange}
        {...localizedProps(props)}
      />
      {helpText && <Form.Text className="text-muted">{localizedLabel(helpText)}</Form.Text>}
    </Form.Group>
  );
}
