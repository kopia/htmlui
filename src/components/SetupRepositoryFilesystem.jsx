import React, { Component } from 'react';
import { handleChange, validateRequiredFields } from '../forms';
import { RequiredDirectory } from '../forms/RequiredDirectory';
import i18n from '../utils/i18n';

export class SetupRepositoryFilesystem extends Component {
    constructor(props) {
        super();

        this.state = {
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["path"])
    }

    render() {
        return <>
            {RequiredDirectory(this, i18n.t('feedback.provider.filesystem.directory-path'), "path", { autoFocus: true, placeholder: i18n.t('feedback.provider.filesystem.enter-directory-path')})}
        </>;
    }
}
