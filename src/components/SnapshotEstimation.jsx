import { faChevronCircleDown, faChevronCircleUp, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { Component, use } from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/esm/Spinner";
import Form from "react-bootstrap/Form";
import { Logs } from "./Logs";
import { sizeDisplayName } from "../utils/formatutils";
import { redirect } from "../utils/uiutil";
import { cancelTask } from "../utils/taskutil";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { useNavigate, useLocation, useParams } from "react-router";
import i18n from "../utils/i18n";

export class SnapshotEstimationInternal extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      error: null,
      showLog: false,
    };

    this.taskID = this.taskID.bind(this);
    this.fetchTask = this.fetchTask.bind(this);

    // poll frequently, we will stop as soon as the task ends.
    this.interval = window.setInterval(() => this.fetchTask(this.props), 500);
  }

  componentDidMount() {
    this.fetchTask(this.props);
  }

  componentWillUnmount() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
  }

  taskID(props) {
    return props.taskID || props.params.tid;
  }

  fetchTask(props) {
    axios
      .get("/api/v1/tasks/" + this.taskID(props))
      .then((result) => {
        this.setState({
          task: result.data,
          isLoading: false,
        });

        if (result.data.endTime) {
          window.clearInterval(this.interval);
          this.interval = null;
        }
      })
      .catch((error) => {
        redirect(error);
        this.setState({
          error,
          isLoading: false,
        });
      });
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.fetchTask(this.props);
    }
  }

  taskStatusDescription(task) {
    if (task.status === "RUNNING") {
      return (
        <>
          <Spinner animation="border" variant="primary" size="sm" />
        </>
      );
    }

    if (task.status === "SUCCESS") {
      return i18n.t("snapshots:total");
    }

    if (task.status === "CANCELED") {
      return i18n.t("snapshots:canceled");
    }

    return task.status;
  }

  render() {
    const { task, isLoading, error } = this.state;
    const { bytesStringBase2 } = this.context;
    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <p>{i18n.t("common:loading")}</p>;
    }

    return (
      <>
        {task.counters && (
          <Form.Text className="estimateResults">
            {this.taskStatusDescription(task)} {i18n.t("snapshots:bytes")}: {" "}
            <b>{sizeDisplayName(task.counters["Bytes"]?.value, bytesStringBase2)}</b> (
            <b>{sizeDisplayName(task.counters["Excluded Bytes"]?.value, bytesStringBase2)}</b> {i18n.t("snapshots:excluded")}) {i18n.t("snapshots:files")}: {" "}
            <b>{task.counters["Files"]?.value}</b> (<b>{task.counters["Excluded Files"]?.value}</b> {i18n.t("snapshots:excluded")}) {" "}
            {i18n.t("snapshots:directories")}: <b>{task.counters["Directories"]?.value}</b> (
            <b>{task.counters["Excluded Directories"]?.value}</b> {i18n.t("snapshots:excluded")}) {i18n.t("snapshots:errors")}: {" "}
            <b>{task.counters["Errors"]?.value}</b> (<b>{task.counters["Ignored Errors"]?.value}</b> {i18n.t("snapshots:ignored")})
          </Form.Text>
        )}
        {task.status === "RUNNING" && (
          <>
            &nbsp;
            <Button size="sm" variant="light" onClick={() => cancelTask(task.id)}>
              <FontAwesomeIcon icon={faStopCircle} color="red" /> {i18n.t("snapshots:cancel")}{" "}
            </Button>
          </>
        )}
        {this.state.showLog ? (
          <>
            <Button size="sm" variant="light" onClick={() => this.setState({ showLog: false })}>
              <FontAwesomeIcon icon={faChevronCircleUp} /> {i18n.t("snapshots:hideLog")}
            </Button>
            <Logs taskID={this.taskID(this.props)} />
          </>
        ) : (
          <Button size="sm" variant="light" onClick={() => this.setState({ showLog: true })}>
            <FontAwesomeIcon icon={faChevronCircleDown} /> {i18n.t("snapshots:showLog")}
          </Button>
        )}
      </>
    );
  }
}

export function SnapshotEstimation(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  use(UIPreferencesContext);

  return <SnapshotEstimationInternal navigate={navigate} location={location} params={params} {...props} />;
}
