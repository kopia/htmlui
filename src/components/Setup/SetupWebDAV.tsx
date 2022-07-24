import React from 'react';
import Row from 'react-bootstrap/Row';
import { makeOptionalField, makeRequiredField } from '../../forms';
import { WithControls } from './WithControls';
import { Provider } from './Providers';

export const SetupWebDAV: React.FC<{ provider: Provider }> = ({ provider }) => {
    const urlField = makeRequiredField("WebDAV Server URL", "url");
    const usernameField = makeOptionalField("Username", "username");
    const passwordField = makeOptionalField("Password", "password");

    const fields = [urlField, usernameField, passwordField];

    return <WithControls provider={provider} fields={fields}>
        <Row>
            {urlField.render({ autoFocus: true, placeholder: "http[s]://server:port/path" })}
        </Row>
        <Row>
            {usernameField.render({ placeholder: "enter username" })}
            {passwordField.render({ placeholder: "enter password", type: "password" })}
        </Row>
    </WithControls>;
}
