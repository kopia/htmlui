import axios from 'axios';
import 'bootstrap-dark-5/dist/css/bootstrap-nightshade.min.css';
import React, { useEffect, useRef, useState } from 'react';
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
import { ToggleDarkModeButton } from './darkmode';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


function App() {
  const [runningTaskCount, setRunningTaskCount] = useState(0);
  const [uiPrefs, setUIPrefs] = useState({"loading": true});

  function saveUIPrefs(p) {
    axios.put('/api/v1/ui-preferences', p).then(result => {
      setUIPrefs(p);
    }).catch(error => {});
  }

  const tok = document.head.querySelector('meta[name="kopia-csrf-token"]');
  if (tok) {
    axios.defaults.headers.common['X-Kopia-Csrf-Token'] = tok.attr('content');
  } else {
    axios.defaults.headers.common['X-Kopia-Csrf-Token'] = "-";
  }

  if (uiPrefs.loading) {
    axios.get('/api/v1/ui-preferences').then(result => {
      setUIPrefs(result.data);
    }).catch(error => {
      setUIPrefs({});
    });
  }

  useInterval(() => {
    axios.get('/api/v1/tasks-summary').then(result => {
      setRunningTaskCount(result.data["RUNNING"] || 0);
    }).catch(error => {
      setRunningTaskCount(-1);
    });
  }, 1000);
  
  function changeTheme(t) {
    saveUIPrefs({ ...uiPrefs, theme: t })
  }

  return (
    <Router>
      <Navbar expand="sm" variant="light">
        <Navbar.Brand href="/"><img src="/kopia-flat.svg" className="App-logo" alt="logo" /></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavLink className="nav-link" activeClassName="active" to="/snapshots">Snapshots</NavLink>
            <NavLink className="nav-link" activeClassName="active" to="/policies">Policies</NavLink>
            <NavLink className="nav-link" activeClassName="active" to="/tasks">Tasks <>
              {runningTaskCount > 0 && <>({runningTaskCount})</>}
            </>
            </NavLink>
            <NavLink className="nav-link" activeClassName="active" to="/repo">Repository</NavLink>
          </Nav>
          <Nav>
            <ToggleDarkModeButton theme={uiPrefs.theme} onChangeTheme={changeTheme} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid>
        <Switch>
          <Route path="/snapshots/new" component={NewSnapshot} />
          <Route path="/snapshots/single-source/" component={SnapshotsTable} />
          <Route path="/snapshots/dir/:oid/restore" component={BeginRestore} />
          <Route path="/snapshots/dir/:oid"  component={DirectoryObject} />
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
    </Router>
  );
}

export default App;
