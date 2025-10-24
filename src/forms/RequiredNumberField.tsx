import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty, isInvalidNumber, valueToNumber } from ".";
import { ComponentChangeHandling } from "src/components/types";

export function RequiredNumberField(component: ComponentChangeHandling, label: string, name: string, props = {}) {
  return (
    <Form.Group as={Col}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        size="sm"
        name={name}
        isInvalid={stateProperty(component, name, null) === "" || isInvalidNumber(stateProperty(component, name))}
        value={stateProperty(component, name)}
        onChange={(e) => component.handleChange(e, valueToNumber)}
        data-testid={"control-" + name}
        {...props}
      />
      <Form.Control.Feedback type="invalid">Must be a valid number or empty</Form.Control.Feedback>
    </Form.Group>
  );
}
