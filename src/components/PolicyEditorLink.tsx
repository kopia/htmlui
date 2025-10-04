import React from "react";
import { Link } from "react-router-dom";
import { PolicyQueryParams, PolicyTypeName, policyEditorURL } from "../utils/policyutil";

export function PolicyEditorLink(s: PolicyQueryParams) {
  return <Link to={policyEditorURL(s)}>{PolicyTypeName(s)}</Link>;
}
