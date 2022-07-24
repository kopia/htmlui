import React from 'react';
import Row from 'react-bootstrap/Row';
import { makeOptionalField, makeRequiredField } from '../../forms';
import { Provider } from './Providers';
import { WithControls } from './WithControls';

export const SetupAzure: React.FC<{ provider: Provider }> = ({ provider }) => {
    const containerField = makeRequiredField("Container", "container");
    const prefixField = makeOptionalField("Object Name Prefix", "prefix");
    const storageAccountField = makeRequiredField("Storage Account", "storageAccount");
    const storageKeyField = makeOptionalField("Access Key", "storageKey");
    const storageDomainField = makeOptionalField("Azure Storage Domain", "storageDomain");
    const sasTokenField = makeOptionalField("SAS Token", "sasToken");

    const fields = [containerField, prefixField, storageAccountField, storageKeyField, storageDomainField, sasTokenField];

    return <WithControls provider={provider} fields={fields}>
        <Row>
            {containerField.render({ autoFocus: true, placeholder: "enter container name" })}
            {prefixField.render({ placeholder: "enter object name prefix or leave empty" })}
        </Row>
        <Row>
            {storageAccountField.render({ placeholder: "enter access key ID" })}
            {storageKeyField.render({ placeholder: "enter secret access key", type: "password" })}
        </Row>
        <Row>
            {storageDomainField.render({ placeholder: "enter storage domain or leave empty for default 'blob.core.windows.net'" })}
            {sasTokenField.render({ placeholder: "enter secret SAS Token", type: "password" })}
        </Row>
    </WithControls>;
}
