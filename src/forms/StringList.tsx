import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from ".";

export function listToMultilineString(v) {
  if (v) {
    return v.join("\n");
  }

  return "";
}

export function multilineStringToList(target) {
  const v = target.value;
  if (v === "") {
    return undefined;
  }

  return v.split(/\n/);
}

export function StringList(component, name: string, props = {}) {
  return (
    <Form.Group as={Col}>
      <Form.Control
        size="sm"
        name={name}
        value={listToMultilineString(stateProperty(component, name))}
        onChange={(e) => component.handleChange(e, multilineStringToList)}
        as="textarea"
        rows="5"
        {...props}
      ></Form.Control>
    </Form.Group>
  );
}
