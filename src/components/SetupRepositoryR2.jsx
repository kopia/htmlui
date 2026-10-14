import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryR2 extends Component {
  constructor(props) {
    super();

    this.state = {
      jurisdiction: "default",
      doNotUseTLS: false,
      doNotVerifyTLS: false,
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["accountID", "bucket", "accessKeyID", "secretAccessKey"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Account ID", "accountID", {
            autoFocus: true,
            placeholder: "enter Cloudflare account ID",
          })}
          {RequiredField(this, "Bucket", "bucket", {
            placeholder: "enter bucket name",
          })}
          <Form.Group as={Col}>
            <Form.Label>Jurisdiction</Form.Label>
            <Form.Control
              as="select"
              size="sm"
              name="jurisdiction"
              value={this.state.jurisdiction}
              data-testid="control-jurisdiction"
              onChange={this.handleChange}
            >
              <option value="default">Default</option>
              <option value="eu">EU</option>
              <option value="fedramp">FedRAMP</option>
            </Form.Control>
          </Form.Group>
        </Row>
        <Row>
          {OptionalField(this, "Endpoint Override", "endpoint", {
            placeholder: "leave empty to derive from account ID",
          })}
          {OptionalField(this, "Object Name Prefix", "prefix", {
            placeholder: "enter object name prefix or leave empty",
          })}
        </Row>
        <Row>
          {RequiredBoolean(this, "Use HTTP connection (insecure)", "doNotUseTLS")}
          {RequiredBoolean(this, "Do not verify TLS certificate", "doNotVerifyTLS")}
        </Row>
        <Row>
          {RequiredField(this, "Access Key ID", "accessKeyID", {
            placeholder: "enter access key ID",
          })}
          {RequiredField(this, "Secret Access Key", "secretAccessKey", {
            placeholder: "enter secret access key",
            type: "password",
          })}
          {OptionalField(this, "Session Token", "sessionToken", {
            placeholder: "enter session token or leave empty",
            type: "password",
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryR2.propTypes = {
  initial: PropTypes.object,
};
