import React from 'react';
import Row from 'react-bootstrap/Row';
import { LabelColumn } from './LabelColumn';
import { ValueColumn } from './ValueColumn';
import { EffectiveValueColumn } from './EffectiveValueColumn';

export function SectionHeaderRow() {
    return <Row>
        <LabelColumn />
        <ValueColumn>
            <div className="policyEditorHeader">This Policy</div>
            <hr className="mt-1" />
        </ValueColumn>
        <EffectiveValueColumn>
            <div className="policyEditorHeader">Global Policy</div>
            <hr className="mt-1"/>
        </EffectiveValueColumn>
    </Row>;
}
