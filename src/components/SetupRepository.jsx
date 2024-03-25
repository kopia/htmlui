import { faAngleDoubleDown, faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Collapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { AppContext } from '../contexts/AppContext';
import { handleChange, validateRequiredFields } from '../forms';
import { RequiredBoolean } from '../forms/RequiredBoolean';
import { RequiredField } from '../forms/RequiredField';
import { SetupRepositoryAzure } from './SetupRepositoryAzure';
import { SetupRepositoryB2 } from "./SetupRepositoryB2";
import { SetupRepositoryFilesystem } from './SetupRepositoryFilesystem';
import { SetupRepositoryGCS } from './SetupRepositoryGCS';
import { SetupRepositoryServer } from './SetupRepositoryServer';
import { SetupRepositoryRclone } from './SetupRepositoryRclone';
import { SetupRepositoryS3 } from './SetupRepositoryS3';
import { SetupRepositorySFTP } from './SetupRepositorySFTP';
import { SetupRepositoryToken } from './SetupRepositoryToken';
import { SetupRepositoryWebDAV } from './SetupRepositoryWebDAV';
import { toAlgorithmOption } from '../utils/uiutil';
import i18n from '../utils/i18n';

/**
 * Descriptions will be translated when rendering the providers
 */
const supportedProviders = [
    { provider: "filesystem", description: 'feedback.provider.local-directory-or-nas', component: SetupRepositoryFilesystem },
    { provider: "gcs", description: 'feedback.provider.google-cloud-storage', component: SetupRepositoryGCS },
    { provider: "s3", description: 'feedback.provider.s3-or-compatible-storage', component: SetupRepositoryS3 },
    { provider: "b2", description: 'feedback.provider.backblaze-b2', component: SetupRepositoryB2 },
    { provider: "azureBlob", description: 'feedback.provider.azure-blob-storage', component: SetupRepositoryAzure },
    { provider: "sftp", description: 'feedback.provider.sftp-server', component: SetupRepositorySFTP },
    { provider: "rclone", description: 'feedback.provider.rclone-remote', component: SetupRepositoryRclone },
    { provider: "webdav", description: 'feedback.provider.webdav-server', component: SetupRepositoryWebDAV },
    { provider: "_server", description: 'feedback.provider.kopia-repository-server', component: SetupRepositoryServer },
    { provider: "_token", description: 'feedback.provider.use-repository-token', component: SetupRepositoryToken },
];

export class SetupRepository extends Component {
    constructor() {
        super();

        this.state = {
            confirmCreate: false,
            isLoading: false,
            showAdvanced: false,
            storageVerified: false,
            providerSettings: {},
            description: i18n.t('feedback.repository.name-default'),
            formatVersion: "2",
        };

        this.handleChange = handleChange.bind(this);
        this.optionsEditor = React.createRef();
        this.connectToRepository = this.connectToRepository.bind(this);
        this.createRepository = this.createRepository.bind(this);
        this.cancelCreate = this.cancelCreate.bind(this);
        this.toggleAdvanced = this.toggleAdvanced.bind(this);
        this.verifyStorage = this.verifyStorage.bind(this);
    }

    componentDidMount() {
        axios.get('/api/v1/repo/algorithms').then(result => {
            this.setState({
                algorithms: result.data,
                defaultHash: result.data.defaultHash,
                defaultEncryption: result.data.defaultEncryption,
                defaultEcc: result.data.defaultEcc,
                defaultSplitter: result.data.defaultSplitter,
                hash: result.data.defaultHash,
                encryption: result.data.defaultEncryption,
                ecc: result.data.defaultEcc,
                eccOverheadPercent: "0",
                splitter: result.data.defaultSplitter,
                indexVersion: "",
            });
        });

        axios.get('/api/v1/current-user').then(result => {
            this.setState({
                username: result.data.username,
                hostname: result.data.hostname,
            });
        });
    }

    validate() {
        const ed = this.optionsEditor.current;

        let valid = true;

        if (this.state.provider !== "_token") {
            if (!validateRequiredFields(this, ["password"])) {
                valid = false;
            }
        }

        if (ed && !ed.validate()) {
            valid = false;
        }

        if (this.state.confirmCreate) {
            if (!validateRequiredFields(this, ["confirmPassword"])) {
                valid = false;
            }

            if (valid && this.state.password !== this.state.confirmPassword) {
                alert(i18n.t('feedback.validation.passwords-dont-match'));
                return false;
            }
        }

        return valid;
    }

    createRepository(e) {
        e.preventDefault();

        if (!this.validate()) {
            return;
        }

        let request = {
            storage: {
                type: this.state.provider,
                config: this.state.providerSettings,
            },
            password: this.state.password,
            options: {
                blockFormat: {
                    version: parseInt(this.state.formatVersion),
                    hash: this.state.hash,
                    encryption: this.state.encryption,
                    ecc: this.state.ecc,
                    eccOverheadPercent: parseInt(this.state.eccOverheadPercent),
                },
                objectFormat: {
                    splitter: this.state.splitter,
                },
            },
        };

        request.clientOptions = this.clientOptions();

        axios.post('/api/v1/repo/create', request).then(result => {
            this.context.repositoryUpdated(true);
        }).catch(error => {
            if (error.response.data) {
                this.setState({
                    connectError: error.response.data.code + ": " + error.response.data.error,
                });
            }
        });
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

    toggleAdvanced() {
        this.setState({ showAdvanced: !this.state.showAdvanced });
    }

    cancelCreate() {
        this.setState({ confirmCreate: false });
    }

    renderProviderSelection() {
        return <>
            <h3>{i18n.t('feedback.repository.provider-selection')}</h3>
            <p>{i18n.t('feedback.repository.provider-selection-hint')}</p>
            <Row>
                {supportedProviders.map(x =>
                    <Button key={x.provider}
                        data-testid={'provider-' + x.provider}
                        onClick={() => this.setState({ provider: x.provider, providerSettings: {} })}
                        variant={x.provider.startsWith("_") ? "secondary" : "primary"}
                        className="providerIcon" >{i18n.t(x.description)}</Button>
                )}
            </Row>
        </>;
    }

    verifyStorage(e) {
        e.preventDefault();

        const ed = this.optionsEditor.current;
        if (ed && !ed.validate()) {
            return;
        }

        if (this.state.provider === "_token" || this.state.provider === "_server") {
            this.setState({
                // for token and server assume it's verified and exists, if not, will fail in the next step.
                storageVerified: true,
                confirmCreate: false,
                isLoading: false,
                providerSettings: ed.state,
            });
            return;
        }

        const request = {
            storage: {
                type: this.state.provider,
                config: ed.state,
            },
        };

        this.setState({ isLoading: true });
        axios.post('/api/v1/repo/exists', request).then(result => {
            this.setState({
                // verified and exists
                storageVerified: true,
                confirmCreate: false,
                isLoading: false,
                providerSettings: ed.state,
            });
        }).catch(error => {
            this.setState({ isLoading: false });
            if (error.response.data) {
                if (error.response.data.code === "NOT_INITIALIZED") {
                    this.setState({
                        // verified and does not exist
                        confirmCreate: true,
                        storageVerified: true,
                        providerSettings: ed.state,
                        connectError: null,
                    });
                } else {
                    this.setState({
                        connectError: error.response.data.code + ": " + error.response.data.error,
                    });
                }
            } else {
                this.setState({
                    connectError: error.message,
                });
            }
        });
    }

    renderProviderConfiguration() {
        let SelectedProvider = null;
        for (const prov of supportedProviders) {
            if (prov.provider === this.state.provider) {
                SelectedProvider = prov.component;
            }
        }

        return <Form onSubmit={this.verifyStorage}>
            {!this.state.provider.startsWith("_") && <h3>{i18n.t('feedback.repository.configuration')}</h3>}
            {this.state.provider === "_token" && <h3>{i18n.t('feedback.repository.repository-token-enter')}</h3>}
            {this.state.provider === "_server" && <h3>{i18n.t('feedback.repository.kopia-server-parameters')}</h3>}

            <SelectedProvider ref={this.optionsEditor} initial={this.state.providerSettings} />

            {this.connectionErrorInfo()}
            <hr />

            <Button data-testid='back-button' variant="warning" onClick={() => this.setState({ provider: null, providerSettings: null, connectError: null })}>{i18n.t('common.back')}</Button>
            &nbsp;
            <Button variant="primary" type="submit" data-testid="submit-button">{i18n.t('common.next')}</Button>
            {this.loadingSpinner()}
        </Form>;
    }

    toggleAdvancedButton() {
        // Determine button icon and text based upon component state.
        const icon = this.state.showAdvanced ? faAngleDoubleUp : faAngleDoubleDown;
        const text = this.state.showAdvanced ? i18n.t('event.repository.advanced-options-hide') : i18n.t('event.repository.advanced-options.show');

        return <Button data-testid='advanced-options' onClick={this.toggleAdvanced}
            variant="primary"
            aria-controls="advanced-options-div"
            aria-expanded={this.state.showAdvanced}
            size="sm">
            <FontAwesomeIcon icon={icon} style={{ marginRight: 4 }} />
            {text}
        </Button>;
    }

    renderConfirmCreate() {
        return <Form onSubmit={this.createRepository}>
            <h3>{i18n.t('feedback.repository.create-repository-new')}</h3>
            <p>{i18n.t('feedback.repository.create-repository-new-help')}</p>
            <Row>
                {RequiredField(this, i18n.t('feedback.validation.required.password-repository'), "password", { autoFocus: true, type: "password", placeholder: i18n.t('feedback.validation.required.password-repository-hint') }, i18n.t('feedback.validation.required.password-repository-help'))}
                {RequiredField(this, i18n.t('feedback.validation.required.repository-password-confirm'), "confirmPassword", { type: "password", placeholder: i18n.t('feedback.validation.required.repository-password-confirm-again') })}
            </Row>
            <div style={{ marginTop: "1rem" }}>
                {this.toggleAdvancedButton()}
            </div>
            <Collapse in={this.state.showAdvanced}>
                <div id="advanced-options-div" style={{ marginTop: "1rem" }}>
                    <Row>
                        <Form.Group as={Col}>
                            <Form.Label className="required">{i18n.t('feedback.repository.encryption')}</Form.Label>
                            <Form.Control as="select"
                                name="encryption"
                                onChange={this.handleChange}
                                data-testid="control-encryption"
                                value={this.state.encryption}>
                                {this.state.algorithms.encryption.map(x => toAlgorithmOption(x, this.state.defaultEncryption))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label className="required">{i18n.t('repository.attribute.algorithm.hash')}</Form.Label>
                            <Form.Control as="select"
                                name="hash"
                                onChange={this.handleChange}
                                data-testid="control-hash"
                                value={this.state.hash}>
                                {this.state.algorithms.hash.map(x => toAlgorithmOption(x, this.state.defaultHash))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label className="required">{i18n.t('repository.attribute.algorithm.splitter')}</Form.Label>
                            <Form.Control as="select"
                                name="splitter"
                                onChange={this.handleChange}
                                data-testid="control-splitter"
                                value={this.state.splitter}>
                                {this.state.algorithms.splitter.map(x => toAlgorithmOption(x, this.state.defaultSplitter))}
                            </Form.Control>
                        </Form.Group>
                    </Row>
                    <br/>
                    <Row>
                        <Form.Group as={Col}>
                            <Form.Label className="required">{i18n.t('repository.attribute.format')}</Form.Label>
                            <Form.Control as="select"
                                name="formatVersion"
                                onChange={this.handleChange}
                                data-testid="control-formatVersion"
                                value={this.state.formatVersion}>
                                <option value="2">{i18n.t('value.repository.format.latest')}</option>
                                <option value="1">{i18n.t('value.repository.format.legacy')}</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label className="required">{i18n.t('repository.attribute.eco')}</Form.Label>
                            <Form.Control as="select"
                                name="eccOverheadPercent"
                                onChange={this.handleChange}
                                data-testid="control-eccOverheadPercent"
                                value={this.state.eccOverheadPercent}>
                                <option value="0">{i18n.t('value.algorithm.eco-disabled')}</option>
                                <option value="1">1%</option>
                                <option value="2">2%</option>
                                <option value="5">5%</option>
                                <option value="10">10%</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label className="required">{i18n.t('repository.attribute.algorithm.eco')}</Form.Label>
                            <Form.Control as="select"
                                name="ecc"
                                onChange={this.handleChange}
                                data-testid="control-ecc"
                                disabled={this.state.eccOverheadPercent === "0"}
                                value={this.state.eccOverheadPercent === "0" ? "-" : this.state.ecc}>
                                {this.state.eccOverheadPercent === "0" ?
                                    [<option value="">-</option>]
                                    : this.state.algorithms.ecc.map(x => toAlgorithmOption(x, this.state.defaultEcc))}
                            </Form.Control>
                        </Form.Group>
                    </Row>
                    <Row>
                        <Col></Col>
                        <Col sm={8} className="text-muted">
                            {i18n.t('feedback.repository.eec-warning')} <a href="https://kopia.io/docs/advanced/ecc/" target="_blank" rel="noreferrer">{i18n.t('common.click-here-to-learn-more')}.</a>
                        </Col>
                    </Row>
                    <br/>
                    {this.overrideUsernameHostnameRow()}
                    <Row style={{ marginTop: "1rem" }}>
                        <Form.Group as={Col}>
                            <Form.Text>{i18n.t('feedback.repository.additional-parameters-hint')}</Form.Text>
                        </Form.Group>
                    </Row>
                </div>
            </Collapse>
            <br/>
            {this.connectionErrorInfo()}
            <hr />
            <Button data-testid='back-button' variant="warning" onClick={() => this.setState({ providerSettings: {}, storageVerified: false })}>{i18n.t('common.back')}</Button>
            {' '}
            <Button variant="primary" type="submit" data-testid="submit-button">{i18n.t('event.repository.create-repository')}</Button>
            {this.loadingSpinner()}
        </Form>;
    }

    overrideUsernameHostnameRow() {
        return <Row>
            {RequiredField(this, i18n.t('feedback.validation.required.username'), "username", {}, i18n.t('feedback.validation.required.username-hint'))}
            {RequiredField(this, i18n.t('feedback.validation.required.hostname'), "hostname", {}, i18n.t('feedback.validation.required.hostname-hint'))}
        </Row>;
    }

    connectionErrorInfo() {
        return this.state.connectError && <Row>
            <Form.Group as={Col}>
                <Form.Text className="error">{i18n.t('feedback.error.connection')} {this.state.connectError}</Form.Text>
            </Form.Group>
        </Row>;
    }

    renderConfirmConnect() {
        return <Form onSubmit={this.connectToRepository}>
            <h3>{i18n.t('feedback.repository.connect-to-repository')}</h3>
            <Row>
                <Form.Group as={Col}>
                    <Form.Label className="required">{i18n.t('feedback.repository.connect-as')}</Form.Label>
                    <Form.Control
                        value={this.state.username + '@' + this.state.hostname}
                        readOnly={true}
                        size="sm" />
                    <Form.Text className="text-muted">{i18n.t('feedback.repository.override-hint')}</Form.Text>
                </Form.Group>
            </Row>
            <br/>
            <Row>
                {(this.state.provider !== "_token" && this.state.provider !== "_server") && RequiredField(this, i18n.t('feedback.validation.required.password-repository'), "password", { autoFocus: true, type: "password", placeholder: i18n.t('feedback.validation.required.password-repository-hint') }, i18n.t('feedback.validation.required.password-repository-help'))}
                {this.state.provider === "_server" && RequiredField(this, i18n.t('feedback.validation.required.server-password'), "password", { autoFocus: true, type: "password", placeholder: i18n.t('feedback.validation.required.server-password-hint') })}
            </Row>
            <br/>
            <Row>
                {RequiredField(this, i18n.t('feedback.repository.repository-description'), "description", { autoFocus: this.state.provider === "_token", placeholder: i18n.t('feedback.repository.repository-description-hint') }, i18n.t('feedback.repository.repository-description-help') )}
            </Row>
            <br/>
            {this.toggleAdvancedButton()}
            <Collapse in={this.state.showAdvanced}>
                <div id="advanced-options-div" className="advancedOptions">
                    <Row>
                        {RequiredBoolean(this, i18n.t('feedback.repository.connect-in-read-only-mode'), "readonly", i18n.t('feedback.repository.connect-in-read-only-mode-hint'))}
                    </Row>
                    {this.overrideUsernameHostnameRow()}
                </div>
            </Collapse>
            {this.connectionErrorInfo()}
            <hr />
            <Button data-testid='back-button' variant="warning" onClick={() => this.setState({ providerSettings: {}, storageVerified: false })}>{i18n.t('common.back')}</Button>
            {' '}
            <Button variant="primary" type="submit" data-testid="submit-button">{i18n.t('event.repository.connect-to-repository')}</Button>
            {this.loadingSpinner()}
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

    loadingSpinner() {
        return this.state.isLoading && <Spinner animation="border" variant="primary" />;
    }

    render() {
        return <>
            {this.renderInternal()}
        </>;
    }
}

SetupRepository.contextType = AppContext;
