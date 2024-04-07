import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../forms';
import { OptionalField } from '../forms/OptionalField';
import { RequiredField } from '../forms/RequiredField';
import i18n from '../utils/i18n';

export class SetupRepositoryRclone extends Component {
    constructor(props) {
        super();

        this.state = {
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["remotePath"])
    }

    render() {
        return <>
            <Row>
                {RequiredField(this, i18n.t('feedback.provider.rclone.rclone-remote-path'), "remotePath", { autoFocus: true, placeholder: i18n.t('feedback.provider.rclone.rclone-remote-path-hint') })}
            </Row>
            <br/>
            <Row>
                {OptionalField(this, i18n.t('feedback.provider.rclone.rclone-executable-path'), "rcloneExe", { placeholder: i18n.t('feedback.provider.rclone.rclone-executable-path-hint') })}
            </Row>
        </>;
    }
}
