import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../forms';
import { OptionalField } from '../forms/OptionalField';
import { RequiredField } from '../forms/RequiredField';
import i18n from '../utils/i18n';

export class SetupRepositoryGCS extends Component {
    constructor(props) {
        super();

        this.state = {
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["bucket"])
    }

    render() {
        return <>
            <Row>
                {RequiredField(this, i18n.t('feedback.provider.gcs.bucket-name'), "bucket", { autoFocus: true, placeholder: i18n.t('feedback.provider.gcs.enter-bucket-name') })}
                {OptionalField(this, i18n.t('feedback.provider.gcs.object-name-prefix'), "prefix", { placeholder: i18n.t('feedback.provider.gcs.enter-object-name-prefix'), type: "password" })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.provider.gcs.credentials-file'), "credentialsFile", { placeholder: i18n.t('feedback.provider.gcs.enter-credentials-file-name') })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.provider.gcs.credentials-json'), "credentials", { placeholder: i18n.t('feedback.prodiver.gcs.paste-json-credentials'), as: "textarea", rows: 5 })}
            </Row>
        </>;
    }
}
