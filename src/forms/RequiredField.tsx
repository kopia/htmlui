import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from ".";
import { ComponentChangeHandling } from "src/components/types";

export function RequiredField(
  component: ComponentChangeHandling,
  label: string,
  name: string,
  props = {},
  helpText: string | null = null,
) {
  return (
    <Form.Group as={Col}>
      <Form.Label className="required">{label}</Form.Label>
      <Form.Control
        size="sm"
        isInvalid={stateProperty(component, name, null) === ""}
        name={name}
        value={stateProperty(component, name)}
        data-testid={"control-" + name}
        onChange={component.handleChange}
        {...props}
      />
      {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
      <Form.Control.Feedback type="invalid">Required field</Form.Control.Feedback>
    </Form.Group>
  );
}
