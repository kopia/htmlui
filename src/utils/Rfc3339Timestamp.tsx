import { Backend } from '@kopia/backend';


export function Rfc3339Timestamp(props: { timestamp: Backend.Time | undefined }) {
    const { timestamp } = props;

    if (!timestamp) {
        return <></>;
    }

    let t = new Date(timestamp);
    return <>t.toLocaleString()</>;
}
