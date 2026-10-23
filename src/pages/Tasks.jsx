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
import { Link } from "react-router";
import { handleChange } from "../forms";
import KopiaTable from "../components/KopiaTable";
import { redirect } from "../utils/uiutil";
import { taskStatusSymbol } from "../utils/taskutil";
import i18n from "../utils/i18n";

export class Tasks extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      isLoading: true,
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

  filterItems(items) {
    return items.filter((c) => this.taskMatches(c));
  }

  render() {
    const { items, isLoading, error } = this.state;
    if (error) {
      return <p>{error.message}</p>;
    }
    if (isLoading) {
      return <p>{i18n.t("tasks:loading")}</p>;
    }

    const columns = [
      {
        header: i18n.t("tasks:startTime"),
        width: 160,
        cell: (x) => (
          <Link to={"/tasks/" + x.row.original.id} title={moment(x.row.original.startTime).toLocaleString()}>
            {moment(x.row.original.startTime).fromNow()}
          </Link>
        ),
      },
      {
        header: i18n.t("tasks:status"),
        width: 240,
        cell: (x) => taskStatusSymbol(x.row.original),
      },
      {
        header: i18n.t("tasks:kind"),
        width: "",
        cell: (x) => <p>{x.row.original.kind}</p>,
      },
      {
        header: i18n.t("tasks:description"),
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
                    {i18n.t("tasks:status")}: {i18n.t(`tasks:${this.state.showStatus.toLowerCase()}`)}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => this.setState({ showStatus: "All" })}>
                      {i18n.t("tasks:all")}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => this.setState({ showStatus: "Running" })}>
                      {i18n.t("tasks:running")}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setState({ showStatus: "Failed" })}>
                      {i18n.t("tasks:failed")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col xs="auto">
                <Dropdown>
                  <Dropdown.Toggle size="sm" variant="primary">
                    {i18n.t("tasks:kind")}: {this.state.showKind === "All" ? i18n.t("tasks:all") : this.state.showKind}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => this.setState({ showKind: "All" })}>
                      {i18n.t("tasks:all")}
                    </Dropdown.Item>
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
                  placeholder={i18n.t("tasks:search")}
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
