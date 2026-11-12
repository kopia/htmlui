import { faBan, faCheck, faExclamationCircle, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React from "react";
import Spinner from "react-bootstrap/Spinner";
import { formatDuration } from "./formatutils";
import i18n from "./i18n";

export function cancelTask(tid) {
  axios
    .post("/api/v1/tasks/" + tid + "/cancel", {})
    .then((_result) => {})
    .catch((_error) => {});
}

export function taskStatusSymbol(task) {
  const st = task.status;
  const dur = formatDuration(task.startTime, task.endTime, true);

  switch (st) {
    case "RUNNING":
      return (
        <>
          <Spinner animation="border" variant="primary" size="sm" /> {i18n.t("tasks:runningFor", { duration: dur })}
          <button className="btn btn-sm btn-link" type="button" onClick={() => cancelTask(task.id)}>
            <FontAwesomeIcon color="red" size="lg" title={i18n.t("tasks:cancelTask")} icon={faXmark} />
          </button>
        </>
      );
    case "SUCCESS":
      return (
        <p title={dur}>
          <FontAwesomeIcon icon={faCheck} color="green" />
          {" " + i18n.t("tasks:finishedIn", { duration: dur })}
        </p>
      );

    case "FAILED":
      return (
        <p title={dur}>
          <FontAwesomeIcon icon={faExclamationCircle} color="red" />
          {" " + i18n.t("tasks:failedAfter", { duration: dur })}
        </p>
      );

    case "CANCELED":
      return (
        <p title={dur}>
          <FontAwesomeIcon icon={faBan} />
          {" " + i18n.t("tasks:canceledAfter", { duration: dur })}
        </p>
      );

    default:
      return st;
  }
}
