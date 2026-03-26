import React, { Component } from "react";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredDirectory } from "../forms/RequiredDirectory";
import PropTypes from "prop-types";
import { ComponentChangeHandling, ChangeEventHandle } from "./types";

export class SetupRepositoryFilesystem extends Component implements ComponentChangeHandling {
  handleChange: ChangeEventHandle;

  constructor(props: any) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["path"]);
  }

  render() {
    return (
      <>
        {RequiredDirectory(this, "Directory Path", "path", {
          autoFocus: true,
          placeholder: "enter directory path where you want to store repository files",
        })}
      </>
    );
  }
}

SetupRepositoryFilesystem.propTypes = {
  initial: PropTypes.object,
};
