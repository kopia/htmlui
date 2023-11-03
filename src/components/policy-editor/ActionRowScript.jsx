import React from 'react';
import Row from 'react-bootstrap/Row';
import { OptionalFieldNoLabel } from '../../forms/OptionalFieldNoLabel';
import { LabelColumn } from './LabelColumn';
import { WideValueColumn } from './WideValueColumn';
import { EffectiveValue } from './EffectiveValue';

export function ActionRowScript(component, action, name, help) {
    return <Row>
        <LabelColumn name={name} help={help} />
        <WideValueColumn>{OptionalFieldNoLabel(component, "", "policy." + action, {})}</WideValueColumn>
        {EffectiveValue(component, action)}
    </Row>;
}
