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
                {RequiredField(this, i18n.t('validation.provider.host'), "host", { autoFocus: true, placeholder: i18n.t('validation.provider.host-hint') })}
                {RequiredField(this, i18n.t('validation.provider.user'), "username", { placeholder: i18n.t('validation.provider.user-hint') })}
                {OptionalNumberField(this, i18n.t('validation.provider.port'), "port", { placeholder: i18n.t('validation.provider.port-hint') })}
            </Row>
            <br />
            <Row>
                {RequiredField(this, i18n.t('validation.provider.path'), "path", { placeholder: i18n.t('validation.provider.path-hint') })}
            </Row>
            <br />
            {!this.state.externalSSH && <>
                <Row>
                    {OptionalField(this, i18n.t('validation.password'), "password", { type: "password", placeholder: i18n.t('validation.password-hint') })}
                </Row>
                <br />
                <Row>
                    {OptionalField(this, i18n.t('validation.provider.path-key-file'), "keyfile", { placeholder: i18n.t('validation.provider.path-key-file-hint') })}
                    {OptionalField(this, i18n.t('validation.provider.path-host-file'), "knownHostsFile", { placeholder: i18n.t('validation.provider.path-host-file-hint') })}
                </Row>
                <br />
                <Row>
                    {OptionalField(this, i18n.t('validation.provider.key-data'), "keyData", {
                        placeholder: i18n.t('validation.provider.key-data-hint'),
                        as: "textarea",
                        rows: 5,
                        isInvalid: this.state.validated && !this.state.externalSSH && !hasExactlyOneOf(this, ["password", "keyfile", "keyData"]),
                    }, <Trans i18nKey={'feedback.provider.required-either-key-file'}/>)}
                    {OptionalField(this, i18n.t('validation.provider.known-host-data'), "knownHostsData", {
                        placeholder: i18n.t('validation.provider.known-host-data-hint'),
                        as: "textarea",
                        rows: 5,
                        isInvalid: this.state.validated && !this.state.externalSSH && !hasExactlyOneOf(this, ["knownHostsFile", "knownHostsData"]),
                    }, <Trans i18nKey={'feedback.provider.required-either-known-host-data'}/>)}
                </Row>
                <hr />
            </>}
            {RequiredBoolean(this, i18n.t('validation.provider.external-ssh-command'), "externalSSH", i18n.t('validation.provider.external-ssh-command-hint'))}
            <br/>
            {this.state.externalSSH && <><Row>
                {OptionalField(this, i18n.t('validation.provider.ssh-command'), "sshCommand", { placeholder: i18n.t('validation.provider.ssh-command-hint') })}
                {OptionalField(this, i18n.t('validation.provider.ssh-arguments'), "sshArguments", { placeholder: i18n.t('validation.provider.ssh-arguments-hint') })}
            </Row></>}

        </>;
    }
}
