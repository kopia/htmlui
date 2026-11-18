import React from "react";
import i18n from "../../utils/i18n";
import Row from "react-bootstrap/Row";
import { LabelColumn } from "./LabelColumn";
import { ValueColumn } from "./ValueColumn";
import { EffectiveValueColumn } from "./EffectiveValueColumn";

export function SectionHeaderRow() {
  return (
    <Row>
      <LabelColumn />
      <ValueColumn>
        <div className="policyEditorHeader">{i18n.t("policies:defined")}</div>
      </ValueColumn>
      <EffectiveValueColumn>
        <div className="policyEditorHeader">{i18n.t("policies:effective")}</div>
      </EffectiveValueColumn>
    </Row>
  );
}
