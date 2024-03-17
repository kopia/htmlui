import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../forms';
import { OptionalField } from '../forms/OptionalField';
import { RequiredField } from '../forms/RequiredField';
import i18n from '../utils/i18n';

export class SetupRepositoryAzure extends Component {
    constructor(props) {
        super();

        this.state = {
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["container", "storageAccount"])
    }

    render() {
        return <>
            <Row>
                {RequiredField(this, i18n.t('feedback.validation.azure.container'), "container", { autoFocus: true, placeholder: i18n.t('feedback.validation.azure.container-hint') })}
                {OptionalField(this, i18n.t('feedback.validation.azure.object-name-prefix'), "prefix", { placeholder: i18n.t('feedback.validation.azure.object-name-prefix-hint') })}
            </Row>
            <Row>
                {RequiredField(this, i18n.t('feedback.validation.azure.storage-account'), "storageAccount", { placeholder: i18n.t('feedback.validation.azure.storage-account-hint') })}
                {OptionalField(this, i18n.t('feedback.validation.azure.access-key'), "storageKey", { placeholder: i18n.t('feedback.validation.azure.access-key-hint'), type: "password" })}
            </Row>
            <Row>
                {OptionalField(this, i18n.t('feedback.validation.azure.azure-storage-domain'), "storageDomain", { placeholder: i18n.t('feedback.validation.azure.azure-storage-domain-hint') })}
                {OptionalField(this, i18n.t('feedback.validation.azure.sas-token'), "sasToken", { placeholder: i18n.t('feedback.validation.azure.sas-token-hint'), type: "password" })}
            </Row>
        </>;
    }
}
