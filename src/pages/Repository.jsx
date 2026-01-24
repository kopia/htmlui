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
import { parseBytes, formatBytes } from "../utils/formatutils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronCircleDown, faChevronCircleUp, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { Logs } from "../components/Logs";
import { AppContext } from "../contexts/AppContext";

export class Repository extends Component {
  constructor() {
    super();

    this.state = {
      status: {},
      isLoading: true,
      error: null,
      provider: "",
      description: "",
      throttle: {
        maxUploadSpeedBytesPerSecond: "",
        maxDownloadSpeedBytesPerSecond: "",
      },
    };

    this.mounted = false;
    this.disconnect = this.disconnect.bind(this);
    this.updateDescription = this.updateDescription.bind(this);
    this.handleChange = handleChange.bind(this);
    this.fetchStatus = this.fetchStatus.bind(this);
    this.fetchStatusWithoutSpinner = this.fetchStatusWithoutSpinner.bind(this);
    this.fetchThrottle = this.fetchThrottle.bind(this);
    this.updateThrottle = this.updateThrottle.bind(this);
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
          } else if (result.data.connected && !result.data.apiServerURL) {
            // Only fetch throttle for direct repository connections (not API server connections)
            this.fetchThrottle();
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

  fetchThrottle() {
    axios
      .get("/api/v1/repo/throttle")
      .then((result) => {
        if (this.mounted) {
          this.setState({
            throttle: {
              maxUploadSpeedBytesPerSecond: formatBytes(result.data.maxUploadSpeedBytesPerSecond),
              maxDownloadSpeedBytesPerSecond: formatBytes(result.data.maxDownloadSpeedBytesPerSecond),
            },
          });
        }
      })
      .catch((error) => {
        console.log("Unable to fetch throttle settings:", error);
      });
  }

  updateThrottle() {
    this.setState({ isLoading: true });

    const throttleData = {
      maxUploadSpeedBytesPerSecond: parseBytes(this.state.throttle.maxUploadSpeedBytesPerSecond),
      maxDownloadSpeedBytesPerSecond: parseBytes(this.state.throttle.maxDownloadSpeedBytesPerSecond),
    };

    axios
      .put("/api/v1/repo/throttle", throttleData)
      .then((_result) => {
        this.setState({ isLoading: false });
        this.fetchThrottle();
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert("Error updating throttle settings: " + (error.response?.data?.error || error.message));
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

  selectProvider(provider) {
    this.setState({ provider });
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
            &nbsp;Initializing Repository...
          </h4>
          {this.state.showLog ? (
            <>
              <Button size="sm" variant="light" onClick={() => this.setState({ showLog: false })}>
                <FontAwesomeIcon icon={faChevronCircleUp} /> Hide Log
              </Button>
              <Logs taskID={this.state.status.initTaskID} />
            </>
          ) : (
            <Button size="sm" variant="light" onClick={() => this.setState({ showLog: true })}>
              <FontAwesomeIcon icon={faChevronCircleDown} /> Show Log
            </Button>
          )}
          <hr />
          <Button
            size="sm"
            variant="danger"
            icon={faWindowClose}
            title="Cancel"
            onClick={() => cancelTask(this.state.status.initTaskID)}
          >
            Cancel Connection
          </Button>
        </>
      );
    }

    if (this.state.status.connected) {
      return (
        <>
          <p className="text-success mb-1">
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: 4 }} />
            <span>Connected To Repository</span>
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
                    Update Description
                  </Button>
                </InputGroup>
                <Form.Control.Feedback type="invalid">Description Is Required</Form.Control.Feedback>
              </Form.Group>
            </Row>
            {this.state.status.readonly && (
              <Row>
                <Badge pill variant="warning">
                  Repository is read-only
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
                    <Form.Label className="required">Server URL</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.apiServerURL} />
                  </Form.Group>
                </Row>
              </>
            ) : (
              <>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label className="required">Config File</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.configFile} />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label className="required">Provider</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.storage} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">Encryption Algorithm</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.encryption} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">Hash Algorithm</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.hash} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">Splitter Algorithm</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.splitter} />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label className="required">Repository Format</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.formatVersion} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">Error Correction Overhead</Form.Label>
                    <Form.Control
                      readOnly
                      defaultValue={
                        this.state.status.eccOverheadPercent > 0
                          ? this.state.status.eccOverheadPercent + "%"
                          : "Disabled"
                      }
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">Error Correction Algorithm</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.ecc || "-"} />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label className="required">Internal Compression</Form.Label>
                    <Form.Control readOnly defaultValue={this.state.status.supportsContentCompression ? "yes" : "no"} />
                  </Form.Group>
                </Row>
              </>
            )}
            <Row>
              <Form.Group as={Col}>
                <Form.Label className="required">Connected as:</Form.Label>
                <Form.Control readOnly defaultValue={this.state.status.username + "@" + this.state.status.hostname} />
              </Form.Group>
            </Row>
            <Row>
              <Col>&nbsp;</Col>
            </Row>
            <Row>
              <Col>
                <Button data-testid="disconnect" size="sm" variant="danger" onClick={this.disconnect}>
                  Disconnect
                </Button>
              </Col>
            </Row>
          </Form>
          {!this.state.status.apiServerURL && (
            <>
              <hr />
              <h5>Upload/Download Speed Limits</h5>
              <Form>
                <Row>
                  <Form.Group as={Col} xs={3}>
                    <Form.Label>Maximum Upload Speed</Form.Label>
                    <Form.Control
                      type="text"
                      name="throttle.maxUploadSpeedBytesPerSecond"
                      value={this.state.throttle.maxUploadSpeedBytesPerSecond || ""}
                      onChange={this.handleChange}
                      placeholder="e.g., 1M, 100K"
                      size="sm"
                    />
                    <Form.Text className="text-muted">
                      Examples: 1.5M, 100K, 1G, or leave empty for unlimited
                    </Form.Text>
                  </Form.Group>
                  <Form.Group as={Col} xs={3}>
                    <Form.Label>Maximum Download Speed</Form.Label>
                    <Form.Control
                      type="text"
                      name="throttle.maxDownloadSpeedBytesPerSecond"
                      value={this.state.throttle.maxDownloadSpeedBytesPerSecond || ""}
                      onChange={this.handleChange}
                      placeholder="e.g., 1M, 100K"
                      size="sm"
                    />
                    <Form.Text className="text-muted">
                      Examples: 1.5M, 100K, 1G, or leave empty for unlimited
                    </Form.Text>
                  </Form.Group>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Button size="sm" variant="success" onClick={this.updateThrottle}>
                      Save Settings
                    </Button>
                  </Col>
                </Row>
              </Form>
            </>
          )}
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
