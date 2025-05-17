import React, { createRef } from "react";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import { useNavigate, useLocation } from "react-router-dom";
import { PolicyEditor } from "../components/policy-editor/PolicyEditor";
import {
  CLIEquivalent,
  GoBackButton,
  parseQuery,
  PolicyTypeName,
} from "../utils/uiutil";

export function Policy() {
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = createRef();

  const source = parseQuery(location.search);
  const { userName, host, path } = source;

  return (
    <>
      <h4>
        <GoBackButton />
        &nbsp;&nbsp;{PolicyTypeName(source)}
      </h4>
      <PolicyEditor
        ref={editorRef}
        userName={userName}
        host={host}
        path={path}
        close={() => navigate(-1)}
      />
      <Row>
        <Col>&nbsp;</Col>
      </Row>
      <Row>
        <Col xs={12}>
          <CLIEquivalent command={`policy set "${userName}@${host}:${path}"`} />
        </Col>
      </Row>
    </>
  );
}
