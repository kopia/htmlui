import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../forms';
import { OptionalField } from '../forms/OptionalField';
import { RequiredField } from '../forms/RequiredField';
import i18n from '../utils/i18n';

export class SetupRepositoryWebDAV extends Component {
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
                {RequiredField(this, i18n.t('feedback.provider.webdav.server-url'), "url", { autoFocus: true, placeholder: "http[s]://server:port/path" })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.provider.webdav.username'), "username", { placeholder: i18n.t('feedback.provider.webdav.enter-username') })}
                {OptionalField(this, i18n.t('feedback.provider.webdav.password'), "password", { placeholder: i18n.t('feedback.provider.webdav.enter-password'), type: "password" })}
            </Row>
        </>;
    }
}
