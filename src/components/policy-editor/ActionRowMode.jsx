import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { stateProperty } from '../../forms';
import { LabelColumn } from './LabelColumn';
import { WideValueColumn } from './WideValueColumn';
import { EffectiveValue } from './EffectiveValue';
import i18n from '../../utils/i18n'

export function ActionRowMode(component, action) {
    return <Row>
        <LabelColumn name={i18n.t('feedback.policy.action.command-mode')} help={i18n.t('feedback.policy.command-mode-help')} />
        <WideValueColumn>
            <Form.Control as="select" size="sm"
                name={"policy." + action}
                onChange={component.handleChange}
                value={stateProperty(component, "policy." + action)}>
                <option value="essential">{i18n.t('value.policy.essential')}</option>
                <option value="optional">{i18n.t('value.policy.optional')}</option>
                <option value="async">{i18n.t('value.policy.async')}</option>
            </Form.Control>
        </WideValueColumn>
        {EffectiveValue(component, action)}
    </Row>;
}
