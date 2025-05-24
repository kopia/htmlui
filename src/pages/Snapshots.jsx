import { faSync, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import { Link } from "react-router-dom";
import { handleChange } from "../forms";
import KopiaTable from "../utils/KopiaTable";
import {
  CLIEquivalent,
  compare,
  errorAlert,
  ownerName,
  policyEditorURL,
  redirect,
  sizeDisplayName,
  sizeWithFailures,
  sourceQueryStringParams,
} from "../utils/uiutil";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";

const localSnapshots = "Local Snapshots";
const allSnapshots = "All Snapshots";

export class Snapshots extends Component {
  constructor() {
    super();
    this.state = {
      sources: [],
      isLoading: false,
      isFetching: false,
      isRefreshing: false,
      error: null,

      localSourceName: "",
      multiUser: false,
      selectedOwner: null,
      selectedDirectory: "",
    };

    this.sync = this.sync.bind(this);
    this.fetchSourcesWithoutSpinner = this.fetchSourcesWithoutSpinner.bind(this);
    this.handleChange = handleChange.bind(this);

    this.cancelSnapshot = this.cancelSnapshot.bind(this);
    this.startSnapshot = this.startSnapshot.bind(this);
  }

  componentDidMount() {
    const { defaultSnapshotViewAll } = this.context;
    this.setState({
      isLoading: true,
      selectedOwner: defaultSnapshotViewAll ? allSnapshots : localSnapshots,
    });
    this.fetchSourcesWithoutSpinner();
    this.interval = window.setInterval(this.fetchSourcesWithoutSpinner, 3000);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  fetchSourcesWithoutSpinner() {
    if (!this.state.isFetching) {
      this.setState({
        isFetching: true,
      });
      axios
        .get("/api/v1/sources")
        .then((result) => {
          this.setState({
            localSourceName: result.data.localUsername + "@" + result.data.localHost,
            multiUser: result.data.multiUser,
            sources: result.data.sources,
            isLoading: false,
            isFetching: false,
            isRefreshing: false,
          });
        })
        .catch((error) => {
          redirect(error);
          this.setState({
            error,
            isRefreshing: false,
            isFetching: false,
            isLoading: false,
          });
        });
    }
  }

  selectOwner(owner) {
    const { setDefaultSnapshotViewAll } = this.context;
    this.setState({ selectedOwner: owner });
    if (owner === localSnapshots) {
      setDefaultSnapshotViewAll(false);
    } else if (owner === allSnapshots) {
      setDefaultSnapshotViewAll(true);
    }
  }

  sync() {
    this.setState({ isRefreshing: true });
    axios
      .post("/api/v1/repo/sync", {})
      .then((_result) => {
        this.fetchSourcesWithoutSpinner();
      })
      .catch((error) => {
        errorAlert(error);
        this.setState({
          error,
          isRefreshing: false,
        });
      });
  }

  /**
   * Sets the header of an cell dynamically based on it's status
   * @param x - the cell which status is interpreted
   * @returns - the header of the cell
   */
  setHeader(x) {
    switch (x.cell.getValue()) {
      case "IDLE":
      case "PAUSED":
        return (x.cell.column.Header = "Actions");
      case "PENDING":
      case "UPLOADING":
        return (x.cell.column.Header = "Status");
      default:
        return (x.cell.column.Header = "");
    }
  }

  /**
   * Sets the content an cell dynamically based on it's status
   * @param x - the cell which content is changed
   * @returns - the content of the cell
   */
  statusCell(x, parent, bytesStringBase2) {
    this.setHeader(x);
    switch (x.cell.getValue()) {
      case "IDLE":
      case "PAUSED":
        return (
          <>
            <Button
              data-testid="edit-policy"
              as={Link}
              to={policyEditorURL(x.row.original.source)}
              variant="primary"
              size="sm"
            >
              Policy
            </Button>
            <Button
              data-testid="snapshot-now"
              variant="success"
              size="sm"
              onClick={() => {
                parent.startSnapshot(x.row.original.source);
              }}
            >
              Snapshot Now
            </Button>
          </>
        );

      case "PENDING":
        return (
          <>
            <Spinner
              data-testid="snapshot-pending"
              animation="border"
              variant="secondary"
              size="sm"
              title="Snapshot will start after the previous snapshot completes"
            />
            &nbsp;Pending
          </>
        );

      case "UPLOADING": {
        let u = x.row.original.upload;
        let title = "";
        let totals = "";
        if (u) {
          title =
            " hashed " +
            u.hashedFiles +
            " files (" +
            sizeDisplayName(u.hashedBytes, bytesStringBase2) +
            ")\n" +
            " cached " +
            u.cachedFiles +
            " files (" +
            sizeDisplayName(u.cachedBytes, bytesStringBase2) +
            ")\n" +
            " dir " +
            u.directory;

          const totalBytes = u.hashedBytes + u.cachedBytes;

          totals = sizeDisplayName(totalBytes, bytesStringBase2);
          if (u.estimatedBytes) {
            totals += "/" + sizeDisplayName(u.estimatedBytes, bytesStringBase2);

            const percent = Math.round((totalBytes * 1000.0) / u.estimatedBytes) / 10.0;
            if (percent <= 100) {
              totals += " " + percent + "%";
            }
          }
        }

        return (
          <>
            <Spinner data-testid="snapshot-uploading" animation="border" variant="primary" size="sm" title={title} />
            &nbsp;{totals}
            &nbsp;
            {x.row.original.currentTask && <Link to={"/tasks/" + x.row.original.currentTask}>Details</Link>}
          </>
        );
      }

      default:
        return "";
    }
  }

  cancelSnapshot(source) {
    axios
      .post("/api/v1/sources/cancel?" + sourceQueryStringParams(source), {})
      .then((_result) => {
        this.fetchSourcesWithoutSpinner();
      })
      .catch((error) => {
        errorAlert(error);
      });
  }

  startSnapshot(source) {
    axios
      .post("/api/v1/sources/upload?" + sourceQueryStringParams(source), {})
      .then((_result) => {
        this.fetchSourcesWithoutSpinner();
      })
      .catch((error) => {
        errorAlert(error);
      });
  }

  nextSnapshotTimeCell(x) {
    if (!x.cell.getValue()) {
      if (x.row.original.status === "PAUSED") {
        return "paused";
      }

      return "";
    }

    if (x.row.original.status === "UPLOADING") {
      return "";
    }

    return (
      <p title={moment(x.cell.getValue()).toLocaleString()}>
        {moment(x.cell.getValue()).fromNow()}
        {moment(x.cell.getValue()).isBefore(moment()) && (
          <>
            &nbsp;
            <Badge bg="secondary">overdue</Badge>
          </>
        )}
      </p>
    );
  }

  render() {
    let { sources, isLoading, error } = this.state;
    const { bytesStringBase2 } = this.context;
    if (error) {
      return <p>{error.message}</p>;
    }
    if (isLoading) {
      return <Spinner animation="border" variant="primary" />;
    }
    let uniqueOwners = sources.reduce((a, d) => {
      const owner = ownerName(d.source);

      if (!a.includes(owner)) {
        a.push(owner);
      }
      return a;
    }, []);

    uniqueOwners.sort();

    switch (this.state.selectedOwner) {
      case allSnapshots:
        // do nothing;
        break;

      case localSnapshots:
        sources = sources.filter((x) => ownerName(x.source) === this.state.localSourceName);
        break;

      default:
        sources = sources.filter((x) => ownerName(x.source) === this.state.selectedOwner);
        break;
    }

    const columns = [
      {
        id: "path",
        header: "Path",
        accessorFn: (x) => x.source,
        sortType: (a, b) => {
          const v = compare(a.original.source.path, b.original.source.path);
          if (v !== 0) {
            return v;
          }

          return compare(ownerName(a.original.source), ownerName(b.original.source));
        },
        width: "",
        cell: (x) => (
          <Link to={"/snapshots/single-source?" + sourceQueryStringParams(x.cell.getValue())}>
            {x.cell.getValue().path}
          </Link>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        accessorFn: (x) => x.source.userName + "@" + x.source.host,
        width: 250,
      },
      {
        id: "lastSnapshotSize",
        header: "Size",
        width: 120,
        accessorFn: (x) => (x.lastSnapshot ? x.lastSnapshot.stats.totalSize : 0),
        cell: (x) =>
          sizeWithFailures(
            x.cell.getValue(),
            x.row.original.lastSnapshot && x.row.original.lastSnapshot.rootEntry
              ? x.row.original.lastSnapshot.rootEntry.summ
              : null,
            bytesStringBase2,
          ),
      },
      {
        id: "lastSnapshotTime",
        header: "Last Snapshot",
        width: 160,
        accessorFn: (x) => (x.lastSnapshot ? x.lastSnapshot.startTime : null),
        cell: (x) =>
          x.cell.getValue() ? (
            <p title={moment(x.cell.getValue()).toLocaleString()}>{moment(x.cell.getValue()).fromNow()}</p>
          ) : (
            ""
          ),
      },
      {
        id: "nextSnapshotTime",
        header: "Next Snapshot",
        width: 160,
        accessorFn: (x) => x.nextSnapshotTime,
        cell: (x) => this.nextSnapshotTimeCell(x),
      },
      {
        id: "status",
        header: "",
        width: 300,
        accessorFn: (x) => x.status,
        cell: (x) => this.statusCell(x, this, bytesStringBase2),
      },
    ];

    return (
      <>
        <div className="list-actions">
          <Row>
            {this.state.multiUser && (
              <>
                <Col xs="auto">
                  <Dropdown>
                    <Dropdown.Toggle size="sm" variant="primary" id="dropdown-basic">
                      <FontAwesomeIcon icon={faUserFriends} />
                      &nbsp;{this.state.selectedOwner}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => this.selectOwner(localSnapshots)}>{localSnapshots}</Dropdown.Item>
                      <Dropdown.Item onClick={() => this.selectOwner(allSnapshots)}>{allSnapshots}</Dropdown.Item>
                      <Dropdown.Divider />
                      {uniqueOwners.map((v) => (
                        <Dropdown.Item key={v} onClick={() => this.selectOwner(v)}>
                          {v}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </>
            )}
            <Col xs="auto">
              <Button data-testid="new-snapshot" size="sm" variant="primary" href="/snapshots/new">
                New Snapshot
              </Button>
            </Col>
            <Col></Col>
            <Col xs="auto">
              <Button size="sm" title="Synchronize" variant="primary">
                {this.state.isRefreshing ? (
                  <Spinner animation="border" variant="light" size="sm" />
                ) : (
                  <FontAwesomeIcon icon={faSync} onClick={this.sync} />
                )}
              </Button>
            </Col>
          </Row>
        </div>

        <KopiaTable data={sources} columns={columns} />
        <CLIEquivalent command={`snapshot list`} />
      </>
    );
  }
}
Snapshots.contextType = UIPreferencesContext;
