import { faBan, faCheck, faExclamationCircle, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React from "react";
import Spinner from "react-bootstrap/Spinner";
import { formatDuration } from "./formatutils";

export function cancelTask(tid) {
  axios
    .post("/api/v1/tasks/" + tid + "/cancel", {})
    .then((_result) => {})
    .catch((_error) => {});
}

export function taskProgressPercent(task) {
  const match = task.progressInfo?.match(/(?:^|\s|\()([0-9]+(?:\.[0-9]+)?)%/);
  return match ? match[1] + "%" : "";
}

export function taskStatusSymbol(task) {
  const st = task.status;
  const dur = formatDuration(task.startTime, task.endTime, true);
  const progressPercent = taskProgressPercent(task);

  switch (st) {
    case "RUNNING":
      return (
        <>
          <Spinner animation="border" variant="primary" size="sm" /> Running for {dur}
          {progressPercent && (
            <>
              {" "}
              · <strong>{progressPercent}</strong>
            </>
          )}
          <button className="btn btn-sm btn-link" type="button" onClick={() => cancelTask(task.id)}>
            <FontAwesomeIcon color="red" size="lg" title="Cancel task" icon={faXmark} />
          </button>
        </>
      );
    case "SUCCESS":
      return (
        <p title={dur}>
          <FontAwesomeIcon icon={faCheck} color="green" /> Finished in {dur}
        </p>
      );

    case "FAILED":
      return (
        <p title={dur}>
          <FontAwesomeIcon icon={faExclamationCircle} color="red" /> Failed after {dur}
        </p>
      );

    case "CANCELED":
      return (
        <p title={dur}>
          <FontAwesomeIcon icon={faBan} /> Canceled after {dur}
        </p>
      );

    default:
      return st;
  }
}
