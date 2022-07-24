import React from 'react';
import Row from 'react-bootstrap/Row';
import { makeRequiredField } from '../../forms';
import { WithControls } from './WithControls';
import { Provider } from './Providers';
import { makeOptionalField } from 'src/forms/RequiredFieldHook';

export const SetupKopiaServer: React.FC<{ provider: Provider }> = ({ provider }) => {
    const urlField = makeRequiredField("Server address", "url");
    const certFingerprintField = makeOptionalField("Trusted server certificate fingerprint (SHA256)", "serverCertFingerprint");

    const fields = [urlField, certFingerprintField];

    return <WithControls provider={provider} fields={fields}>
        <Row>
            {urlField.render({ autoFocus: true, placeholder: "enter server URL (https://<host>:port)" })}
        </Row>
        <Row>
            {certFingerprintField.render({ placeholder: "enter trusted server certificate fingerprint printed at server startup" })}
        </Row>
    </WithControls>;
}
