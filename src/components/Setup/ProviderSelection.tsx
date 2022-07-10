import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import { supportedProviders } from './Providers';

export function ProviderSelection() {
    return <>
        <h3>Select Storage Type</h3>
        <p>To connect to a repository or create one, select the preferred storage type:</p>
        <Row>
            <Col>
                {supportedProviders.map(provider =>
                    <Link key={provider.name}
                        data-testid={'provider-' + provider.name}
                        className={`providerIcon btn btn-${provider.isInternal ? "success" : "primary"}`}
                        to={provider.name}>
                        <span>{provider.description}</span>
                    </Link>
                )}
            </Col>
        </Row>
    </>;
}