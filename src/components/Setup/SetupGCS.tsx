import React from 'react';
import Row from 'react-bootstrap/Row';
import { makeOptionalField, makeRequiredField } from '../../forms';
import { Provider } from './Providers';
import { WithControls } from './WithControls';

export const SetupGCS: React.FC<{ provider: Provider }> = ({ provider }) => {
    const bucketField = makeRequiredField("GCS Bucket", "bucket");
    const prefixField = makeOptionalField("Object Name Prefix", "prefix");
    const credentialsFileField = makeOptionalField("Credentials File", "credentialsFile");
    const credentialsField = makeOptionalField("Credentials JSON", "credentials");

    const fields = [bucketField, prefixField, credentialsFileField, credentialsField];

    return <WithControls provider={provider} fields={fields}>
        <Row>
            {bucketField.render({ autoFocus: true, placeholder: "enter bucket name" })}
            {prefixField.render({ placeholder: "enter object name prefix or leave empty", type: "password" })}
        </Row>
        <Row>
            {credentialsFileField.render({ placeholder: "enter name of credentials JSON file" })}
        </Row>
        <Row>
            {credentialsField.render({ placeholder: "paste JSON credentials here", as: "textarea", rows: 5 })}
        </Row>
    </WithControls>;
}
