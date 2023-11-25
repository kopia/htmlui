import { useRef } from 'react';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import { PolicyEditor } from '../components/policy-editor/PolicyEditor';
import { CLIEquivalent, GoBackButton, parseQuery, PolicyTypeName } from '../utils/uiutil';

export function Policy({ location, history }) {
    const source = parseQuery(location.search);
    const { userName, host, path } = source;
    const editorRef = useRef();

    return <>
        <h4>
        <GoBackButton onClick={history.goBack} />
        &nbsp;&nbsp;{PolicyTypeName(source)}</h4>
        <PolicyEditor ref={editorRef} userName={userName} host={host} path={path} close={history.goBack} />
        <Row><Col>&nbsp;</Col></Row>
        <Row>
            <Col xs={12}>
                <CLIEquivalent command={`policy set "${userName}@${host}:${path}"`} />
            </Col>
        </Row>
    </>;
}
