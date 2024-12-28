import React, { Component } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { handleChange, validateRequiredFields } from '../../forms';
import { RequiredField } from '../../forms/RequiredField';
import { NotificationFormatSelector } from './NotificationFormatSelector';

export class PushoverNotificationMethod extends Component {
    constructor(props) {
        super();

        this.state = {
            format: "txt",
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        if (!validateRequiredFields(this, ["appToken","userKey"])) {
            return false;
        }

        return true;
    }

    render() {
        return <>
            <Row>
                {RequiredField(this, "Pushover App Token", "appToken", { autoFocus: true })}
                {RequiredField(this, "Recipient User Key or Group Key", "userKey", { })}
                {NotificationFormatSelector(this, "format")}
            </Row>
            <Row>
                <Col xs={12}>
                <hr/>
                <p>Go to <a href="https://pushover.net/" target="_blank" rel="noopener noreferrer">Pushover.net</a> to setup your App Token and retrieve User or Group Keys.</p>
                </Col>
            </Row>
        </>;
    }
}
