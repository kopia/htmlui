import React, { Component, createRef } from 'react';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import { PolicyEditor } from './components/PolicyEditor/PolicyEditor';
import { parseQuery, PolicyTypeName } from './utils/functions';
import { CliEquivalent } from "./utils/CliEquivalent";
import { GoBackButton } from "./utils/GoBackButton";

export class PolicyEditorPage extends Component {
    constructor() {
        super();

        this.editorRef = createRef();
    }

    render() {
        const source = parseQuery(this.props.location.search);
        const { userName, host, path } = source;

        return <>
            <h4>
                <GoBackButton onClick={this.props.history.goBack} />
                &nbsp;&nbsp;{PolicyTypeName(source)}</h4>
            <PolicyEditor ref={this.editorRef} userName={userName} host={host} path={path} close={this.props.history.goBack} />
            <Row><Col>&nbsp;</Col></Row>
            <Row>
                <Col xs={12}>
                    <CliEquivalent command={`policy set "${userName}@${host}:${path}"`} />
                </Col>
            </Row>
        </>;
    }
}
