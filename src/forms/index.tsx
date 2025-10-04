import { Component } from "react";
import { getDeepStateProperty, setDeepStateProperty } from "../utils/deepstate";
import { ComponentChangeHandling } from "src/components/types";

export function validateRequiredFields(component: ComponentChangeHandling, fields: string[]) {
  const updateState: {[field: string]: any } = {};
  let failed = false;

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];

    if (!component.state[field]) {
      // explicitly set field to empty string, component triggers validation error UI.
      updateState[field] = "";
      failed = true;
    }
  }

  if (failed) {
    component.setState(updateState);
    return false;
  }

  return true;
}

export function handleChange(event, valueGetter = (x) => x.value) {
  setDeepStateProperty(this, event.target.name, valueGetter(event.target));
}

export function stateProperty(component: Component, name: string, defaultValue: string | null | undefined = "") {
  const value = getDeepStateProperty(component, name);
  return value === undefined ? defaultValue : value;
}

export function valueToNumber(t) {
  if (t.value === "") {
    return undefined;
  }

  const v = Number.parseInt(t.value);
  if (isNaN(v)) {
    return t.value + "";
  }

  return v;
}

export function isInvalidNumber(v: any): boolean {
  if (v === undefined || v === "") {
    return false;
  }

  if (isNaN(Number.parseInt(v))) {
    return true;
  }

  return false;
}
