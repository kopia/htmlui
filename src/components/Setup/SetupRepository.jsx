
import axios from 'axios';
import { Component, createRef } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Collapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { AppContext } from '../../contexts/AppContext';
import { handleChange, RequiredBoolean, RequiredField, validateRequiredFields } from '../../forms';

export class SetupRepository extends Component {
    constructor() {
        super();

        this.state = {
            confirmCreate: false,
            isLoading: false,
            showAdvanced: false,
            storageVerified: false,
            providerSettings: {},
            description: "My Repository",
            formatVersion: "2",
        };

        this.handleChange = handleChange.bind(this);
        this.optionsEditor = createRef();
        this.connectToRepository = this.connectToRepository.bind(this);
        this.createRepository = this.createRepository.bind(this);
        this.cancelCreate = this.cancelCreate.bind(this);
        this.toggleAdvanced = this.toggleAdvanced.bind(this);
        this.verifyStorage = this.verifyStorage.bind(this);
    }


    connectToRepository(e) {
        e.preventDefault();
        if (!this.validate()) {
            return;
        }

        let request = null;
        switch (this.state.provider) {
            case "_token":
                request = {
                    token: this.state.providerSettings.token,
                };
                break;

            case "_server":
                request = {
                    apiServer: this.state.providerSettings,
                    password: this.state.password,
                };
                break;

            default:
                request = {
                    storage: {
                        type: this.state.provider,
                        config: this.state.providerSettings,
                    },
                    password: this.state.password,
                };
                break;
        }

        request.clientOptions = this.clientOptions();

        this.setState({ isLoading: true });
        axios.post('/api/v1/repo/connect', request).then(result => {
            this.setState({ isLoading: false });
            this.context.repositoryUpdated(true);
        }).catch(error => {
            this.setState({ isLoading: false });
            if (error.response.data) {
                this.setState({
                    confirmCreate: false,
                    connectError: error.response.data.code + ": " + error.response.data.error,
                });
            }
        });
    }

    clientOptions() {
        return {
            description: this.state.description,
            username: this.state.username,
            readonly: this.state.readonly,
            hostname: this.state.hostname,
        };
    }

    renderConfirmConnect() {
        return <Form onSubmit={this.connectToRepository}>
            
            
            {/* Done connectError */}
            <hr />
            <Button data-testid='back-button' variant="secondary" onClick={() => this.setState({ storageVerified: false })}>Back</Button>
            &nbsp;
            <Button variant="success" type="submit" data-testid="submit-button">Connect To Repository</Button>
            {/* Done this.loadingSpinner() */}
        </Form>;
    }

    renderInternal() {
        if (!this.state.provider) {
            return this.renderProviderSelection()
        }

        if (!this.state.storageVerified) {
            return this.renderProviderConfiguration();
        }

        if (this.state.confirmCreate) {
            return this.renderConfirmCreate();
        }

        return this.renderConfirmConnect();
    }

    render() {
        return <>
            {this.renderInternal()}
        </>;
    }
}

SetupRepository.contextType = AppContext;
