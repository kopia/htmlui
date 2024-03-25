import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../forms';
import { RequiredField } from '../forms/RequiredField';
import { OptionalField } from '../forms/OptionalField';
import i18n from '../utils/i18n';

export class SetupRepositoryB2 extends Component {
    constructor(props) {
        super();

        this.state = {
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["bucket", "keyId", "key"])
    }

    render() {
        return <>
            <Row>
                {RequiredField(this, i18n.t('feedback.validation.b2.bucket-name'), "bucket", { autoFocus: true, placeholder: i18n.t('feedback.validation.b2.bucket-name-hint') })}
            </Row>
            <br/>
            <Row>
                {RequiredField(this, i18n.t('feedback.validation.b2.key-id'), "keyId", { placeholder: i18n.t('feedback.validation.b2.key-id-hint') })}
                {RequiredField(this, i18n.t('feedback.validation.b2.key'), "key", { placeholder: i18n.t('feedback.validation.b2.key-hint'), type: "password" })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.validation.b2.object-name-prefix'), "prefix", { placeholder: i18n.t('feedback.validation.b2.object-name-prefix-hint') })}
            </Row>
        </>;
    }
}
