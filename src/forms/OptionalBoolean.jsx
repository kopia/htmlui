import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

import { stateProperty } from ".";
import i18n from "../utils/i18n";
import { localizedLabel } from "../utils/localization";

function optionalBooleanValue(target) {
  if (target.value === "true") {
    return true;
  }
  if (target.value === "false") {
    return false;
  }

  return undefined;
}

export function OptionalBoolean(component, label, name, defaultLabel) {
  return (
    <Form.Group as={Col}>
      {label && <Form.Label>{localizedLabel(label)}</Form.Label>}
      <Form.Control
        size="sm"
        name={name}
        value={stateProperty(component, name)}
        onChange={(e) => component.handleChange(e, optionalBooleanValue)}
        as="select"
      >
        <option value="">{localizedLabel(defaultLabel)}</option>
        <option value="true">{i18n.t("common:yes")}</option>
        <option value="false">{i18n.t("common:no")}</option>
      </Form.Control>
    </Form.Group>
  );
}
