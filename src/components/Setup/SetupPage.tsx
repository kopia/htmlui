import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Route, Routes } from 'react-router-dom';
import { CreateRepository } from './CreateRepository';
import { supportedProviders } from './Providers';
import { ProviderSelection } from './ProviderSelection';

export function SetupPage() {
    return <>
        <Navbar expand="sm" variant="light">
            <Navbar.Brand href="/connect">
                <img src="/kopia-flat.svg" className="App-logo" alt="logo" />
            </Navbar.Brand>
            <h3 className='mb-0'>Connect To Repository</h3>
        </Navbar>

        <Container fluid>
            <Routes>
                <Route index element={<ProviderSelection />} />
                <Route path="create" element={<CreateRepository />} />
                {supportedProviders.map(provider => <Route key={provider.name} path={provider.name} element={provider.render(provider)} />)}
            </Routes>
        </Container>
    </>;
}