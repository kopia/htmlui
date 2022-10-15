import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext } from 'react';
import { UIPreferencesContext } from './contexts/UIPreferencesContext';
import { getErrorList, sizeDisplayName, Summary } from './utils/ui';

type SizeDisplayProps = {
    size?: number;
    summary?: Summary;
};
const SizeDisplay = ({ size, summary }: SizeDisplayProps) => {
    const { bytesStringBase2 } = useContext(UIPreferencesContext);

    if (size === undefined) return null;

    const sizeDisplay = sizeDisplayName(size, bytesStringBase2);
    const errorList = getErrorList(summary);

    return (
        <span>
            {sizeDisplay}
            {errorList && (
                <>
                    &nbsp;
                    <FontAwesomeIcon
                        color="red"
                        icon={faExclamationTriangle}
                        title={errorList}
                    />
                </>
            )}
        </span>
    );
};

export default SizeDisplay;
