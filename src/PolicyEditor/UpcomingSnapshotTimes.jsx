import moment from 'moment';
import React from 'react';
import { LabelColumn } from './LabelColumn';

export function UpcomingSnapshotTimes(times) {
    if (!times) {
        return <LabelColumn name="No upcoming snapshots" />;
    }

    return <>
        <LabelColumn name-="Upcoming" />

        <ul data-testid="upcoming-snapshot-times">
            {times.map(x => <li key={x}>{moment(x).format('L LT')} ({moment(x).fromNow()})</li>)}
        </ul>
    </>;
}
