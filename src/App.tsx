import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter as Router, NavLink, Outlet } from 'react-router-dom';
import './App.css';
import { ToggleDarkModeButton } from './ToggleDarkModeButton';
import { AppContext, defaultValue as appContextDefaultValue } from './contexts/AppContext';
import { UIPreferenceProvider, UIPreferences } from './contexts/UIPreferencesContext';

export function App() {
  const taskSummaryInterval = useRef<number>();

  const [runningTaskCount, setRunningTaskCount] = useState(0);
  const [uiPrefs, setUiPrefs] = useState<UIPreferences>();
  const [appContext, setAppContext] = useState(appContextDefaultValue);

  const fetchTaskSummary = async () => {
    try {
      const response = await axios.get('/api/v1/tasks-summary');
      setRunningTaskCount(response.data["RUNNING"] || 0);
    }
    catch {
      setRunningTaskCount(-1);
    }
  };

  // this is invoked via AppContext whenever repository is connected, disconnected, etc.
  const repositoryUpdated = (isConnected: boolean) => {
    if (isConnected) {
      window.location.replace("/snapshots");
    } else {
      window.location.replace("/repo");
    }
  }

  useEffect(() => {
    const csrfToken = document.head.querySelector<HTMLMetaElement>('meta[name="kopia-csrf-token"]');
    if (csrfToken && csrfToken.content) {
      axios.defaults.headers.common['X-Kopia-Csrf-Token'] = csrfToken.content;
    } else {
      axios.defaults.headers.common['X-Kopia-Csrf-Token'] = "-";
    }

    const av = document.getElementById('appVersion');
    if (av) {
      // show app version after mounting the component to avoid flashing of unstyled content.
      av.style.display = "block";
    }

    taskSummaryInterval.current = window.setInterval(fetchTaskSummary, 5000);

    // On unmount
    return () => {
      const interval = taskSummaryInterval.current;
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, []);

  return (
    <AppContext.Provider value={appContext}>
      <UIPreferenceProvider initalValue={uiPrefs}>
        <Navbar expand="sm" variant="light">
          <Navbar.Brand href="/"><img src="/kopia-flat.svg" className="App-logo" alt="logo" /></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavLink data-testid="tab-snapshots" className="nav-link" to="/snapshots">Snapshots</NavLink>
              <NavLink data-testid="tab-policies" className="nav-link" to="/policies">Policies</NavLink>
              <NavLink data-testid="tab-tasks" className="nav-link" to="/tasks">Tasks <>
                {runningTaskCount > 0 && <>({runningTaskCount})</>}
              </>
              </NavLink>
              <NavLink data-testid="tab-repo" className="nav-link" to="/repo">Repository</NavLink>
            </Nav>
            <Nav>
              <ToggleDarkModeButton />
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Container fluid>
          <NavLink to="/repo" style={{ color: "inherit", textDecoration: "inherit" }}>
            <h3 className="mb-4">{appContext.repoDescription}</h3>
          </NavLink>

          <Outlet />
        </Container>
      </UIPreferenceProvider>
    </AppContext.Provider>
  );
}
