import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { sizeDisplayName } from "./formatutils.js";

export function sizeWithFailures(size?: number, summ, bytesStringBase2: boolean) {
  if (size === undefined) {
    return "";
  }

  if (!summ || !summ.errors || !summ.numFailed) {
    return <span>{sizeDisplayName(size, bytesStringBase2)}</span>;
  }

  let caption = "Encountered " + summ.numFailed + " errors:\n\n";
  let prefix = "- ";
  if (summ.numFailed === 1) {
    caption = "Error: ";
    prefix = "";
  }

  caption += summ.errors.map((x) => prefix + x.path + ": " + x.error).join("\n");

  return (
    <span>
      {sizeDisplayName(size, bytesStringBase2)}&nbsp;
      <FontAwesomeIcon color="red" icon={faExclamationTriangle} title={caption} />
    </span>
  );
}

/**
 * In case of an error, redirect to the repository selection
 * @param {error} The error that was returned
 */
export function redirect(e) {
  if (e && e.response && e.response.data && e.response.data.code === "NOT_CONNECTED") {
    window.location.replace("/repo");
  }
}

export function errorAlert(err, prefix?) {
  if (!prefix) {
    prefix = "Error";
  }

  prefix += ": ";

  if (err.response && err.response.data && err.response.data.error) {
    alert(prefix + err.response.data.error);
  } else if (err instanceof Error) {
    alert(err);
  } else {
    alert(prefix + JSON.stringify(err));
  }
}

type Algorithm = {
  id: string;
  deprecated?: boolean;
};

export function toAlgorithmOption(algorithm: Algorithm, defaultID?) {
  let text = algorithm.id;

  if (algorithm.id === defaultID) {
    text = algorithm.id + " (RECOMMENDED)";
  }

  if (algorithm.deprecated) {
    text = algorithm.id + " (NOT RECOMMENDED)";
  }

  return (
    <option key={algorithm.id} value={algorithm.id}>
      {text}
    </option>
  );
}
