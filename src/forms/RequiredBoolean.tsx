import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from ".";

function checkedToBool(t: HTMLInputElement): boolean {
  if (t.checked) {
    return true;
  }

  return false;
}

export function RequiredBoolean(component, label: string, name: string, helpText?: string) {
  return (
    <Form.Group as={Col}>
      <Form.Check
        label={label}
        name={name}
        className="required"
        checked={stateProperty(component, name)}
        onChange={(e) => component.handleChange(e, checkedToBool)}
        data-testid={"control-" + name}
        type="checkbox"
      />
      {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
    </Form.Group>
  );
}
