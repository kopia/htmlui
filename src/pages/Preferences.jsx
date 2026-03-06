import { withTranslation } from 'react-i18next';
import { useContext } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { NotificationEditor } from "../components/notifications/NotificationEditor";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";

/**
 * Preferences component for managing user settings.
 */
function PreferencesBase({ t }) {
  const { theme, bytesStringBase2, fontSize, setByteStringBase, setTheme, setFontSize } =
    useContext(UIPreferencesContext);

  return (
    <Tabs defaultActiveKey="appearance" id="preferences" className="mb-3">
      <Tab eventKey="appearance" title={t('preferences.appearance')} id="tab-appearance">
        <Container fluid>
          <Row>
            <Form.Group as={Col} controlId="theme">
              <Form.Label className="required">{t('preferences.theme')}</Form.Label>
              <select
                className="form-select form-select-sm"
                title={t('preferences.theme')}
                id="themeSelector"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">{t('preferences.themeLight')}</option>
                <option value="dark">{t('preferences.themeDark')}</option>
                <option value="pastel">{t('preferences.themePastel')}</option>
                <option value="ocean">{t('preferences.themeOcean')}</option>
              </select>
            </Form.Group>
            <Form.Group as={Col} controlId="appearance">
              <Form.Label className="required">{t('preferences.appearance')}</Form.Label>
              <select
                className="form-select form-select-sm"
                title="Select font size"
                id="fontSizeInput"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
              >
                <option value="fs-6">{t('preferences.small')}</option>
                <option value="fs-5">{t('preferences.medium')}</option>
                <option value="fs-4">{t('preferences.large')}</option>
              </select>
            </Form.Group>
            <Form.Group as={Col} controlId="bytes">
              <Form.Label className="required">{t('preferences.byteRepresentation')}</Form.Label>
              <select
                className="form-select form-select-sm"
                title={t('preferences.byteRepresentation')}
                id="byteStringBaseInput"
                value={bytesStringBase2 ? "true" : "false"}
                onChange={(e) => setByteStringBase(e.target.value)}
              >
                <option value="false">{t('preferences.base10')}</option>
                <option value="true">{t('preferences.base2')}</option>
              </select>
            </Form.Group>
          </Row>
        </Container>
      </Tab>
      <Tab eventKey="notifications" title={t('preferences.notifications')} id="tab-notifications">
        <NotificationEditor />
      </Tab>
    </Tabs>
  );
}

export default withTranslation()(PreferencesBase);
