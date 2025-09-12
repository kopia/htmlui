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
      discord: false,
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
          <Col md="auto" className="d-flex align-items-end">
            <Form.Check 
              type="checkbox" 
              label="Discord" 
              checked={this.state.discord}
              onChange={(e) => {
                this.setState({ discord: e.target.checked });
              }}
              />
            </Col>
          </Row>

          <Row>
            <Form.Group as={Col}>
              <Form.Label className="required">HTTP Method</Form.Label>
              <Form.Control
                as="select"
                size="sm"
                name="method"
                onChange={(e) => this.handleChange(e)}
                value={this.state.discord ? "POST" : stateProperty(this, "method")}
                disabled={this.state.discord}
                className={this.state.discord ? "opacity-50" : ""}
              >
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </Form.Control>
            </Form.Group>
            {NotificationFormatSelector(this, "format", { lockPlainText: this.state.discord })}
        </Row>

        <Row>
          {OptionalField(
            this,
            "Additional Headers",
            "headers",
            { as: "textarea", rows: 5, disabled: this.state.discord, className: this.state.discord ? "opacity-50" : "" },
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
