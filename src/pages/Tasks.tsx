import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Link } from "react-router-dom";
import { handleChange } from "../forms";
import KopiaTable from "../components/KopiaTable";
import { redirect } from "../utils/uiutil";
import { taskStatusSymbol } from "../utils/taskutil";
import { ChangeEventHandle, ComponentChangeHandling } from "src/components/types";

export class Tasks extends Component implements ComponentChangeHandling {
  handleChange: ChangeEventHandle;
  interval: number;

  constructor() {
    super();
    this.state = {
      items: [],
      isLoading: false,
      error: null,
      showKind: "All",
      showStatus: "All",
      uniqueKinds: [],
      searchDescription: "",
    };

    this.handleChange = handleChange.bind(this);
    this.fetchTasks = this.fetchTasks.bind(this);
    this.interval = window.setInterval(this.fetchTasks, 3000);
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });

    this.fetchTasks();
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  getUniqueKinds(tasks) {
    let o = {};

    for (const tsk of tasks) {
      o[tsk.kind] = true;
    }

    let result = [];
    for (const kind in o) {
      result.push(kind);
    }

    return result;
  }

  fetchTasks() {
    axios
      .get("/api/v1/tasks")
      .then((result) => {
        this.setState({
          items: result.data.tasks,
          uniqueKinds: this.getUniqueKinds(result.data.tasks),
          isLoading: false,
        });
      })
      .catch((error) => {
        redirect(error);
        this.setState({
          error,
          isLoading: false,
        });
      });
  }

  taskMatches(t) {
    if (this.state.showKind !== "All" && t.kind !== this.state.showKind) {
      return false;
    }

    if (this.state.showStatus !== "All" && t.status.toLowerCase() !== this.state.showStatus.toLowerCase()) {
      return false;
    }

    if (this.state.searchDescription && t.description.indexOf(this.state.searchDescription) < 0) {
      return false;
    }

    return true;
  }

  filterItems(items: any[]) {
    return items.filter((c) => this.taskMatches(c));
  }

  render() {
    const { items, isLoading, error } = this.state;
    if (error) {
      return <p>{error.message}</p>;
    }
    if (isLoading) {
      return <p>Loading ...</p>;
    }

    const columns = [
      {
        header: "Start Time",
        width: 160,
        cell: (x) => (
          <Link to={"/tasks/" + x.row.original.id} title={moment(x.row.original.startTime).toLocaleString()}>
            {moment(x.row.original.startTime).fromNow()}
          </Link>
        ),
      },
      {
        header: "Status",
        width: 240,
        cell: (x) => taskStatusSymbol(x.row.original),
      },
      {
        header: "Kind",
        width: "",
        cell: (x) => <p>{x.row.original.kind}</p>,
      },
      {
        header: "Description",
        width: "",
        cell: (x) => <p>{x.row.original.description}</p>,
      },
    ];

    const filteredItems = this.filterItems(items);

    return (
      <>
        <Form>
          <div className="list-actions">
            <Row>
              <Col xs="auto">
                <Dropdown>
                  <Dropdown.Toggle size="sm" variant="primary">
                    Status: {this.state.showStatus}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => this.setState({ showStatus: "All" })}>All</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => this.setState({ showStatus: "Running" })}>Running</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setState({ showStatus: "Failed" })}>Failed</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col xs="auto">
                <Dropdown>
                  <Dropdown.Toggle size="sm" variant="primary">
                    Kind: {this.state.showKind}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => this.setState({ showKind: "All" })}>All</Dropdown.Item>
                    <Dropdown.Divider />
                    {this.state.uniqueKinds.map((k) => (
                      <Dropdown.Item key={k} onClick={() => this.setState({ showKind: k })}>
                        {k}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col xs="4">
                <Form.Control
                  size="sm"
                  type="text"
                  name="searchDescription"
                  placeholder="case-sensitive search description"
                  value={this.state.searchDescription}
                  onChange={this.handleChange}
                  autoFocus={true}
                />
              </Col>
            </Row>
          </div>
          <Row>
            <Col>
              {!items.length ? (
                <Alert variant="info">
                  <FontAwesomeIcon size="sm" icon={faInfoCircle} /> A list of tasks will appear here when you create
                  snapshots, restore, run maintenance, etc.
                </Alert>
              ) : (
                <KopiaTable data={filteredItems} columns={columns} />
              )}
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}
