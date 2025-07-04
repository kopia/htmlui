import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { DirectoryItems } from "../components/DirectoryItems";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { DirectoryBreadcrumbs } from "../components/DirectoryBreadcrumbs";
import PropTypes from "prop-types";

class SnapshotDirectoryInternal extends Component {
  constructor() {
    super();

    this.state = {
      items: [],
      isLoading: false,
      error: null,
      mountInfo: {},
      oid: "",
    };

    this.mount = this.mount.bind(this);
    this.unmount = this.unmount.bind(this);
    this.browseMounted = this.browseMounted.bind(this);
    this.copyPath = this.copyPath.bind(this);
    this.fetchDirectory = this.fetchDirectory.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.oid !== prevProps.params.oid) {
      console.log("OID changed", prevProps.params.oid, "=>", this.props.params.oid);
      this.fetchDirectory();
    }
  }

  fetchDirectory() {
    let oid = this.props.params.oid;

    this.setState({
      isLoading: true,
      oid: oid,
    });

    axios
      .get("/api/v1/objects/" + oid)
      .then((result) => {
        this.setState({
          items: result.data.entries || [],
          isLoading: false,
        });
      })
      .catch((error) =>
        this.setState({
          error,
          isLoading: false,
        }),
      );

    axios
      .get("/api/v1/mounts/" + oid)
      .then((result) => {
        this.setState({
          mountInfo: result.data,
        });
      })
      .catch((_error) =>
        this.setState({
          mountInfo: {},
        }),
      );
  }

  componentDidMount() {
    this.fetchDirectory();
  }

  mount() {
    axios
      .post("/api/v1/mounts", { root: this.state.oid })
      .then((result) => {
        this.setState({
          mountInfo: result.data,
        });
      })
      .catch((_error) =>
        this.setState({
          mountInfo: {},
        }),
      );
  }

  unmount() {
    axios
      .delete("/api/v1/mounts/" + this.state.oid)
      .then((_result) => {
        this.setState({
          mountInfo: {},
        });
      })
      .catch((error) =>
        this.setState({
          error: error,
          mountInfo: {},
        }),
      );
  }

  browseMounted() {
    if (!window.kopiaUI) {
      alert("Directory browsing is not supported in a web browser. Use Kopia UI.");
      return;
    }

    window.kopiaUI.browseDirectory(this.state.mountInfo.path);
  }

  copyPath() {
    const el = document.querySelector(".mounted-path");
    if (!el) {
      return;
    }

    el.select();
    el.setSelectionRange(0, 99999);

    document.execCommand("copy");
  }

  render() {
    let { items, isLoading, error } = this.state;
    if (error) {
      return <p>ERROR: {error.message}</p>;
    }
    if (isLoading) {
      return <Spinner animation="border" variant="primary" />;
    }

    return (
      <>
        <DirectoryBreadcrumbs />
        <Row>
          <Col xs="auto">
            {this.state.mountInfo.path ? (
              <>
                <Button size="sm" variant="secondary" onClick={this.unmount}>
                  Unmount
                </Button>
                {window.kopiaUI && (
                  <>
                    <Button size="sm" variant="secondary" onClick={this.browseMounted}>
                      Browse
                    </Button>
                  </>
                )}
                <input
                  readOnly={true}
                  className="form-control form-control-sm mounted-path"
                  value={this.state.mountInfo.path}
                />
                <Button size="sm" variant="success" onClick={this.copyPath} data-testid="copy-path-button">
                  <FontAwesomeIcon icon={faCopy} />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="secondary" onClick={this.mount}>
                  Mount as Local Filesystem
                </Button>
              </>
            )}
            &nbsp;
            <Button size="sm" variant="primary" href={"/snapshots/dir/" + this.props.params.oid + "/restore"}>
              Restore Files & Directories
            </Button>
            &nbsp;
          </Col>
          <Col xs={12} md={6}>
            You can mount/restore all the files & directories that you see below or restore files individually.
          </Col>
        </Row>
        <Row>
          <Col>&nbsp;</Col>
        </Row>
        <Row>
          <Col xs={12}>
            <DirectoryItems items={items} historyState={this.props.location.state} />
          </Col>
        </Row>
        <CLIEquivalent command={`snapshot list ${this.state.oid}`} />
      </>
    );
  }
}

SnapshotDirectoryInternal.propTypes = {
  navigate: PropTypes.func,
  params: PropTypes.object,
  location: PropTypes.object,
};

export function SnapshotDirectory(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return <SnapshotDirectoryInternal navigate={navigate} params={params} location={location} {...props} />;
}
