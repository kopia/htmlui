import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from ".";
import { localizedLabel } from "../utils/localization";

function checkedToBool(t) {
  if (t.checked) {
    return true;
  }

  return false;
}

export function RequiredBoolean(component, label, name, helpText) {
  return (
    <Form.Group as={Col}>
      <Form.Check
        label={localizedLabel(label)}
        name={name}
        className="required"
        checked={stateProperty(component, name)}
        onChange={(e) => component.handleChange(e, checkedToBool)}
        data-testid={"control-" + name}
        type="checkbox"
      />
      {helpText && <Form.Text className="text-muted">{localizedLabel(helpText)}</Form.Text>}
    </Form.Group>
  );
}
