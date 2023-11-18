import React from 'react';
import Form from 'react-bootstrap/Form';
import { getDeepStateProperty } from '../../utils/deepstate';
import { EffectiveValueColumn } from "./EffectiveValueColumn";
import { TimesOfDayList } from '../../forms/TimesOfDayList';

export function EffectiveTimesOfDayValue(component, policyField) {
    return <EffectiveValueColumn>
        <Form.Group>
            {TimesOfDayList(component, "resolved.effective." + policyField)}
            <Form.Text data-testid={'definition-' + policyField}>
                {component.PolicyDefinitionPoint(getDeepStateProperty(component, "resolved.definition." + policyField, undefined))}
            </Form.Text>
        </Form.Group>
    </EffectiveValueColumn>;
}
