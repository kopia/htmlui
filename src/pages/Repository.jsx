import axios from 'axios';
import React, { Component } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
import { handleChange } from '../forms';
import { SetupRepository } from '../components/SetupRepository';
import { cancelTask, CLIEquivalent } from '../utils/uiutil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronCircleDown, faChevronCircleUp, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { Logs } from '../components/Logs';
import { AppContext } from '../contexts/AppContext';
import i18n from '../utils/i18n'

export class Repository extends Component {
    constructor() {
        super();

        this.state = {
            status: {},
            isLoading: true,
            error: null,
            provider: "",
            description: "",
        };

        this.mounted = false;
        this.disconnect = this.disconnect.bind(this);
        this.updateDescription = this.updateDescription.bind(this);
        this.handleChange = handleChange.bind(this);
        this.fetchStatus = this.fetchStatus.bind(this);
        this.fetchStatusWithoutSpinner = this.fetchStatusWithoutSpinner.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
        this.fetchStatus(this.props);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    fetchStatus() {
        if (this.mounted) {
            this.setState({
                isLoading: true,
            });
        }

        this.fetchStatusWithoutSpinner();
    }

    fetchStatusWithoutSpinner() {
        axios.get('/api/v1/repo/status').then(result => {
            if (this.mounted) {
                this.setState({
                    status: result.data,
                    isLoading: false,
                });

                // Update the app context to reflect the successfully-loaded description.
                this.context.repositoryDescriptionUpdated(result.data.description);

                if (result.data.initTaskID) {
                    window.setTimeout(() => {
                        this.fetchStatusWithoutSpinner();
                    }, 1000);
                }
            }
        }).catch(error => {
            if (this.mounted) {
                this.setState({
                    error,
                    isLoading: false
                })
            }
        });
    }

    disconnect() {
        this.setState({ isLoading: true })
        axios.post('/api/v1/repo/disconnect', {}).then(result => {
            this.context.repositoryUpdated(false);
        }).catch(error => this.setState({
            error,
            isLoading: false
        }));
    }

    selectProvider(provider) {
        this.setState({ provider });
    }

    updateDescription() {
        this.setState({
            isLoading: true
        });

        axios.post('/api/v1/repo/description', {
            "description": this.state.status.description,
        }).then(result => {
            // Update the app context to reflect the successfully-saved description.
            this.context.repositoryDescriptionUpdated(result.data.description);

            this.setState({
                isLoading: false,
            });
        }).catch(error => {
            this.setState({
                isLoading: false,
            });
        });
    }

    render() {
        let { isLoading, error } = this.state;
        if (error) {
            return <p>{error.message}</p>;
        }

        if (isLoading) {
            return <Spinner animation="border" variant="primary" />;
        }

        if (this.state.status.initTaskID) {
            return <><h4><Spinner animation="border" variant="primary" size="sm" />{' '}{i18n.t('feedback.repository.repository-initializing')}</h4>
                {this.state.showLog ? <>
                    <Button size="sm" variant="light" onClick={() => this.setState({ showLog: false })}><FontAwesomeIcon icon={faChevronCircleUp} />{i18n.t('event.log.hide-log')}</Button>
                    <Logs taskID={this.state.status.initTaskID} />
                </> : <Button size="sm" variant="light" onClick={() => this.setState({ showLog: true })}><FontAwesomeIcon icon={faChevronCircleDown} />{i18n.t('event.log.show-log')}</Button>}
                <hr />
                <Button size="sm" variant="danger" icon={faWindowClose} title={i18n.t('common.action.cancel')} onClick={() => cancelTask(this.state.status.initTaskID)}>{i18n.t('event.repository.cancel-connection')}</Button>
            </>;
        }

        if (this.state.status.connected) {
            return <>
                <p className="text-success mb-1">
                    <FontAwesomeIcon icon={faCheck} style={{ marginRight: 4 }} />
                    <span>{i18n.t('feedback.repository.status-connected')}</span>
                </p>
                <Form>
                    <Row>
                        <Form.Group as={Col}>
                            <InputGroup>
                                <Form.Control
                                    autoFocus={true}
                                    isInvalid={!this.state.status.description}
                                    name="status.description"
                                    value={this.state.status.description}
                                    onChange={this.handleChange}
                                    size="sm" />
                                &nbsp;
                                <Button data-testid='update-description' size="sm" onClick={this.updateDescription} type="button">{i18n.t('event.repository.update-description')}</Button>
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">{i18n.t('feedback.repository.repository-description-required')}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    {this.state.status.readonly && <Row>
                        <Badge pill variant="warning">{i18n.t('feedback.repository.repository-is-read-only')}</Badge>
                    </Row>}
                </Form>
                <hr />
                <Form>
                    {this.state.status.apiServerURL ? <>
                        <Row>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.server-url')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.apiServerURL} />
                            </Form.Group>
                        </Row>
                    </> : <>
                        <Row>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.config-file')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.configFile} />
                            </Form.Group>
                        </Row>
                        <br />
                        <Row>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.repository-provider')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.storage} />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.algorithm-encryption')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.encryption} />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.algorithm-hash')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.hash} />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.algorithm-splitter')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.splitter} />
                            </Form.Group>
                        </Row>
                        <br />
                        <Row>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.repository-format')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.formatVersion} />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.repository-eco')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.eccOverheadPercent > 0 ? this.state.status.eccOverheadPercent + "%" : i18n.t('feedback.repository.eco-disabled')} />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.algorithm-eco')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.ecc || "-"} />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>{i18n.t('feedback.repository.attribute.internal-compression')}:</Form.Label>
                                <Form.Control readOnly defaultValue={this.state.status.supportsContentCompression ? i18n.t('feedback.repository.internal-compression-supported-yes') : i18n.t('feedback.repository.internal-compression-supported-no')} />
                            </Form.Group>
                        </Row>
                    </>}
                    <br />
                    <Row>
                        <Form.Group as={Col}>
                            <Form.Label>{i18n.t('feedback.repository.attribute.connected-as')}:</Form.Label>
                            <Form.Control readOnly defaultValue={this.state.status.username + "@" + this.state.status.hostname} />
                        </Form.Group>
                    </Row>
                    <br />
                    <Row>
                        <Col>
                            <Button data-testid='disconnect' size="sm" variant="danger" onClick={this.disconnect}>{i18n.t('event.repository.disconnect-from-repository')}</Button>
                        </Col>
                    </Row>
                </Form>
                <br />
                <Row>
                    <Col xs={12}>
                        <CLIEquivalent command="repository status" />
                    </Col>
                </Row>
            </>;
        }
        return <SetupRepository />;
    }
}

Repository.contextType = AppContext;
