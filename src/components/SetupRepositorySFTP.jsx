import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields, stateProperty } from '../forms';
import { OptionalField } from '../forms/OptionalField';
import { OptionalNumberField } from '../forms/OptionalNumberField';
import { RequiredBoolean } from '../forms/RequiredBoolean';
import { RequiredField } from '../forms/RequiredField';
import i18n from '../utils/i18n';
import { Trans } from 'react-i18next';

function hasExactlyOneOf(component, names) {
    let count = 0;

    for (let i = 0; i < names.length; i++) {
        if (stateProperty(component, names[i])) {
            count++
        }
    }

    return count === 1;
}

export class SetupRepositorySFTP extends Component {
    constructor(props) {
        super();

        this.state = {
            port: 22,
            validated: false,
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        this.setState({
            validated: true,
        });

        if (!validateRequiredFields(this, ["host", "port", "username", "path"])) {
            return false;
        }

        if (this.state.externalSSH) {
            return true
        }

        if (!hasExactlyOneOf(this, ["password", "keyfile", "keyData"])) {
            return false;
        }

        if (!hasExactlyOneOf(this, ["knownHostsFile", "knownHostsData"])) {
            return false;
        }

        return true;
    }

    render() {
        return <>
            <Row>
                {RequiredField(this, i18n.t('feedback.provider.sftp.host'), "host", { autoFocus: true, placeholder: i18n.t('feedback.provider.sftp.enter-ssh-host-name') })}
                {RequiredField(this, i18n.t('feedback.provider.sftp.user'), "username", { placeholder: i18n.t('feedback.provider.sftp.user-name') })}
                {OptionalNumberField(this, i18n.t('feedback.provider.sftp.port'), "port", { placeholder: i18n.t('feedback.provider.sftp.port-number') })}
            </Row>
            <br />
            <Row>
                {RequiredField(this, i18n.t('feedback.provider.sftp.path'), "path", { placeholder: i18n.t('feedback.provider.sftp.enter-remote-path') })}
            </Row>
            <br />
            {!this.state.externalSSH && <>
                <Row>
                    {OptionalField(this, i18n.t('feedback.provider.sftp.password'), "password", { type: "password", placeholder: i18n.t('feedback.provider.sftp.enter-password') })}
                </Row>
                <br />
                <Row>
                    {OptionalField(this, i18n.t('feedback.provider.sftp.path-key-file'), "keyfile", { placeholder: i18n.t('feedback.provider.sftp.enter-path-to-key-file') })}
                    {OptionalField(this, i18n.t('feedback.provider.sftp.path-host-file'), "knownHostsFile", { placeholder: i18n.t('feedback.provider.sftp.enter-path-host-file') })}
                </Row>
                <br />
                <Row>
                    {OptionalField(this, i18n.t('feedback.provider.sftp-key-data'), "keyData", {
                        placeholder: i18n.t('feedback.provider.sftp-key-data-hint'),
                        as: "textarea",
                        rows: 5,
                        isInvalid: this.state.validated && !this.state.externalSSH && !hasExactlyOneOf(this, ["password", "keyfile", "keyData"]),
                    }, <Trans i18nKey={'feedback.provider.required-either-key-file'}/>)}
                    {OptionalField(this, i18n.t('feedback.provider.sftp.known-host-data'), "knownHostsData", {
                        placeholder: i18n.t('feedback.provider.sftp.paste-content-of-known-host'),
                        as: "textarea",
                        rows: 5,
                        isInvalid: this.state.validated && !this.state.externalSSH && !hasExactlyOneOf(this, ["knownHostsFile", "knownHostsData"]),
                    }, <Trans i18nKey={'feedback.provider.required-either-known-host-data'}/>)}
                </Row>
                <hr />
            </>}
            {RequiredBoolean(this, i18n.t('feedback.provider.sftp.launch-external-ssh-command'), "externalSSH", i18n.t('feedback.provider.sftp.launch-external-ssh-command-hint'))}
            <br/>
            {this.state.externalSSH && <><Row>
                {OptionalField(this, i18n.t('feedback.provider.sftp.ssh-command'), "sshCommand", { placeholder: i18n.t('feedback.provider.sftp.provide-passwordless-ssh-command') })}
                {OptionalField(this, i18n.t('feedback.provider.sftp.ssh-arguments'), "sshArguments", { placeholder: i18n.t('feedback.provider.sftp.enter-ssh-arguments') })}
            </Row></>}

        </>;
    }
}
