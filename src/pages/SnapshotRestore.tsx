import axios from "axios";
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";
import { RequiredNumberField } from "../forms/RequiredNumberField";
import { errorAlert } from "../utils/uiutil";
import { GoBackButton } from "../components/GoBackButton";
import PropTypes from "prop-types";
import { ChangeEventHandle, ComponentChangeHandling } from "src/components/types";

interface SnapshotRestoreRequest {
  root: any;
  options: {
    incremental: boolean;
    ignoreErrors: boolean;
    restoreDirEntryAtDepth: number;
    minSizeForPlaceholder: number;
  };
  zipFile?: string;
  uncompressedZip?: boolean;
  tarFile?: string;
  fsOutput?: {
    targetPath: string;
    skipOwners: boolean;
    skipPermissions: boolean;
    skipTimes: boolean;
    ignorePermissionErrors: boolean;
    overwriteFiles: boolean;
    overwriteDirectories: boolean;
    overwriteSymlinks: boolean;
    writeFilesAtomically: boolean;
    writeSparseFiles: boolean;
  };
}

interface SnapshotRestoreInternalState {
  incremental: boolean;
  continueOnErrors: boolean;
  restoreOwnership: boolean;
  restorePermissions: boolean;
  restoreModTimes: boolean;
  uncompressedZip: boolean;
  overwriteFiles: boolean;
  overwriteDirectories: boolean;
  overwriteSymlinks: boolean;
  ignorePermissionErrors: boolean;
  writeFilesAtomically: boolean;
  writeSparseFiles: boolean;
  restoreDirEntryAtDepth: number;
  minSizeForPlaceholder: number;
  restoreTask: string;
  destination?: string;
}

export class SnapshotRestoreInternal
  extends Component<any, SnapshotRestoreInternalState>
  implements ComponentChangeHandling
{
  handleChange: ChangeEventHandle;

  constructor() {
    super();

    this.state = {
      incremental: true,
      continueOnErrors: false,
      restoreOwnership: true,
      restorePermissions: true,
      restoreModTimes: true,
      uncompressedZip: true,
      overwriteFiles: false,
      overwriteDirectories: false,
      overwriteSymlinks: false,
      ignorePermissionErrors: true,
      writeFilesAtomically: false,
      writeSparseFiles: false,
      restoreDirEntryAtDepth: 1000,
      minSizeForPlaceholder: 0,
      restoreTask: "",
    };

    this.handleChange = handleChange.bind(this);
    this.start = this.start.bind(this);
  }

  start(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateRequiredFields(this, ["destination"])) {
      return;
    }

    const dst = this.state.destination + "";

    const req: SnapshotRestoreRequest = {
      root: this.props.params.oid,
      options: {
        incremental: this.state.incremental,
        ignoreErrors: this.state.continueOnErrors,
        restoreDirEntryAtDepth: this.state.restoreDirEntryAtDepth,
        minSizeForPlaceholder: this.state.minSizeForPlaceholder,
      },
    };

    if (dst.endsWith(".zip")) {
      req.zipFile = dst;
      req.uncompressedZip = this.state.uncompressedZip;
    } else if (dst.endsWith(".tar")) {
      req.tarFile = dst;
    } else {
      req.fsOutput = {
        targetPath: dst,
        skipOwners: !this.state.restoreOwnership,
        skipPermissions: !this.state.restorePermissions,
        skipTimes: !this.state.restoreModTimes,

        ignorePermissionErrors: this.state.ignorePermissionErrors,
        overwriteFiles: this.state.overwriteFiles,
        overwriteDirectories: this.state.overwriteDirectories,
        overwriteSymlinks: this.state.overwriteSymlinks,
        writeFilesAtomically: this.state.writeFilesAtomically,
        writeSparseFiles: this.state.writeSparseFiles,
      };
    }

    axios
      .post("/api/v1/restore", req)
      .then((result) => {
        this.setState({
          restoreTask: result.data.id,
        });
      })
      .catch((error) => {
        errorAlert(error);
      });
  }

  render() {
    if (this.state.restoreTask) {
      return (
        <p>
          <GoBackButton />
          <Link replace={true} to={`/tasks/${this.state.restoreTask}`}>
            Go To Restore Task
          </Link>
          .
        </p>
      );
    }

    return (
      <div className="padded-top">
        <GoBackButton />
        &nbsp;<span className="page-title">Restore</span>
        <hr />
        <Form onSubmit={this.start}>
          <Row>
            {RequiredField(
              this,
              "Destination",
              "destination",
              {
                autoFocus: true,
                placeholder: "enter destination path",
              },
              "You can also restore to a .zip or .tar file by providing the appropriate extension.",
            )}
          </Row>
          <Row>{RequiredBoolean(this, "Skip previously restored files and symlinks", "incremental")}</Row>
          <Row>
            {RequiredBoolean(
              this,
              "Continue on Errors",
              "continueOnErrors",
              "When a restore error occurs, attempt to continue instead of failing fast.",
            )}
          </Row>
          <Row>{RequiredBoolean(this, "Restore File Ownership", "restoreOwnership")}</Row>
          <Row>{RequiredBoolean(this, "Restore File Permissions", "restorePermissions")}</Row>
          <Row>{RequiredBoolean(this, "Restore File Modification Time", "restoreModTimes")}</Row>
          <Row>{RequiredBoolean(this, "Overwrite Files", "overwriteFiles")}</Row>
          <Row>{RequiredBoolean(this, "Overwrite Directories", "overwriteDirectories")}</Row>
          <Row>{RequiredBoolean(this, "Overwrite Symbolic Links", "overwriteSymlinks")}</Row>
          <Row>{RequiredBoolean(this, "Write files atomically", "writeFilesAtomically")}</Row>
          <Row>{RequiredBoolean(this, "Write Sparse Files", "writeSparseFiles")}</Row>
          <Row>
            <Col>
              <hr />
            </Col>
          </Row>
          <Row>
            {RequiredNumberField(this, "Shallow Restore At Depth", "restoreDirEntryAtDepth")}
            {RequiredNumberField(this, "Minimal File Size For Shallow Restore", "minSizeForPlaceholder")}
          </Row>
          <Row>
            <Col>
              <hr />
            </Col>
          </Row>
          <Row>
            {RequiredBoolean(
              this,
              "Disable ZIP compression",
              "uncompressedZip",
              "Do not compress when restoring to a ZIP file (faster).",
            )}
          </Row>
          <Row>
            <Col>
              <hr />
            </Col>
          </Row>
          <Row>
            <Col>
              <Button variant="primary" type="submit" data-testid="submit-button">
                Begin Restore
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

SnapshotRestoreInternal.propTypes = {
  params: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export function SnapshotRestore(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return <SnapshotRestoreInternal navigate={navigate} location={location} params={params} {...props} />;
}
