import { use } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { NotificationEditor } from "../components/notifications/NotificationEditor";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { useTranslation } from "react-i18next";

/**
 * Class that exports preferences
 */
export function Preferences() {
  const { t } = useTranslation();
  const { theme, bytesStringBase2, fontSize, setByteStringBase, setTheme, setFontSize } = use(UIPreferencesContext);

  return (
    <Tabs defaultActiveKey="appearance" id="preferences" className="mb-3">
      <Tab eventKey="appearance" title={t("preferences:appearance")} id="tab-appearance">
        <Container fluid>
          <Row>
            <Form.Group as={Col} controlId="theme">
              <Form.Label className="required">{t("preferences:theme")}</Form.Label>
              <select
                className="form-select form-select-sm"
                title={t("preferences:theme.select")}
                id="themeSelector"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">{t("preferences:theme.light")}</option>
                <option value="dark">{t("preferences:theme.dark")}</option>
                <option value="pastel">{t("preferences:theme.pastel")}</option>
                <option value="ocean">{t("preferences:theme.ocean")}</option>
              </select>
            </Form.Group>
            <Form.Group as={Col} controlId="appearance">
              <Form.Label className="required">{t("preferences:fontSize")}</Form.Label>
              <select
                className="form-select form-select-sm"
                title={t("preferences:fontSize.select")}
                id="fontSizeInput"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
              >
                <option value="fs-6">{t("preferences:fontSize.small")}</option>
                <option value="fs-5">{t("preferences:fontSize.medium")}</option>
                <option value="fs-4">{t("preferences:fontSize.large")}</option>
              </select>
            </Form.Group>
            <Form.Group as={Col} controlId="byteRepresentation">
              <Form.Label className="required">{t("preferences:bytes")}</Form.Label>
              <select
                className="form-select form-select-sm"
                title={t("preferences:bytes.select")}
                id="bytesBaseInput"
                value={bytesStringBase2}
                onChange={(e) => setByteStringBase(e.target.value)}
              >
                <option value="true">Base-2 (KiB, MiB, GiB, TiB)</option>
                <option value="false">Base-10 (KB, MB, GB, TB)</option>
              </select>
            </Form.Group>
          </Row>
        </Container>
      </Tab>
      <Tab eventKey="notifications" title={t("preferences:notifications")} id="tab-notifications">
        <div className="tab-content-fix">
          <Container fluid>
            <NotificationEditor />
          </Container>
        </div>
      </Tab>
    </Tabs>
  );
}
