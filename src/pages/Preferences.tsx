import { useContext, React } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { NotificationEditor } from "../components/notifications/NotificationEditor";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";

/**
 * Class that exports preferences
 */
export function Preferences() {
  const { theme, bytesStringBase2, fontSize, setByteStringBase, setTheme, setFontSize } =
    useContext(UIPreferencesContext);

  return (
    <Tabs defaultActiveKey="appearance" id="preferences" className="mb-3">
      <Tab eventKey="appearance" title="Appearance" id="tab-appearance">
        <Container fluid>
          <Row>
            <Form.Group as={Col} controlId="theme">
              <Form.Label className="required">Theme</Form.Label>
              <select
                className="form-select form-select-sm"
                title="Select theme"
                id="themeSelector"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">light</option>
                <option value="dark">dark</option>
                <option value="pastel">pastel</option>
                <option value="ocean">ocean</option>
              </select>
            </Form.Group>
            <Form.Group as={Col} controlId="appearance">
              <Form.Label className="required">Appearance</Form.Label>
              <select
                className="form-select form-select-sm"
                title="Select font size"
                id="fontSizeInput"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
              >
                <option value="fs-6">small</option>
                <option value="fs-5">medium</option>
                <option value="fs-4">large</option>
              </select>
            </Form.Group>
            <Form.Group as={Col} controlId="byteRepresentation">
              <Form.Label className="required">Byte representation</Form.Label>
              <select
                className="form-select form-select-sm"
                title="Select byte representation"
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
      <Tab eventKey="notifications" title="Notifications" id="tab-notifications">
        <div className="tab-content-fix">
          <Container fluid>
            <NotificationEditor />
          </Container>
        </div>
      </Tab>
    </Tabs>
  );
}
