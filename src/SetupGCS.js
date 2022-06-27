import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import { handleChange, OptionalField, RequiredField, validateRequiredFields } from './forms';


export class SetupGCS extends Component {
    constructor(props) {
        super();

        this.state = {
            ...props.initial
        };
        this.handleChange = handleChange.bind(this);
    }

    validate() {
        return validateRequiredFields(this, ["bucket"])
    }

    render() {
        return <>
            <Row>
                To use Google Cloud Storage with Kopia, you need a JSON credentials file that gives Kopia access to your Google Cloud Storage account. The easiest way to generate such a file is by using a Google Cloud Storage Service account. If you have trouble generating this credentials file, you can alternatively connect to Google Cloud Storage through Kopia's Amazon S3 option, because Google Cloud Storage is S3-compatible. See <a href="https://kopia.io/docs/repositories/#google-cloud-storage" target="_blank">Kopia help docs</a> for more information on both these options. 
            </Row>
            <Row>
                <Col>&nbsp;</Col>
            </Row>
            <Row>
                {RequiredField(this, "GCS Bucket", "bucket", { autoFocus: true, placeholder: "enter bucket name" })}
                {OptionalField(this, "Object Name Prefix", "prefix", { placeholder: "enter object name prefix or leave empty", type: "password" })}
            </Row>
            <Row>
                {OptionalField(this, "Credentials File", "credentialsFile", { placeholder: "enter name of credentials JSON file" })}
            </Row>
            <Row>
                {OptionalField(this, "Credentials JSON", "credentials", { placeholder: "paste JSON credentials here", as: "textarea", rows: 5 })}
            </Row>
        </>;
    }
}
