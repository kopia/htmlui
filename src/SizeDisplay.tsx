import React, { useContext } from 'react';
import { UIPreferencesContext } from './contexts/UIPreferencesContext';
import { sizeWithFailures } from './utils/ui';

type SizeDisplayProps = {
	size: number;
	summary: any;
};

const SizeDisplay = ({ size, summary }: SizeDisplayProps) => {
	const { bytesStringBase2 } = useContext(UIPreferencesContext);
	return sizeWithFailures(size, summary, bytesStringBase2);
};

export default SizeDisplay;
