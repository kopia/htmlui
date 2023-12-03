import axios from 'axios';
import React, { useCallback, useLayoutEffect, useState, useContext, useReducer, useRef } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
import { SetupRepository } from '../components/SetupRepository';
import { cancelTask, CLIEquivalent, repositoryUpdated } from '../utils/uiutil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronCircleDown, faChevronCircleUp, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { Logs } from '../components/Logs';
import { AppContext } from '../contexts/AppContext';
import { reducer } from '../forms'

export function Repository() {
    const context = useContext(AppContext)
    const [state, dispatch] = useReducer(reducer, {})
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLog, setShowLog] = useState(false);

    let mounted = useRef(false);

    const fetchStatusWithoutSpinner = useCallback(() => {
        axios.get('/api/v1/repo/status').then(result => {
            if (mounted) {
                setIsLoading(false);
                dispatch({
                    type: 'init',
                    data: result.data
                });
                // Update the app context to reflect the successfully-loaded description.
                context.repoDescription = result.data.description;
                if (result.data.initTaskID) {
                    window.setTimeout(() => {
                        fetchStatusWithoutSpinner();
                    }, 1000);
                }
            }
        }).catch(error => {
            if (mounted) {
                setError(error);
                setIsLoading(false);
            }
        });
    }, [context, mounted])

    useLayoutEffect(() => {
        mounted.current = true;
        setIsLoading(true)
        fetchStatusWithoutSpinner();
        return () => {
            mounted.current = false;
        };
    }, [mounted, fetchStatusWithoutSpinner]);

    function disconnect() {
        setIsLoading(true)
        axios.post('/api/v1/repo/disconnect', {}).then(result => {
            repositoryUpdated(false);
        }).catch(error => {
            setError(error);
            setIsLoading(false);
        });
    }

    function updateDescription() {
        setIsLoading(true);
        axios.post('/api/v1/repo/description', {
            "description": state.description,
        }).then(result => {
            context.repoDescription = result.data.description;
            setIsLoading(false)
        }).catch(error => {
            setIsLoading(false)
        });
    }

    if (error) {
        return <p>{error.message}</p>;
    }
    if (isLoading) {
        return <Spinner animation="border" variant="primary" />;
    }
    if (state.initTaskID) {
        return <><h4><Spinner animation="border" variant="primary" size="sm" />&nbsp;Initializing Repository...</h4>
            {showLog ? <>
                <Button size="sm" variant="light" onClick={() => setShowLog(false)}><FontAwesomeIcon icon={faChevronCircleUp} /> Hide Log</Button>
                <Logs taskID={state.initTaskID} />
            </> : <Button size="sm" variant="light" onClick={() => setShowLog(true)}><FontAwesomeIcon icon={faChevronCircleDown} /> Show Log</Button>}
            <hr />
            <Button size="sm" variant="danger" icon={faWindowClose} title="Cancel" onClick={() => cancelTask(state.initTaskID)}>Cancel Connection</Button>
        </>;
    }

    if (state.connected) {
        return <>
            <p className="text-success mb-1">
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: 4 }} />
                <span>Connected To Repository</span>
            </p>
            <Form>
                <Row>
                    <Form.Group as={Col}>
                        <InputGroup>
                            <Form.Control
                                autoFocus={true}
                                isInvalid={!state.description}
                                name="description"
                                value={state.description}
                                onChange={e => dispatch({
                                    type: 'update',
                                    source: e.target.name,
                                    data: e.target.value
                                })}
                                size="sm" />
                            &nbsp;
                            <Button data-testid='update-description' size="sm" onClick={updateDescription} type="button">Update Description</Button>
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">Description Is Required</Form.Control.Feedback>
                    </Form.Group>
                </Row>
                {state.readonly && <Row>
                    <Badge pill variant="warning">Repository is read-only</Badge>
                </Row>}
            </Form>
            <hr />
            <Form>
                {state.apiServerURL ? <>
                    <Row>
                        <Form.Group as={Col}>
                            <Form.Label>Server URL</Form.Label>
                            <Form.Control readOnly defaultValue={state.apiServerURL} />
                        </Form.Group>
                    </Row>
                </> : <>
                    <Row>
                        <Form.Group as={Col}>
                            <Form.Label>Config File</Form.Label>
                            <Form.Control readOnly defaultValue={state.configFile} />
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group as={Col}>
                            <Form.Label>Provider</Form.Label>
                            <Form.Control readOnly defaultValue={state.storage} />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Encryption Algorithm</Form.Label>
                            <Form.Control readOnly defaultValue={state.encryption} />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Hash Algorithm</Form.Label>
                            <Form.Control readOnly defaultValue={state.hash} />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Splitter Algorithm</Form.Label>
                            <Form.Control readOnly defaultValue={state.splitter} />
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group as={Col}>
                            <Form.Label>Repository Format</Form.Label>
                            <Form.Control readOnly defaultValue={state.formatVersion} />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Error Correction Overhead</Form.Label>
                            <Form.Control readOnly defaultValue={state.eccOverheadPercent > 0 ? state.eccOverheadPercent + "%" : "Disabled"} />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Error Correction Algorithm</Form.Label>
                            <Form.Control readOnly defaultValue={state.ecc || "-"} />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Internal Compression</Form.Label>
                            <Form.Control readOnly defaultValue={state.supportsContentCompression ? "yes" : "no"} />
                        </Form.Group>
                    </Row>
                </>}
                <Row>
                    <Form.Group as={Col}>
                        <Form.Label>Connected as:</Form.Label>
                        <Form.Control readOnly defaultValue={state.username + "@" + state.hostname} />
                    </Form.Group>
                </Row>
                <Row><Col>&nbsp;</Col></Row>
                <Row>
                    <Col>
                        <Button data-testid='disconnect' size="sm" variant="danger" onClick={disconnect}>Disconnect</Button>
                    </Col>
                </Row>
            </Form>
            <Row><Col>&nbsp;</Col></Row>
            <Row>
                <Col xs={12}>
                    <CLIEquivalent command="repository status" />
                </Col>
            </Row>
        </>;
    }
    return <SetupRepository />;
}