import React from 'react';
import Row from 'react-bootstrap/Row';
import { makeOptionalField, makeRequiredField } from '../../forms';
import { Provider } from './Providers';
import { WithControls } from './WithControls';

export const SetupB2: React.FC<{ provider: Provider }> = ({ provider }) => {
    const bucketField = makeRequiredField("B2 Bucket", "bucket");
    const keyIdField = makeRequiredField("Key ID", "keyId");
    const keyField = makeRequiredField("Key", "key");
    const prefixField = makeOptionalField( "Object Name Prefix", "prefix");

    const fields = [bucketField, keyIdField, keyField, prefixField];

    return <WithControls provider={provider} fields={fields}>
        <Row>
            {bucketField.render({ autoFocus: true, placeholder: "enter bucket name" })}
        </Row>
        <Row>
            {keyIdField.render({ placeholder: "enter application or account key ID" })}
            {keyField.render({ placeholder: "enter secret application or account key", type: "password" })}
        </Row>
        <Row>
            {prefixField.render( { placeholder: "enter object name prefix or leave empty" })}
        </Row>
    </WithControls>;
}
