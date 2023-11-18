import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Theme.css';
import './css/App.css';
import axios from 'axios';
import { React, Component } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { BrowserRouter as Router, NavLink, Redirect, Route, Switch } from 'react-router-dom';
import { Policy } from './pages/Policy';
import { Preferences } from './pages/Preferences';
import { Policies } from "./pages/Policies";
import { Repository } from "./pages/Repository";
import { Task } from './pages/Task';
import { Tasks } from './pages/Tasks';
import { Snapshots } from "./pages/Snapshots";
import { SnapshotCreate } from './pages/SnapshotCreate';
import { SnapshotDirectory } from "./pages/SnapshotDirectory";
import { SnapshotHistory } from "./pages/SnapshotHistory";
import { SnapshotRestore } from './pages/SnapshotRestore';
import { AppContext } from './contexts/AppContext';
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
    }).catch(error => { /* ignore */ });
  }

  fetchTaskSummary() {
    if (!this.state.isFetching) {
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
                  <NavLink data-testid="tab-preferences" className="nav-link" activeClassName="active" to="/preferences">Preferences</NavLink>
                </Nav>
              </Navbar.Collapse>
            </Navbar>

            <Container fluid>
              <NavLink to="/repo" style={{ color: "inherit", textDecoration: "inherit" }}>
                <h5 className="mb-4">{this.state.repoDescription}</h5>
              </NavLink>

              <Switch>
                <Route path="/snapshots/new" component={SnapshotCreate} />
                <Route path="/snapshots/single-source/" component={SnapshotHistory} />
                <Route path="/snapshots/dir/:oid/restore" component={SnapshotRestore} />
                <Route path="/snapshots/dir/:oid" component={SnapshotDirectory} />
                <Route path="/snapshots" component={Snapshots} />
                <Route path="/policies/edit/" component={Policy} />
                <Route path="/policies" component={Policies} />
                <Route path="/tasks/:tid" component={Task} />
                <Route path="/tasks" component={Tasks} />
                <Route path="/repo" component={Repository} />
                <Route path="/preferences" component={Preferences} />
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
