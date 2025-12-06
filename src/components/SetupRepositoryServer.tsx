import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";
import { ComponentChangeHandling, ChangeEventHandle } from "./types";
export class SetupRepositoryServer extends Component implements ComponentChangeHandling {
  handleChange: ChangeEventHandle;

  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["url"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Server address", "url", {
            autoFocus: true,
            placeholder: "enter server URL (https://<host>:port)",
          })}
        </Row>
        <Row>
          {OptionalField(this, "Trusted server certificate fingerprint (SHA256)", "serverCertFingerprint", {
            placeholder: "enter trusted server certificate fingerprint printed at server startup",
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryServer.propTypes = {
  initial: PropTypes.object,
};
