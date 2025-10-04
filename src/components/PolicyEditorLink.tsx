import React from "react";
import { Link } from "react-router-dom";
import { PolicyTypeName, policyEditorURL } from "../utils/policyutil";

export function PolicyEditorLink(s) {
  return <Link to={policyEditorURL(s)}>{PolicyTypeName(s)}</Link>;
}
