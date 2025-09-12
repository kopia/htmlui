import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from "../../forms";

export function NotificationFormatSelector(component, name, { lockPlainText = false }) {
  return (
    <Form.Group as={Col}>
      <Form.Label className="required">Notification Format</Form.Label>
      <Form.Control
        as="select"
        size="sm"
        name={name}
        onChange={(e) => component.handleChange(e)}
        value={lockPlainText ? "txt" : stateProperty(component, name)}
        className={lockPlainText ? "opacity-50" : ""}
        disabled={lockPlainText}
      >
        <option value="txt">Plain Text Format</option>
        <option value="html">HTML Format</option>
      </Form.Control>
    </Form.Group>
  );
}
