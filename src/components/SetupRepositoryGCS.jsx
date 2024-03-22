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
                {RequiredField(this, i18n.t('feedback.validation.gcs.bucket-name'), "bucket", { autoFocus: true, placeholder: i18n.t('feedback.validation.gcs.bucket-name-hint') })}
                {OptionalField(this, i18n.t('feedback.validation.gcs.object-name-prefix'), "prefix", { placeholder: i18n.t('feedback.validation.gcs.object-name-prefix-hint'), type: "password" })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.validation.gcs.credentials-file'), "credentialsFile", { placeholder: i18n.t('feedback.validation.gcs.credentials-file-hint') })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.validation.gcs.credentials-json'), "credentials", { placeholder: i18n.t('feedback.validation.gcs.credentials-json-paste'), as: "textarea", rows: 5 })}
            </Row>
        </>;
    }
}
