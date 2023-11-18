import React from 'react';
import Row from 'react-bootstrap/Row';
import { LabelColumn } from './LabelColumn';
import { ValueColumn } from './ValueColumn';
import { EffectiveValueColumn } from './EffectiveValueColumn';

export function SectionHeaderRow() {
    return <Row>
        <LabelColumn />
        <ValueColumn><div className="policyEditorHeader">Defined</div></ValueColumn>
        <EffectiveValueColumn><div className="policyEditorHeader">Effective</div></EffectiveValueColumn>
    </Row>;
}
