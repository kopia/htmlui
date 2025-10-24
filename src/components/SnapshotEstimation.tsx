import { faChevronCircleDown, faChevronCircleUp, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { Component, useContext } from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/esm/Spinner";
import Form from "react-bootstrap/Form";
import { Logs } from "./Logs";
import { sizeDisplayName } from "../utils/formatutils";
import { redirect } from "../utils/uiutil";
import { cancelTask } from "../utils/taskutil";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export class SnapshotEstimationInternal extends Component {
  interval: number | null;

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
    this.setState({
      isLoading: true,
    });

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
      return "Total";
    }

    if (task.status === "CANCELED") {
      return "(Canceled)";
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
      return <p>Loading ...</p>;
    }

    return (
      <>
        {task.counters && (
          <Form.Text className="estimateResults">
            {this.taskStatusDescription(task)} Bytes:{" "}
            <b>{sizeDisplayName(task.counters["Bytes"]?.value, bytesStringBase2)}</b> (
            <b>{sizeDisplayName(task.counters["Excluded Bytes"]?.value, bytesStringBase2)}</b> excluded) Files:{" "}
            <b>{task.counters["Files"]?.value}</b> (<b>{task.counters["Excluded Files"]?.value}</b> excluded)
            Directories: <b>{task.counters["Directories"]?.value}</b> (
            <b>{task.counters["Excluded Directories"]?.value}</b> excluded) Errors:{" "}
            <b>{task.counters["Errors"]?.value}</b> (<b>{task.counters["Ignored Errors"]?.value}</b> ignored)
          </Form.Text>
        )}
        {task.status === "RUNNING" && (
          <>
            &nbsp;
            <Button size="sm" variant="light" onClick={() => cancelTask(task.id)}>
              <FontAwesomeIcon icon={faStopCircle} color="red" /> Cancel{" "}
            </Button>
          </>
        )}
        {this.state.showLog ? (
          <>
            <Button size="sm" variant="light" onClick={() => this.setState({ showLog: false })}>
              <FontAwesomeIcon icon={faChevronCircleUp} /> Hide Log
            </Button>
            <Logs taskID={this.taskID(this.props)} />
          </>
        ) : (
          <Button size="sm" variant="light" onClick={() => this.setState({ showLog: true })}>
            <FontAwesomeIcon icon={faChevronCircleDown} /> Show Log
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
  useContext(UIPreferencesContext);

  return <SnapshotEstimationInternal navigate={navigate} location={location} params={params} {...props} />;
}
