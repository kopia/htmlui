import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, OptionalField, RequiredBoolean, RequiredField, validateRequiredFields } from './forms';

export class SetupS3 extends Component {
    constructor(props) {
        super();

        this.state = {
            "doNotUseTLS": false,
            "doNotVerifyTLS": false,
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["bucket", "endpoint", "accessKeyID", "secretAccessKey"])
    }

    render() {
        return <>
            <Row>
                All S3-compatible providers are supported, including but not limited to Amazon S3, Wasabi, IDrive E2, MinIO, Backblaze B2, Oracle Cloud Infrastructure, Google Cloud Storage, and DigitalOcean Spaces.
            </Row>
            <Row>
                <Col>&nbsp;</Col>
            </Row>
            <Row>
                {RequiredField(this, "Bucket", "bucket", { autoFocus: true, placeholder: "enter bucket name" })}
                {RequiredField(this, "Server Endpoint", "endpoint", { placeholder: "enter server address (e.g., s3.amazonaws.com)" })}
                {OptionalField(this, "Override Region", "region", { placeholder: "enter specific region (e.g., us-west-1) or leave empty" })}
            </Row>
            <Row>
                {RequiredBoolean(this, "Use HTTP connection (insecure)", "doNotUseTLS")}
                {RequiredBoolean(this, "Do not verify TLS certificate", "doNotVerifyTLS")}
            </Row>
            <Row>
                {RequiredField(this, "Access Key ID", "accessKeyID", { placeholder: "enter access key ID" })}
                {RequiredField(this, "Secret Access Key", "secretAccessKey", { placeholder: "enter secret access key", type: "password" })}
                {OptionalField(this, "Session Token", "sessionToken", { placeholder: "enter session token or leave empty", type: "password" })}
            </Row>
            <Row>
                {OptionalField(this, "Object Name Prefix", "prefix", { placeholder: "enter object name prefix or leave empty" })}
            </Row>
        </>;
    }
}
