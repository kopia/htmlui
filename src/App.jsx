import axios from 'axios';
import 'bootstrap-dark-5/dist/css/bootstrap-nightshade.min.css';
import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter as Router, NavLink, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import { BeginRestore } from './BeginRestore';
import { DirectoryObject } from "./DirectoryObject";
import { PoliciesTable } from "./PoliciesTable";
import { RepoStatus } from "./RepoStatus";
import { SnapshotsTable } from "./SnapshotsTable";
import { SourcesTable } from "./SourcesTable";
import { TaskDetails } from './TaskDetails';
import { TasksTable } from './TasksTable';
import { NewSnapshot } from './NewSnapshot';
import { PolicyEditorPage } from './PolicyEditorPage';
import { ToggleDarkModeButton } from './ToggleDarkModeButton';
import { AppContext } from './AppContext';
import { UIPreferenceProvider } from './contexts/UIPreferencesContext';

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      runningTaskCount: 0,
      isFetching: false,
      repoDescription: "",
    };

    this.fetchTaskSummary = this.fetchTaskSummary.bind(this);
    this.repositoryUpdated = this.repositoryUpdated.bind(this);
    this.repositoryDescriptionUpdated = this.repositoryDescriptionUpdated.bind(this);
    this.fetchInitialRepositoryDescription = this.fetchInitialRepositoryDescription.bind(this);

    const tok = document.head.querySelector('meta[name="kopia-csrf-token"]');
    if (tok && tok.content) {
      axios.defaults.headers.common['X-Kopia-Csrf-Token'] = tok.content;
    } else {
      axios.defaults.headers.common['X-Kopia-Csrf-Token'] = "-";
    }
  }

  componentDidMount() {
    const av = document.getElementById('appVersion');
    if (av) {
      // show app version after mounting the component to avoid flashing of unstyled content.
      av.style.display = "block";
    }

    this.fetchInitialRepositoryDescription();

    this.taskSummaryInterval = window.setInterval(this.fetchTaskSummary, 5000);
  }

  fetchInitialRepositoryDescription() {
    axios.get('/api/v1/repo/status').then(result => {
      if (result.data.description) {
        this.setState({
          repoDescription: result.data.description,
        });
      }
    }).catch(error => { /* ignore */});
  }

  fetchTaskSummary() {
    if( ! this.state.isFetching )	  
    {
      this.setState({ isFetching: true });
    axios.get('/api/v1/tasks-summary').then(result => {
      this.setState({ isFetching: false, runningTaskCount: result.data["RUNNING"] || 0 });
    }).catch(error => {
      this.setState({ isFetching: false, runningTaskCount: -1 });
    });
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.taskSummaryInterval);
  }

  // this is invoked via AppContext whenever repository is connected, disconnected, etc.
  repositoryUpdated(isConnected) {
    if (isConnected) {
      window.location.replace("/snapshots");
    } else {
      window.location.replace("/repo");
    }
  }

  repositoryDescriptionUpdated(desc) {
    this.setState({
      repoDescription: desc,
    });
  }

  render() {
    const { uiPrefs, runningTaskCount } = this.state;

    return (
      <Router>
        <AppContext.Provider value={this}>
          <UIPreferenceProvider initalValue={uiPrefs}>
            <Navbar expand="sm" variant="light">
              <Navbar.Brand href="/"><img src="/kopia-flat.svg" className="App-logo" alt="logo" /></Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <NavLink data-testid="tab-snapshots" className="nav-link" activeClassName="active" to="/snapshots">Snapshots</NavLink>
                  <NavLink data-testid="tab-policies" className="nav-link" activeClassName="active" to="/policies">Policies</NavLink>
                  <NavLink data-testid="tab-tasks" className="nav-link" activeClassName="active" to="/tasks">Tasks <>
                    {runningTaskCount > 0 && <>({runningTaskCount})</>}
                  </>
                  </NavLink>
                  <NavLink data-testid="tab-repo" className="nav-link" activeClassName="active" to="/repo">Repository</NavLink>
                </Nav>
                <Nav>
                  <ToggleDarkModeButton />
                </Nav>
              </Navbar.Collapse>
            </Navbar>

            <Container fluid>
              <NavLink to="/repo" style={{ color: "inherit", textDecoration: "inherit" }}>
                <h5 className="mb-4">{this.state.repoDescription}</h5>
              </NavLink>

              <Switch>
                <Route path="/snapshots/new" component={NewSnapshot} />
                <Route path="/snapshots/single-source/" component={SnapshotsTable} />
                <Route path="/snapshots/dir/:oid/restore" component={BeginRestore} />
                <Route path="/snapshots/dir/:oid" component={DirectoryObject} />
                <Route path="/snapshots" component={SourcesTable} />
                <Route path="/policies/edit/" component={PolicyEditorPage} />
                <Route path="/policies" component={PoliciesTable} />
                <Route path="/tasks/:tid" component={TaskDetails} />
                <Route path="/tasks" component={TasksTable} />
                <Route path="/repo" component={RepoStatus} />
                <Route exact path="/">
                  <Redirect to="/snapshots" />
                </Route>
              </Switch>
            </Container>
          </UIPreferenceProvider>
        </AppContext.Provider>
      </Router>
    );
  }
}
