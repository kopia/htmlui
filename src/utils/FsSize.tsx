import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Backend } from '@kopia/backend';
import { sizeToDisplayWithUnit } from './functions';


export function FsSize(props: { size: number, summary: Backend.DirectorySummary | undefined }) {
    const { size, summary } = props;

    if (size === undefined) {
        return <></>;
    }

    if (!summary || !summary.errors || !summary.numFailed) {
        return <span>{sizeToDisplayWithUnit(size)}</span>;
    }

    let caption = "Encountered " + summary.numFailed + " errors:\n\n";
    let prefix = "- ";
    if (summary.numFailed === 1) {
        caption = "Error: ";
        prefix = "";
    }

    caption += summary.errors.map(entryWithError => prefix + entryWithError.path + ": " + entryWithError.error).join("\n");

    return <span>
        {sizeToDisplayWithUnit(size)}&nbsp;
        <FontAwesomeIcon color="red" icon={faExclamationTriangle} title={caption} />
    </span>;
}
