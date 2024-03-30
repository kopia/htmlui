import React from 'react';
import Row from 'react-bootstrap/Row';
import { OptionalNumberField } from '../../forms/OptionalNumberField';
import { LabelColumn } from './LabelColumn';
import { WideValueColumn } from './WideValueColumn';
import { EffectiveValue } from './EffectiveValue';
import i18n from '../../utils/i18n';

export function ActionRowTimeout(component, action) {
    return <Row>
        <LabelColumn name={i18n.t('feedback.policy.actions.timeout')} help={i18n.t('feedback.policy.timeout-help')} />
        <WideValueColumn>{OptionalNumberField(component, "", "policy." + action, {})}</WideValueColumn>
        {EffectiveValue(component, action)}
    </Row>;
}
