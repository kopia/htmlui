import { faBan, faCheck, faExclamationCircle, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import { Backend } from '@kopia/backend';
import { formatDuration, cancelTask } from './functions';


export function TaskStatusSymbol(task: Backend.Task) {
    const st = task.status;
    const dur = formatDuration(task.startTime, task.endTime);
    const durMultiUnit = formatDuration(task.startTime, task.endTime, true);

    switch (st) {
        case "RUNNING":
            return <>
                <Spinner animation="border" variant="primary" size="sm" /> Running for {dur}
                &nbsp;
                <FontAwesomeIcon size="sm" color="red" icon={faWindowClose} title="Cancel task" onClick={() => cancelTask(task.id)} />
            </>;

        case "SUCCESS":
            return <p title={dur}><FontAwesomeIcon icon={faCheck} color="green" /> Finished in {durMultiUnit}</p>;

        case "FAILED":
            return <p title={dur}><FontAwesomeIcon icon={faExclamationCircle} color="red" /> Failed after {durMultiUnit}</p>;

        case "CANCELED":
            return <p title={dur}><FontAwesomeIcon icon={faBan} /> Canceled after {durMultiUnit}</p>;

        default:
            return st;
    }
}
