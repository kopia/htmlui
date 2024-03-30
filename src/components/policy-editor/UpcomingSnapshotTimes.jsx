import moment from 'moment';
import React from 'react';
import { LabelColumn } from './LabelColumn';
import i18n from '../../utils/i18n';

export function UpcomingSnapshotTimes(resolved) {
    if (!resolved) {
        return null;
    }

    if (resolved.schedulingError) {
        return <p class="error">{resolved.schedulingError}</p>;
    }

    const times = resolved.upcomingSnapshotTimes;

    if (!times) {
        return <LabelColumn name={i18n.t('feedback.policy.scheduling.no-upcoming-snapshots')} />;
    }

    return <>
        <LabelColumn name-={i18n.t('feedback.policy.scheduling.upcoming')} />

        <ul data-testid="upcoming-snapshot-times">
            {times.map(x => <li key={x}>{moment(x).format('L LT')} ({moment(x).fromNow()})</li>)}
        </ul>
    </>;
}
