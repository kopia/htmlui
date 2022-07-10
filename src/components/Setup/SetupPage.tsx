import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Outlet } from 'react-router-dom';

export function SetupPage() {
    return <>
        <Navbar expand="sm" variant="light">
            <Navbar.Brand href="/connect">
                <img src="/kopia-flat.svg" className="App-logo" alt="logo" />
            </Navbar.Brand>
            <h3 className='mb-0'>Connect To Repository</h3>
        </Navbar>

        <Container fluid>
            <Outlet />
        </Container>
    </>;
}