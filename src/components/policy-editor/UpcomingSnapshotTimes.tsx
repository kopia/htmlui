import moment from "moment";
import React from "react";
import { LabelColumn } from "./LabelColumn";

export function UpcomingSnapshotTimes(resolved: { schedulingError?: string; upcomingSnapshotTimes: string[] } | null) {
  if (!resolved) {
    return null;
  }

  // This is only mentioned here
  if (resolved.schedulingError) {
    return <p className="error">{resolved.schedulingError}</p>;
  }

  const times: string[] = resolved.upcomingSnapshotTimes;

  if (!times) {
    return <LabelColumn name="No upcoming snapshots" />;
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
