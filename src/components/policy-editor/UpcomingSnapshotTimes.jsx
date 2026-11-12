import moment from "moment";
import i18n from "../../utils/i18n";
import React from "react";
import { LabelColumn } from "./LabelColumn";

export function UpcomingSnapshotTimes(resolved) {
  if (!resolved) {
    return null;
  }

  if (resolved.schedulingError) {
    return <p className="error">{resolved.schedulingError}</p>;
  }

  const times = resolved.upcomingSnapshotTimes;

  if (!times) {
    return <LabelColumn name={i18n.t("policies:noUpcoming")} />;
  }

  return (
    <>
      <LabelColumn name-="Upcoming" />

      <ul data-testid="upcoming-snapshot-times">
        {times.map((x) => (
          <li key={x}>
            {moment(x).format("L LT")} ({moment(x).fromNow()})
          </li>
        ))}
      </ul>
    </>
  );
}
