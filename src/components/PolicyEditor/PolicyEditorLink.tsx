import { Link } from 'react-router-dom';
import { Backend } from '@kopia/backend';
import { policyEditorURL, PolicyTypeName } from 'utils';

export function PolicyEditorLink(source: Backend.SourceInfo) {
    return <Link to={policyEditorURL(source)}>{PolicyTypeName(source)}</Link>;
}
