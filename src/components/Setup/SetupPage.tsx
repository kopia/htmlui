import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter as Router, NavLink, Outlet } from 'react-router-dom';

export function SetupPage() {
    return <>
        <Navbar expand="sm" variant="light">
            <Navbar.Brand href="/connect"><img src="/kopia-flat.svg" className="App-logo" alt="logo" /></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <h3 style={{ marginBottom: 0 }}>Connect To Repository</h3>
        </Navbar>

        <Container fluid>
            <Outlet />
        </Container>
    </>;
}