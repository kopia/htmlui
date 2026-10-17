import axios from "axios";
import React, { Component } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";
import { handleChange } from "../forms";
import { SetupRepository } from "../components/SetupRepository";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { cancelTask } from "../utils/taskutil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronCircleDown, faChevronCircleUp, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { Logs } from "../components/Logs";
import { AppContext } from "../contexts/AppContext";
import i18n from "../utils/i18n";

export class Repository extends Component {
  constructor() {
    super();

    this.state = {
      status: {},
      isLoading: true,
      error: null,
      provider: "",
      description: "",
    };

    this.mounted = false;
    this.disconnect = this.disconnect.bind(this);
    this.updateDescription = this.updateDescription.bind(this);
    this.handleChange = handleChange.bind(this);
    this.fetchStatus = this.fetchStatus.bind(this);
    this.fetchStatusWithoutSpinner = this.fetchStatusWithoutSpinner.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.fetchStatus(this.props);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchStatus() {
    if (this.mounted) {
      this.setState({
        isLoading: true,
      });
    }

    this.fetchStatusWithoutSpinner();
  }

  fetchStatusWithoutSpinner() {
    axios
      .get("/api/v1/repo/status")
      .then((result) => {
        if (this.mounted) {
          this.setState({
            status: result.data,
            isLoading: false,
          });

          // Update the app context to reflect the successfully-loaded description.
          this.context.repositoryDescriptionUpdated(result.data.description);

          if (result.data.initTaskID) {
            window.setTimeout(() => {
              this.fetchStatusWithoutSpinner();
            }, 1000);
          }
        }
      })
      .catch((error) => {
        if (this.mounted) {
          this.setState({
            error,
            isLoading: false,
          });
        }
      });
  }

  disconnect() {
    this.setState({ isLoading: true });
    axios
      .post("/api/v1/repo/disconnect", {})
      .then((_result) => {
        this.context.repositoryUpdated(false);
      })
      .catch((error) =>
        this.setState({
          error,
          isLoading: false,
        }),
      );
  }

  updateDescription() {
    this.setState({
      isLoading: true,
    });

    axios
      .post("/api/v1/repo/description", {
        description: this.state.status.description,
      })
      .then((result) => {
        // Update the app context to reflect the successfully-saved description.
        this.context.repositoryDescriptionUpdated(result.data.description);

        this.setState({
          isLoading: false,
        });
      })
      .catch((_error) => {
        this.setState({
          isLoading: false,
        });
      });
  }

  render() {
    let { isLoading, error } = this.state;
    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <Spinner animation="border" variant="primary" />;
    }

    if (this.state.status.initTaskID) {
      return (
        <>
          <h4>
            <Spinner animation="border" variant="primary" size="sm" />
            &nbsp;{i18n.t("repository:initializing")}
          </h4>
          {this.state.showLog ? (
            <>
              <Button size="sm" variant="light" onClick={() => this.setState({ showLog: false })}>
                <FontAwesomeIcon icon={faChevronCircleUp} /> {i18n.t("repository:hideLog")}
              </Button>
              <Logs taskID={this.state.status.initTaskID} />
            </>
          ) : (
            <Button size="sm" variant="light" onClick={() => this.setState({ showLog: true })}>
              <FontAwesomeIcon icon={faChevronCircleDown} /> {i18n.t("repository:showLog")}
            </Button>
          )}
          <hr />
          <Button
            size="sm"
            variant="danger"
            icon={faWindowClose}
            title={i18n.t("repository:cancel")}
            onClick={() => cancelTask(this.state.status.initTaskID)}
          >
            {i18n.t("repository:cancelConnection")}
          </Button>
        </>
      );
    }

    if (this.state.status.connected) {
      return (
        <>
          <p className="text-success mb-1">
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: 4 }} />
            <span>{i18n.t("repository:connected")}</span>
          </p>
          <Form>
            <Row>
              <Form.Group as={Col}>
                <InputGroup>
                  <Form.Control
                    autoFocus={true}
                    isInvalid={!this.state.status.description}
                    name="status.description"
                    value={this.state.status.description}
                    onChange={this.handleChange}
                    size="sm"
                  />
                  &nbsp;
                  <Button data-testid="update-description" size="sm" onClick={this.updateDescription} type="button">
                    {i18n.t("repository:updateDescription")}
                  </Button>
                </InputGroup>
                <Form.Control.Feedback type="invalid">{i18n.t("repository:descriptionRequired")}</Form.Control.Feedback>
              </Form.Group>
            </Row>
            {this.state.status.readonly && (
              <Row>
                <Badge pill variant="warning">
                  {i18n.t("repository:readOnly")}
                </Badge>
              </Row>
            )}
          </Form>
          <hr />
          <Form>
            {this.state.status.apiServerURL ? (
              <>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:serverUrl")}</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.apiServerURL} />
                  </Form.Group>
                </Row>
              </>
            ) : (
              <>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:configFile")}</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.configFile} />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:provider")}</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.storage} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:encryptionAlgorithm")}</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.encryption} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:hashAlgorithm")}</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.hash} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:splitterAlgorithm")}</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.splitter} />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:format")}</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.formatVersion} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:eccOverhead")}</Form.Label>
                    <Form.Control
                      readOnly
                      defaultValue={
                        this.state.status.eccOverheadPercent > 0
                          ? this.state.status.eccOverheadPercent + "%"
                          : i18n.t("repository:disabled")
                      }
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:eccAlgorithm")}</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.ecc || "-"} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t("repository:internalCompression")}</Form.Label>
                    <Form.Control
                      readOnly
                      defaultValue={
                        this.state.status.supportsContentCompression
                          ? i18n.t("common:yes")
                          : i18n.t("common:no")
                      }
                    />
                  </Form.Group>
                </Row>
              </>
            )}
            <Row>
              <Form.Group as={Col}>
                <Form.Label className="required">{i18n.t("repository:connectedAs")}</Form.Label>
                <Form.Control readOnly defaultValue={this.state.status.username + "@" + this.state.status.hostname} />
              </Form.Group>
            </Row>
            <Row>
              <Col>&nbsp;</Col>
            </Row>
            <Row>
              <Col>
                <Button data-testid="disconnect" size="sm" variant="danger" onClick={this.disconnect}>
                  {i18n.t("repository:disconnect")}
                </Button>
              </Col>
            </Row>
          </Form>
          <Row>
            <Col>&nbsp;</Col>
          </Row>
          <Row>
            <Col xs={12}>
              <CLIEquivalent command="repository status" />
            </Col>
          </Row>
        </>
      );
    }

    return <SetupRepository />;
  }
}

Repository.contextType = AppContext;
