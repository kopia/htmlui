import axios from "axios";
import React, { Component } from "react";
import { EmailNotificationMethod } from "./EmailNotificationMethod";
import { PushoverNotificationMethod } from "./PushoverNotificationMethod";
import { WebHookNotificationMethod } from "./WebHookNotificationMethod";
import i18n from "../../utils/i18n";

import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import { handleChange, stateProperty, valueToNumber } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";

const notificationMethods = {
  email: { displayName: "notifications:method.email", editor: EmailNotificationMethod },
  pushover: { displayName: "notifications:method.pushover", editor: PushoverNotificationMethod },
  webhook: { displayName: "notifications:method.webhook", editor: WebHookNotificationMethod },
};

const severityOptions = [
  { value: -100, label: "notifications:severity.verbose" },
  { value: -10, label: "notifications:severity.success" },
  { value: 0, label: "notifications:severity.report" },
  { value: 10, label: "notifications:severity.warning" },
  { value: 20, label: "notifications:severity.error" },
];

function severityName(severity) {
  let opt = severityOptions.find((o) => o.value === severity);
  return opt ? i18n.t(opt.label) : i18n.t("notifications:severity.unknown");
}

export class NotificationEditor extends Component {
  constructor() {
    super();

    this.state = {
      notificationProfiles: [],
    };

    this.sendTestNotification = this.sendTestNotification.bind(this);
    this.optionsEditor = React.createRef();
    this.handleChange = handleChange.bind(this);
    this.saveNewProfile = this.saveNewProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
    this.duplicateProfile = this.duplicateProfile.bind(this);
    this.fetchNotificationProfiles = this.fetchNotificationProfiles.bind(this);
  }

  setEditedProfile(profile, isNew) {
    this.setState({ editedProfile: profile, isNewProfile: isNew });
  }

  duplicateProfile(profile) {
    let newProfile = { ...profile };
    newProfile.profile = this.newProfileName(profile.method.type);
    this.setEditedProfile(newProfile, true);
  }

  editedConfig() {
    const ed = this.optionsEditor.current;
    if (!ed) {
      return null;
    }

    if (!ed.validate()) {
      alert(i18n.t("notifications:invalid"));
      return null;
    }

    let cfg = { ...this.state.editedProfile };
    cfg.method.config = ed.state;
    return cfg;
  }

  saveNewProfile() {
    let cfg = this.editedConfig();
    if (!cfg) {
      return;
    }

    if (this.state.isNewProfile) {
      axios
        .post("/api/v1/notificationProfiles", cfg)
        .then((_result) => {
          this.setEditedProfile(null, false);
          this.fetchNotificationProfiles();
        })
        .catch((error) => {
          if (error.response.data.error) {
            alert(i18n.t("notifications:addError", { error: error.response.data.error }));
          }
        });
    }
  }

  updateProfile() {
    let cfg = this.editedConfig();
    if (!cfg) {
      return;
    }

    axios
      .post("/api/v1/notificationProfiles", cfg)
      .then((_result) => {
        this.setEditedProfile(null, false);
        this.fetchNotificationProfiles();
      })
      .catch((error) => {
        if (error.response.data.error) {
          alert(i18n.t("notifications:addError", { error: error.response.data.error }));
        }
      });
  }

  sendTestNotification(cfg) {
    if (this.state.editedProfile) {
      cfg = this.editedConfig();
      if (!cfg) {
        return;
      }
    }

    axios
      .post("/api/v1/testNotificationProfile", cfg)
      .then((_result) => {
        alert(i18n.t("notifications:sent"));
      })
      .catch((error) => {
        if (error.response.data.error) {
          alert(i18n.t("notifications:sendError", { error: error.response.data.error }));
        }
      });
  }

  deleteProfile(profileName) {
    if (!window.confirm(i18n.t("notifications:confirmDelete", { profile: profileName }))) {
      return;
    }

    axios
      .delete("/api/v1/notificationProfiles/" + profileName)
      .then((_result) => {
        this.fetchNotificationProfiles();
      })
      .catch((error) => {
        if (error.response.data.error) {
          alert(i18n.t("notifications:deleteError", { error: error.response.data.error }));
        }
      });
  }

  fetchNotificationProfiles() {
    axios
      .get("/api/v1/notificationProfiles")
      .then((result) => {
        this.setState({
          notificationProfiles: result.data || [],
        });
      })
      .catch((_error) => {});
  }

  componentDidMount() {
    this.fetchNotificationProfiles();
  }

  candidateProfileName(type, index) {
    return type + "-" + index;
  }

  newProfileName(type) {
    let i = 1;

    while (true) {
      const name = this.candidateProfileName(type, i);

      if (!this.state.notificationProfiles.find((p) => name === p.profile)) {
        return name;
      }

      i++;
    }
  }

  renderEditor(SelectedEditor) {
    return (
      <>
        <Row>
          <h4>
            {this.state.isNewProfile ? i18n.t("notifications:newTitle") : i18n.t("notifications:editTitle")}
          </h4>
        </Row>
        <Row>
          {RequiredField(
            this,
            "Profile Name",
            "editedProfile.profile",
            {
              placeholder: "Enter profile name",
              readOnly: !this.state.isNewProfile,
            },
            "Unique name for this notification profile",
          )}
          <Form.Group as={Col}>
            <Form.Label className="required">{i18n.t("notifications:minimumSeverity")}</Form.Label>
            <Form.Control
              as="select"
              size="sm"
              name="editedProfile.minSeverity"
              onChange={(e) => this.handleChange(e, valueToNumber)}
              value={stateProperty(this, "editedProfile.minSeverity")}
            >
              {severityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {i18n.t(o.label)}
                </option>
              ))}
            </Form.Control>
            <Form.Text className="text-muted">{i18n.t("notifications:minimumSeverityHelp")}</Form.Text>
          </Form.Group>
        </Row>
        <Row>
          <SelectedEditor ref={this.optionsEditor} initial={this.state.editedProfile.method.config} />
        </Row>
        <Row>
          <Col>
            <hr />
            {this.state.isNewProfile ? (
              <Button size="sm" onClick={() => this.saveNewProfile()}>
                {i18n.t("notifications:create")}
              </Button>
            ) : (
              <Button size="sm" onClick={() => this.updateProfile()}>
                {i18n.t("notifications:update")}
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => this.sendTestNotification(null)}>
              {i18n.t("notifications:sendTest")}
            </Button>
            <Button size="sm" variant="danger" onClick={() => this.setEditedProfile(null, false)}>
              {i18n.t("notifications:cancel")}
            </Button>
          </Col>
        </Row>
      </>
    );
  }

  renderList() {
    return (
      <>
        {this.state.notificationProfiles && this.state.notificationProfiles.length > 0 ? (
          <Row>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>{i18n.t("notifications:profile")}</th>
                  <th>{i18n.t("notifications:method")}</th>
                  <th>{i18n.t("notifications:minimumSeverity")}</th>
                  <th>{i18n.t("notifications:actions")}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.notificationProfiles.map((p) => (
                  <tr key={p.profile}>
                    <td>{p.profile}</td>
                    <td>{i18n.t(notificationMethods[p.method.type].displayName)}</td>
                    <td>{severityName(p.minSeverity)}</td>
                    <td>
                      <Button size="sm" variant="success" onClick={() => this.setEditedProfile(p, false)}>
                        {i18n.t("notifications:edit")}
                      </Button>
                      <Button size="sm" onClick={() => this.duplicateProfile(p)}>
                        {i18n.t("notifications:duplicate")}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => this.sendTestNotification(p)}>
                        {i18n.t("notifications:sendTest")}
                      </Button>
                      <Button size="sm" onClick={() => this.deleteProfile(p.profile)} variant="danger">
                        {i18n.t("notifications:delete")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Row>
        ) : (
          <Row>
            <p>
              <Badge bg="warning" text="dark">
                {i18n.t("notifications:important")}
              </Badge>
              &nbsp;{i18n.t("notifications:none")}
              <br />
              <br />
              {i18n.t("notifications:noneHelp")}
            </p>
          </Row>
        )}
        <Row>
          <Dropdown>
            <Dropdown.Toggle size="sm" variant="primary" id="newProfileButton">
              {i18n.t("notifications:createNew")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.keys(notificationMethods).map((k) => (
                <Dropdown.Item
                  key={k}
                  onClick={() =>
                    // create empty profile
                    this.setEditedProfile(
                      {
                        profile: this.newProfileName(k),
                        method: { type: k, config: {} },
                        minSeverity: 0,
                      },
                      true,
                    )
                  }
                >
                  {i18n.t(notificationMethods[k].displayName)}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Row>
      </>
    );
  }

  render() {
    if (this.state.editedProfile) {
      return this.renderEditor(notificationMethods[this.state.editedProfile.method.type].editor);
    }

    return this.renderList();
  }
}
