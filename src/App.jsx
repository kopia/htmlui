import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Theme.css';
import './css/App.css';
import axios from 'axios';
import { React, useCallback, useLayoutEffect, useState, useContext } from 'react';
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

export default function App({ uiPrefs }) {
  const context = useContext(AppContext);
  const [runningTaskCount, setRunningTaskCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [repoDescription, setRepoDescription] = useState("");

  const token = document.head.querySelector('meta[name="kopia-csrf-token"]');
  if (token && token.content) {
    axios.defaults.headers.common['X-Kopia-Csrf-Token'] = token.content;
  } else {
    axios.defaults.headers.common['X-Kopia-Csrf-Token'] = "-";
  }

  const fetchRepositoryDescription = useCallback(() => {
    axios.get('/api/v1/repo/status').then(result => {
      if (result.data.description) {
        setRepoDescription(result.data.description)
      }
    }).catch(error => { /* ignore */ })
  }, [])

  const fetchTaskSummary = useCallback(() => {
    if (!isLoading) {
      setIsLoading(true);
      axios.get('/api/v1/tasks-summary').then(result => {
        setIsLoading(false);
        setRunningTaskCount(result.data["RUNNING"] || 0);
      }).catch(error => {
        setIsLoading(false);
        setRunningTaskCount(-1);
      });
    }
  }, [isLoading])

  useLayoutEffect(() => {
    const appVersion = document.getElementById('appVersion');
    if (appVersion) {
      // show app version after mounting the component to avoid flashing of unstyled content.
      appVersion.style.display = "block";
    }

    let interval = setInterval(fetchTaskSummary, 5000)
    fetchRepositoryDescription();
    return () => {
      window.clearInterval(interval);
    };
  }, [fetchRepositoryDescription, fetchTaskSummary]);

  return (
    <Router>
      <AppContext.Provider value={context}>
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
              <h5 className="mb-4">{repoDescription}</h5>
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