import axios from "axios";
import React, { Component, useContext } from "react";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { Link, useNavigate, useLocation } from "react-router-dom";
import KopiaTable from "../components/KopiaTable";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { compare, objectLink, parseQuery, rfc3339TimestampForDisplay } from "../utils/formatutils";
import { errorAlert, redirect, sizeWithFailures } from "../utils/uiutil";
import { sourceQueryStringParams } from "../utils/policyutil";
import { GoBackButton } from "../components/GoBackButton";
import { faSync, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import { faFileAlt } from "@fortawesome/free-regular-svg-icons";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import PropTypes from "prop-types";

function pillVariant(tag) {
  if (tag.startsWith("latest-")) {
    return "success";
  }
  if (tag.startsWith("daily-")) {
    return "info";
  }
  if (tag.startsWith("weekly-")) {
    return "danger";
  }
  if (tag.startsWith("monthly-")) {
    return "secondary";
  }
  if (tag.startsWith("annual-")) {
    return "warning";
  }
  return "primary";
}

class SnapshotHistoryInternal extends Component {
  constructor() {
    super();
    this.state = {
      snapshots: [],
      showHidden: false,
      isLoading: true,
      isRefreshing: false,
      error: null,
      selectedSnapshotManifestIDs: {},
    };

    this.fetchSnapshots = this.fetchSnapshots.bind(this);
    this.toggleShowHidden = this.toggleShowHidden.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.deselectAll = this.deselectAll.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.deleteSelectedSnapshots = this.deleteSelectedSnapshots.bind(this);
    this.cancelDelete = this.cancelDelete.bind(this);
    this.deleteSnapshotSource = this.deleteSnapshotSource.bind(this);

    this.cancelSnapshotDescription = this.cancelSnapshotDescription.bind(this);
    this.removeSnapshotDescription = this.removeSnapshotDescription.bind(this);
    this.saveSnapshotDescription = this.saveSnapshotDescription.bind(this);

    this.editPin = this.editPin.bind(this);
    this.cancelPin = this.cancelPin.bind(this);
    this.savePin = this.savePin.bind(this);
    this.removePin = this.removePin.bind(this);

    this.editSnapshots = this.editSnapshots.bind(this);
  }

  selectAll() {
    const snapIds = {};
    for (const sn of this.state.snapshots) {
      snapIds[sn.id] = true;
    }

    this.setState({
      selectedSnapshotManifestIDs: snapIds,
    });
  }

  deselectAll() {
    this.setState({
      selectedSnapshotManifestIDs: {},
    });
  }

  isSelected(snap) {
    return !!this.state.selectedSnapshotManifestIDs[snap.id];
  }

  toggleSelected(snap) {
    let sel = { ...this.state.selectedSnapshotManifestIDs };

    if (sel[snap.id]) {
      delete sel[snap.id];
    } else {
      sel[snap.id] = true;
    }

    this.setState({
      selectedSnapshotManifestIDs: sel,
    });
  }

  componentDidUpdate(oldProps, oldState) {
    if (this.state.showHidden !== oldState.showHidden) {
      this.fetchSnapshots();
    }
  }

  componentDidMount() {
    this.fetchSnapshots();
  }

  showDeleteConfirm() {
    this.setState({
      alsoDeleteSource: false,
      showDeleteConfirmationDialog: true,
    });
  }

  deleteSelectedSnapshots() {
    const req = {
      source: {
        host: this.state.host,
        userName: this.state.userName,
        path: this.state.path,
      },
      snapshotManifestIds: [],
      deleteSourceAndPolicy: this.state.alsoDeleteSource,
    };

    for (let id in this.state.selectedSnapshotManifestIDs) {
      req.snapshotManifestIds.push(id);
    }

    axios
      .post("/api/v1/snapshots/delete", req)
      .then((_result) => {
        if (req.deleteSourceAndPolicy) {
          this.props.navigate(-1);
        } else {
          this.fetchSnapshots();
        }
      })
      .catch((error) => {
        redirect(error);
        errorAlert(error);
      });

    this.setState({
      showDeleteConfirmationDialog: false,
    });
  }

  deleteSnapshotSource() {
    const req = {
      source: {
        host: this.state.host,
        userName: this.state.userName,
        path: this.state.path,
      },
      deleteSourceAndPolicy: true,
    };

    axios
      .post("/api/v1/snapshots/delete", req)
      .then((_result) => {
        this.props.navigate(-1);
      })
      .catch((error) => {
        redirect(error);
        errorAlert(error);
      });
  }

  cancelDelete() {
    this.setState({
      showDeleteConfirmationDialog: false,
    });
  }

  fetchSnapshots() {
    let q = parseQuery(this.props.location.search);

    this.setState({
      isRefreshing: true,
      host: q.host,
      userName: q.userName,
      path: q.path,
      hiddenCount: 0,
      selectedSnapshot: null,
    });

    let u = "/api/v1/snapshots?" + sourceQueryStringParams(q);

    if (this.state.showHidden) {
      u += "&all=1";
    }

    axios
      .get(u)
      .then((result) => {
        this.setState({
          snapshots: result.data.snapshots,
          selectedSnapshotManifestIDs: {},
          unfilteredCount: result.data.unfilteredCount,
          uniqueCount: result.data.uniqueCount,
          isLoading: false,
          isRefreshing: false,
        });
      })
      .catch((error) =>
        this.setState({
          error,
          isLoading: false,
          isRefreshing: false,
        }),
      );
  }

  selectSnapshot(x) {
    this.setState({
      selectedSnapshot: x,
    });
  }

  toggleShowHidden(x) {
    this.setState({
      showHidden: x.target.checked,
    });
  }

  cancelSnapshotDescription() {
    this.setState({ editingDescriptionFor: false });
  }

  removeSnapshotDescription() {
    this.editSnapshots({
      snapshots: this.state.editingDescriptionFor,
      description: "",
    });
  }

  saveSnapshotDescription() {
    this.editSnapshots({
      snapshots: this.state.editingDescriptionFor,
      description: this.state.updatedSnapshotDescription,
    });
  }

  descriptionFor(x) {
    return (
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault();
          this.setState({
            editingDescriptionFor: [x.id],
            updatedSnapshotDescription: x.description,
            originalSnapshotDescription: x.description,
          });
        }}
        title={x.description + " - Click to update snapshot description."}
        className={x.description ? "snapshot-description-set" : "snapshot-description"}
      >
        <b>
          <FontAwesomeIcon icon={faFileAlt} />
        </b>
      </a>
    );
  }

  newPinFor(x) {
    return (
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault();

          this.setState({
            editPinFor: [x.id],
            originalPinName: "",
            newPinName: "do-not-delete",
          });
        }}
        title="Add a pin to protect snapshot from deletion"
      >
        <FontAwesomeIcon icon={faThumbtack} color="#ccc" />
      </a>
    );
  }

  editPin(snap, pin) {
    this.setState({
      editPinFor: [snap.id],
      originalPinName: pin,
      newPinName: pin,
    });
  }

  cancelPin() {
    this.setState({ editPinFor: undefined });
  }

  removePin(p) {
    this.editSnapshots({
      snapshots: this.state.editPinFor,
      removePins: [p],
    });
  }

  savePin() {
    this.editSnapshots({
      snapshots: this.state.editPinFor,
      addPins: [this.state.newPinName],
      removePins: [this.state.originalPinName],
    });
  }

  editSnapshots(req) {
    this.setState({ savingSnapshot: true });
    axios
      .post("/api/v1/snapshots/edit", req)
      .then((_resp) => {
        this.setState({
          editPinFor: undefined,
          editingDescriptionFor: undefined,
          savingSnapshot: false,
        });
        this.fetchSnapshots();
      })
      .catch((e) => {
        this.setState({
          editPinFor: undefined,
          editingDescriptionFor: undefined,
          savingSnapshot: false,
        });
        redirect(e);
        errorAlert(e);
      });
  }

  render() {
    let { snapshots, unfilteredCount, uniqueCount, isLoading, error } = this.state;
    const { bytesStringBase2 } = this.context;
    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading && !snapshots) {
      return <Spinner animation="border" variant="primary" />;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const path = searchParams.get("path");

    snapshots.sort((a, b) => -compare(a.startTime, b.startTime));

    const columns = [
      {
        id: "selected",
        header: "Selected",
        width: 20,
        align: "center",
        cell: (x) => (
          <div className="form-check multiselect">
            <input
              type="checkbox"
              className="form-check-input"
              checked={this.isSelected(x.row.original)}
              onChange={() => this.toggleSelected(x.row.original)}
            />
          </div>
        ),
      },
      {
        id: "startTime",
        header: "Start time",
        width: 200,
        cell: (x) => {
          let timestamp = rfc3339TimestampForDisplay(x.row.original.startTime);
          return (
            <Link to={objectLink(x.row.original.rootID)} state={{ label: path }}>
              {timestamp}
            </Link>
          );
        },
      },
      {
        id: "description",
        header: "",
        width: 20,
        cell: (x) => this.descriptionFor(x.row.original),
      },
      {
        id: "rootID",
        header: "Root",
        width: "",
        accessorFn: (x) => x.rootID,
        cell: (x) => (
          <>
            <span className="snapshot-hash">{x.cell.getValue()}</span>
            {x.row.original.description && (
              <div className="snapshot-description">
                <small>{x.row.original.description}</small>
              </div>
            )}
          </>
        ),
      },
      {
        header: "Retention",
        accessorFn: (x) => x.retention,
        width: "",
        cell: (x) => (
          <span>
            {x.cell.getValue().map((l) => (
              <React.Fragment key={l}>
                <Badge bg={"retention-badge-" + pillVariant(l)}>{l}</Badge>{" "}
              </React.Fragment>
            ))}
            {x.row.original.pins.map((l) => (
              <React.Fragment key={l}>
                <Badge bg="snapshot-pin" onClick={() => this.editPin(x.row.original, l)}>
                  <FontAwesomeIcon icon={faThumbtack} /> {l}
                </Badge>{" "}
              </React.Fragment>
            ))}
            {this.newPinFor(x.row.original)}
          </span>
        ),
      },
      {
        header: "Size",
        accessorFn: (x) => x.summary.size,
        width: 100,
        cell: (x) => sizeWithFailures(x.cell.getValue(), x.row.original.summary, bytesStringBase2),
      },
      {
        header: "Files",
        accessorFn: (x) => x.summary.files,
        width: 100,
      },
      {
        header: "Dirs",
        accessorFn: (x) => x.summary.dirs,
        width: 100,
      },
    ];

    const selectedElements = Object.keys(this.state.selectedSnapshotManifestIDs);

    return (
      <>
        <Row>
          <Col>
            <GoBackButton />
            &nbsp;
            {snapshots.length > 0 &&
              (selectedElements.length < snapshots.length ? (
                <Button size="sm" variant="primary" onClick={this.selectAll}>
                  Select All
                </Button>
              ) : (
                <Button size="sm" variant="primary" onClick={this.deselectAll}>
                  Deselect All
                </Button>
              ))}
            &nbsp;
            {selectedElements.length > 0 && (
              <>
                &nbsp;
                <Button size="sm" variant="danger" onClick={this.showDeleteConfirm}>
                  Delete Selected ({selectedElements.length})
                </Button>
              </>
            )}
            {snapshots.length === 0 && (
              <>
                &nbsp;
                <Button size="sm" variant="danger" onClick={this.deleteSnapshotSource}>
                  Delete Snapshot Source
                </Button>
              </>
            )}
          </Col>
          <Col></Col>
          <Col xs="auto">
            <Button size="sm" variant="primary">
              {this.state.isRefreshing ? (
                <Spinner animation="border" variant="light" size="sm" />
              ) : (
                <FontAwesomeIcon icon={faSync} title="Fetch snapshots" onClick={this.fetchSnapshots} />
              )}
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="vpadded">
              Displaying{" "}
              {snapshots.length !== unfilteredCount
                ? snapshots.length + " out of " + unfilteredCount
                : snapshots.length}{" "}
              snapshots of&nbsp;
              <b>
                {this.state.userName}@{this.state.host}:{this.state.path}
              </b>
            </div>
          </Col>
        </Row>
        {unfilteredCount !== uniqueCount && (
          <Row>
            <Col>
              <div className="vpadded">
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check
                    type="checkbox"
                    checked={this.state.showHidden}
                    label={"Show " + unfilteredCount + " individual snapshots"}
                    onChange={this.toggleShowHidden}
                  />
                </Form.Group>
              </div>
            </Col>
          </Row>
        )}
        <Row>
          <Col xs={12}>
            <KopiaTable data={snapshots} columns={columns} />
          </Col>
        </Row>

        <CLIEquivalent
          command={`snapshot list "${this.state.userName}@${this.state.host}:${this.state.path}"${this.state.showHidden ? " --show-identical" : ""}`}
        />

        <Modal show={this.state.showDeleteConfirmationDialog} onHide={this.cancelDelete}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <>
              {selectedElements.length > 1 ? (
                <p>
                  Do you want to delete the selected <b>{selectedElements.length} snapshots</b>?
                </p>
              ) : (
                <p>Do you want to delete the selected snapshot?</p>
              )}
              {selectedElements.length === snapshots.length && (
                <Row>
                  <Form.Group>
                    <Form.Check
                      label="Wipe all snapshots and the policy for this source."
                      className="required"
                      checked={this.state.alsoDeleteSource}
                      onChange={() =>
                        this.setState({
                          alsoDeleteSource: !this.state.alsoDeleteSource,
                        })
                      }
                      type="checkbox"
                    />
                  </Form.Group>
                </Row>
              )}
            </>
          </Modal.Body>

          <Modal.Footer>
            <Button size="sm" variant="primary" onClick={this.deleteSelectedSnapshots}>
              Delete
            </Button>
            <Button size="sm" variant="warning" onClick={this.cancelDelete}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={!!this.state.editingDescriptionFor} onHide={this.cancelSnapshotDescription}>
          <Modal.Header closeButton>
            <Modal.Title>Snapshot Description</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group>
              <Form.Label>Enter new description</Form.Label>
              <Form.Control
                as="textarea"
                size="sm"
                value={this.state.updatedSnapshotDescription}
                onChange={(e) => this.setState({ updatedSnapshotDescription: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            {this.state.savingSnapshot && <Spinner animation="border" size="sm" variant="primary" />}
            <Button
              size="sm"
              variant="primary"
              disabled={this.state.originalSnapshotDescription === this.state.updatedSnapshotDescription}
              onClick={this.saveSnapshotDescription}
            >
              Update Description
            </Button>
            {this.state.originalSnapshotDescription && (
              <Button size="sm" variant="secondary" onClick={this.removeSnapshotDescription}>
                Remove Description
              </Button>
            )}
            <Button size="sm" variant="warning" onClick={this.cancelSnapshotDescription}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={!!this.state.editPinFor} onHide={this.cancelPin}>
          <Modal.Header closeButton>
            <Modal.Title>Pin Snapshot</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group>
              <Form.Label>Name of the pin</Form.Label>
              <Form.Control
                size="sm"
                value={this.state.newPinName}
                onChange={(e) => this.setState({ newPinName: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            {this.state.savingSnapshot && <Spinner animation="border" size="sm" variant="primary" />}
            <Button
              size="sm"
              variant="primary"
              onClick={this.savePin}
              disabled={this.state.newPinName === this.state.originalPinName || !this.state.newPinName}
            >
              {this.state.originalPinName ? "Update Pin" : "Add Pin"}
            </Button>
            {this.state.originalPinName && (
              <Button size="sm" variant="secondary" onClick={() => this.removePin(this.state.originalPinName)}>
                Remove Pin
              </Button>
            )}
            <Button size="sm" variant="warning" onClick={this.cancelPin}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

SnapshotHistoryInternal.propTypes = {
  host: PropTypes.string,
  userName: PropTypes.string,
  history: PropTypes.object,
  location: PropTypes.object,
  navigate: PropTypes.func,
};

export function SnapshotHistory(props: any) {
  const navigate = useNavigate();
  const location = useLocation();
  useContext(UIPreferencesContext);

  return <SnapshotHistoryInternal navigate={navigate} location={location} {...props} />;
}
