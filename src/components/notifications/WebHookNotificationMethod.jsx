import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import { handleChange, validateRequiredFields, stateProperty } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";
import { OptionalField } from "../../forms/OptionalField";
import { NotificationFormatSelector } from "./NotificationFormatSelector";
import PropTypes from "prop-types";
export class WebHookNotificationMethod extends Component {
  constructor(props) {
    super();

    this.state = {
      format: "txt",
      method: "POST",
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    if (!validateRequiredFields(this, ["endpoint"])) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "URL Endpoint", "endpoint", { autoFocus: true })}
          <Form.Group as={Col}>
            <Form.Label className="required">HTTP Method</Form.Label>
            <Form.Control
              as="select"
              size="sm"
              name="method"
              onChange={(e) => this.handleChange(e)}
              value={stateProperty(this, "method")}
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
            </Form.Control>
          </Form.Group>
          {NotificationFormatSelector(this, "format")}
        </Row>
        <Row>
          {OptionalField(
            this,
            "Additional Headers",
            "headers",
            { as: "textarea", rows: 5 },
            "Enter one header per line in the format 'Header: Value'.",
          )}
        </Row>
      </>
    );
  }
}

WebHookNotificationMethod.propTypes = {
  initial: PropTypes.object,
};
