import React from 'react';
import Row from 'react-bootstrap/Row';
import { makeRequiredField } from '../../forms';
import { WithControls } from './WithControls';
import { Provider } from './Providers';

export const SetupToken: React.FC<{ provider: Provider }> = ({ provider }) => {
    const tokenField = makeRequiredField("Token", "token");

    const fields = [tokenField];

    return <WithControls provider={provider} fields={fields}>
        <Row>
            {tokenField.render({ autoFocus: true, type: "password", placeholder: "paste connection token" })}
        </Row>
    </WithControls>;
}
