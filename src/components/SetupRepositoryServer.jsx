import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../forms';
import { OptionalField } from '../forms/OptionalField';
import { RequiredField } from '../forms/RequiredField';
import i18n from '../utils/i18n';

export class SetupRepositoryServer extends Component {
    constructor(props) {
        super();

        this.state = {
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["url"])
    }

    render() {
        return <>
            <Row>
                {RequiredField(this, i18n.t('feedback.provider.repositoryserver.server-address'), "url", { autoFocus: true, placeholder: i18n.t('feedback.provider.repositoryserver.enter-server-url') })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.provider.repositoryserver.server-certificate-fingerprint'), "serverCertFingerprint", { placeholder: i18n.t('feedback.provider.repositoryserver.enter-server-certificate-fingerprint') })}
            </Row>
        </>;
    }
}
