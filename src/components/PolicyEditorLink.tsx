import React from "react";
import { Link } from "react-router-dom";
import { PolicyKey, PolicyTypeName, policyEditorURL } from "../utils/policyutil";

export function PolicyEditorLink(s: PolicyKey) {
  return <Link to={policyEditorURL(s)}>{PolicyTypeName(s)}</Link>;
}
