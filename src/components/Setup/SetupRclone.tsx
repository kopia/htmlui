import React from 'react';
import Row from 'react-bootstrap/Row';
import { makeRequiredField } from '../../forms';
import { WithControls } from './WithControls';
import { Provider } from './Providers';
import { makeOptionalField } from 'src/forms/RequiredFieldHook';

export const SetupRclone: React.FC<{ provider: Provider }> = ({ provider }) => {
    const remotePathField = makeRequiredField("Rclone Remote Path", "remotePath");
    const rcloneExeField = makeOptionalField("rclone executable", "rcloneExe");

    const fields = [remotePathField, rcloneExeField];

    return <WithControls provider={provider} fields={fields}>
        <Row>
            {remotePathField.render({ autoFocus: true, placeholder: "enter <name-of-rclone-remote>:<path>" })}
        </Row>
        <Row>
            {rcloneExeField.render({ placeholder: "enter path to rclone executable" })}
        </Row>
    </WithControls>;
}
