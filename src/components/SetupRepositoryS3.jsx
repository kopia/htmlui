import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../forms';
import { OptionalField } from '../forms/OptionalField';
import { RequiredBoolean } from '../forms/RequiredBoolean';
import { RequiredField } from '../forms/RequiredField';
import i18n from '../utils/i18n';

export class SetupRepositoryS3 extends Component {
    constructor(props) {
        super();

        this.state = {
            "doNotUseTLS": false,
            "doNotVerifyTLS": false,
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["bucket", "endpoint", "accessKeyID", "secretAccessKey"])
    }

    render() {
        return <>
            <Row>
                {RequiredField(this, i18n.t('feedback.provider.s3.bucket-name'), "bucket", { autoFocus: true, placeholder: i18n.t('feedback.provider.s3.bucket-name-hint') })}
                {RequiredField(this, i18n.t('feedback.provider.s3.server-endpoint'), "endpoint", { placeholder: i18n.t('feedback.provider.s3.server-endpoint-hint') })}
                {OptionalField(this, i18n.t('feedback.provider.s3.override-region'), "region", { placeholder: i18n.t('feedback.provider.s3.override-region-hint') })}
            </Row>
            <br/>
            <Row>
                {RequiredBoolean(this, i18n.t('value.provider.s3.http-connection-insecure'), "doNotUseTLS")}
                {RequiredBoolean(this, i18n.t('value.provider.s3.no-tls-verification'), "doNotVerifyTLS")}
            </Row>
            <br/>
            <Row>
                {RequiredField(this, i18n.t('feedback.provider.s3.access-key-id'), "accessKeyID", { placeholder: i18n.t('feedback.provider.s3.access-key-id-hint') })}
                {RequiredField(this, i18n.t('feedback.provider.s3.secret-access-key'), "secretAccessKey", { placeholder: i18n.t('feedback.provider.s3.secret-access-key-hint'), type: "password" })}
                {OptionalField(this, i18n.t('feedback.provider.s3.session-token'), "sessionToken", { placeholder: i18n.t('feedback.provider.s3.session-token-hint'), type: "password" })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.provider.s3.object-name-prefix'), "prefix", { placeholder: i18n.t('feedback.provider.s3.enter-object-name-prefix-hint') })}
            </Row>
        </>;
    }
}
