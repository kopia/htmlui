import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../forms';
import { RequiredField } from '../forms/RequiredField';
import i18n from '../utils/i18n';

export class SetupRepositoryToken extends Component {
    constructor(props) {
        super();

        this.state = {
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["token"])
    }

    render() {
        return <>
            <Row>
                {RequiredField(this, i18n.t('feedback.provider.repositorytoken.token'), "token", { autoFocus: true, type: "password", placeholder: i18n.t('feedback.provider.repositorytoken.paste-token') })}
            </Row>
        </>;
    }
}
