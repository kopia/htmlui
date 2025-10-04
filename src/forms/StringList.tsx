import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from ".";
import { ComponentChangeHandling } from "src/components/types";

export function listToMultilineString(v: any): string {
  if (v) {
    return v.join("\n");
  }

  return "";
}

export function multilineStringToList(target: HTMLTextAreaElement): string[] | undefined {
  const v = target.value;
  if (v === "") {
    return undefined;
  }

  return v.split(/\n/);
}

export function StringList(component: ComponentChangeHandling, name: string, props = {}) {
  return (
    <Form.Group as={Col}>
      <Form.Control
        size="sm"
        name={name}
        value={listToMultilineString(stateProperty(component, name))}
        onChange={(e) => component.handleChange(e, multilineStringToList)}
        as="textarea"
        rows={5}
        {...props}
      ></Form.Control>
    </Form.Group>
  );
}
