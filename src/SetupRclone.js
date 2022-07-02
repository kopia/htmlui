import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, OptionalField, RequiredField, validateRequiredFields } from './forms';

export class SetupRclone extends Component {
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
                Rclone is a third-party program that allows you to manage files on various different storage providers. Kopia allows you to backup to all the storage providers that Rclone supports, but please note that Rclone support is experimental. In theory, all Rclone-supported storage providers should work with Kopia. However, in practice, only OneDrive, Google Drive, and Dropbox have been tested to work through Rclone with Kopia.
            </Row>
            <Row>
                You need to do the following before you try to connect to a storage provider through Rclone with Kopia: (1) download Rclone from <a href="https://rclone.org/" target="_blank" rel="noreferrer">https://rclone.org/</a> and (2) configure Rclone to setup a remote to the storage provider you want to use Kopia with: see <a href="https://rclone.org/docs/" target="_blank" rel="noreferrer">https://rclone.org/docs/</a> for directions. Once you have configured a Rclone remote, you have to create a Kopia repository for that Rclone remote by entering below (i) the path to the Rclone remote and (ii) the path to the Rclone executable you have on your machine. Once you have setup this repository in Kopia, Kopia will automatically launch Rclone when Rclone is needed; you do not need to do manage Rclone except you need to make sure to keep Rclone up-to-date -- see <a href="https://rclone.org/commands/rclone_selfupdate/" target="_blank" rel="noreferrer">https://rclone.org/commands/rclone_selfupdate/</a> for directions.
            </Row>
            <Row>
                &nbsp;
            </Row>
            <Row>
                {RequiredField(this, "Rclone Remote Path", "remotePath", { autoFocus: true, placeholder: "enter <name-of-rclone-remote>:<path>" })}
            </Row>
            <Row>
                {OptionalField(this, "Rclone Executable Path", "rcloneExe", { placeholder: "enter path to rclone executable" })}
            </Row>
        </>;
    }
}
