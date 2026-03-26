import React from "react";
import Form from "react-bootstrap/Form";
import { getDeepStateProperty } from "../../utils/deepstate";
import { EffectiveValueColumn } from "./EffectiveValueColumn";

export function EffectiveActionValue(component, policyField) {
  const dsp = getDeepStateProperty(component, "resolved.definition." + policyField, undefined);

  return (
    <EffectiveValueColumn>
      <Form.Group>
        <Form.Control
          data-testid={"effective-" + policyField}
          size="sm"
          value={getDeepStateProperty(component, "resolved.effective." + policyField, undefined)}
          readOnly={true}
          as="textarea"
          rows="5"
        />
        <Form.Text data-testid={"definition-" + policyField}>{component.PolicyDefinitionPoint(dsp)}</Form.Text>
      </Form.Group>
    </EffectiveValueColumn>
  );
}
