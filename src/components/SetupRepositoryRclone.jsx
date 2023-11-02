import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../forms';
import { OptionalField } from '../forms/OptionalField';
import { RequiredField } from '../forms/RequiredField';

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
                {RequiredField(this, "Rclone Remote Path", "remotePath", { autoFocus: true, placeholder: "enter <name-of-rclone-remote>:<path>" })}
            </Row>
            <Row>
                {OptionalField(this, "Rclone Executable Path", "rcloneExe", { placeholder: "enter path to rclone executable" })}
            </Row>
        </>;
    }
}
