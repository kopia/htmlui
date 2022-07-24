import React from 'react';
import Row from 'react-bootstrap/Row';
import { makeBooleanField, makeOptionalField, makeRequiredField } from '../../forms';
import { Provider } from './Providers';
import { WithControls } from './WithControls';

export const SetupS3: React.FC<{ provider: Provider }> = ({ provider }) => {
    const bucketField = makeRequiredField("S3 Bucket", "bucket");
    const endpointField = makeRequiredField("Server Endpoint", "endpoint");
    const regionField = makeOptionalField("Override S3 Region", "region");
    const doNotUseTLSField = makeBooleanField("Use HTTP connection (insecure)", "doNotUseTLS"); // TODO: Boolean
    const doNotVerifyTLSField = makeBooleanField("Do not verify TLS certificate", "doNotVerifyTLS"); // TODO: Boolean
    const accessKeyIDField = makeRequiredField("Access Key ID", "accessKeyID");
    const secretAccessKeyField = makeRequiredField("Secret Access Key", "secretAccessKey");
    const sessionTokenField = makeOptionalField("Session Token", "sessionToken");
    const prefixField = makeOptionalField("Object Name Prefix", "prefix");

    const fields = [bucketField, endpointField, regionField, doNotUseTLSField, doNotVerifyTLSField, accessKeyIDField, secretAccessKeyField, sessionTokenField, prefixField];

    return <WithControls provider={provider} fields={fields}>
        <Row>
            {bucketField.render({ autoFocus: true, placeholder: "enter bucket name" })}
            {endpointField.render({ placeholder: "enter server address (e.g., s3.amazonaws.com)" })}
            {regionField.render({ placeholder: "enter specific region (e.g., us-west-1) or leave empty" })}
        </Row>
        <Row>
            {doNotUseTLSField.render({})}
            {doNotVerifyTLSField.render({})}
        </Row>
        <Row>
            {accessKeyIDField.render({ placeholder: "enter access key ID" })}
            {secretAccessKeyField.render({ placeholder: "enter secret access key", type: "password" })}
            {sessionTokenField.render({ placeholder: "enter session token or leave empty", type: "password" })}
        </Row>
        <Row>
            {prefixField.render({ placeholder: "enter object name prefix or leave empty" })}
        </Row>
    </WithControls>;
}
