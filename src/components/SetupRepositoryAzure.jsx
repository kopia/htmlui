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
                {RequiredField(this, i18n.t('feedback.provider.azure.container'), "container", { autoFocus: true, placeholder: i18n.t('feedback.provider.azure.enter-container-name') })}
                {OptionalField(this, i18n.t('feedback.provider.azure.object-name-prefix'), "prefix", { placeholder: i18n.t('feedback.provider.azure.enter-object-name-prefix') })}
            </Row>
            <br/>
            <Row>
                {RequiredField(this, i18n.t('feedback.provider.azure.storage-account'), "storageAccount", { placeholder: i18n.t('feedback.provider.azure.enter-storage-account') })}
                {OptionalField(this, i18n.t('feedback.provider.azure.access-key'), "storageKey", { placeholder: i18n.t('feedback.provider.azure.enter-access-key'), type: "password" })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.provider.azure.azure-storage-domain'), "storageDomain", { placeholder: i18n.t('feedback.provider.azure.enter-azure-storage-domain') })}
                {OptionalField(this, i18n.t('feedback.provider.azure.sas-token'), "sasToken", { placeholder: i18n.t('feedback.provider.azure.enter-sas-token'), type: "password" })}
            </Row>
        </>;
    }
}
