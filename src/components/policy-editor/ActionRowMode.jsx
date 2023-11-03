import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { stateProperty } from '../../forms';
import { LabelColumn } from './LabelColumn';
import { WideValueColumn } from './WideValueColumn';
import { EffectiveValue } from './EffectiveValue';

export function ActionRowMode(component, action) {
    return <Row>
        <LabelColumn name="Command Mode" help="Essential (must succeed; default behavior), optional (failures are tolerated), or async (Kopia will start the action but not wait for it to finish)" />
        <WideValueColumn>
            <Form.Control as="select" size="sm"
                name={"policy." + action}
                onChange={component.handleChange}
                value={stateProperty(component, "policy." + action)}>
                <option value="essential">must succeed</option>
                <option value="optional">ignore failures</option>
                <option value="async">run asynchronously, ignore failures</option>
            </Form.Control>
        </WideValueColumn>
        {EffectiveValue(component, action)}
    </Row>;
}
