import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryToken extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["token"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Token", "token", {
            autoFocus: true,
            type: "password",
            placeholder: "paste connection token",
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryToken.propTypes = {
  initial: PropTypes.object,
};
