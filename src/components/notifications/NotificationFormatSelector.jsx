import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from "../../forms";
import i18n from "../../utils/i18n";

export function NotificationFormatSelector(component, name) {
  return (
    <Form.Group as={Col}>
      <Form.Label className="required">{i18n.t("notifications:format")}</Form.Label>
      <Form.Control
        as="select"
        size="sm"
        name={name}
        onChange={(e) => component.handleChange(e)}
        value={stateProperty(component, name)}
      >
        <option value="txt">{i18n.t("notifications:formatText")}</option>
        <option value="html">{i18n.t("notifications:formatHtml")}</option>
      </Form.Control>
    </Form.Group>
  );
}
