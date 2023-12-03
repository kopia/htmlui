import axios from 'axios';
import React, { useState, useReducer, useEffect, useRef, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { PolicyEditor } from '../components/policy-editor/PolicyEditor';
import { SnapshotEstimation } from '../components/SnapshotEstimation';
import { CLIEquivalent, DirectorySelector, errorAlert, GoBackButton, redirect } from '../utils/uiutil';
import { reducer, init } from '../forms'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const initalState = {
    localHost: "",
    localUsername: "",
    path: "",
    lastEstimatedPath: "",
    estimatingPath: "",
    didEstimate: false,
    estimateTaskID: null,
    estimateTaskVisible: false,
    policyEditorVisibleFor: "n/a"
};

export function SnapshotCreate() {
    const [state, dispatch] = useReducer(reducer, initalState, init);
    const [error, setError] = useState(null);
    let history = useHistory()

    const policyEditorRef = useRef();
    const mounted = useRef(false);

    const fetchUser = useCallback(() => {
        axios.get('/api/v1/sources').then(result => {
            let newState = {
                localUsername: result.data.localUsername,
                localHost: result.data.localHost
            };
            dispatch({
                type: 'set',
                data: newState
            });
        }).catch(error => {
            redirect(error);
            setError(error);
        });
    }, [])

    const resolvePath = useCallback((lastResolvedPath) => {
        const currentPath = state.path;
        if (lastResolvedPath !== currentPath) {
            if (state.path) {
                axios.post('/api/v1/paths/resolve', { path: currentPath }).then(result => {
                    let newState = {
                        lastResolvedPath: currentPath,
                        resolvedSource: result.data.source
                    };
                    dispatch({
                        type: 'set',
                        data: newState
                    });
                    resolvePath(currentPath);
                }).catch(error => {
                    redirect(error);
                });
            } else {
                let newState = {
                    lastResolvedPath: currentPath,
                    resolvedSource: null
                }
                dispatch({
                    type: 'set',
                    data: newState
                });
                resolvePath(currentPath);
            }
        }
    }, [state.path])

    function estimate(e) {
        e.preventDefault();
        if (!state.resolvedSource.path) {
            return;
        }
        const pe = policyEditorRef.current;
        if (!pe) {
            return;
        }
        try {
            let req = {
                root: state.resolvedSource.path,
                maxExamplesPerBucket: 10,
                policyOverride: pe.getAndValidatePolicy(),
            }

            axios.post('/api/v1/estimate', req).then(result => {
                let newState = {
                    lastEstimatedPath: state.resolvedSource.path,
                    estimatingPath: result.data.description,
                    didEstimate: false,
                    estimateTaskID: result.data.id,
                    estimateTaskVisible: true
                }
                dispatch({
                    type: 'set',
                    data: newState
                });

            }).catch(error => {
                errorAlert(error);
            });
        } catch (e) {
            errorAlert(e);
        }
    }

    function snapshotNow(e) {
        e.preventDefault();
        if (!state.resolvedSource.path) {
            alert('Must specify directory to snapshot.');
            return
        }
        if (!policyEditorRef.current) {
            return;
        }
        try {
            axios.post('/api/v1/sources', {
                path: state.resolvedSource.path,
                createSnapshot: true,
                policy: policyEditorRef.current.getAndValidatePolicy(),
            }).then(_ => {
                history.goBack()
            }).catch(error => {
                errorAlert(error);
                setError(error);
            });
        } catch (e) {
            errorAlert(e);
            setError(error);
        }
    }

    useEffect(() => {
        if (!mounted.current) {
            fetchUser()
            mounted.current = true;
        } else {
            resolvePath(state.lastResolvedPath)
        }
    }, [mounted, fetchUser, resolvePath, state.lastResolvedPath]);

    return (
        <>
            <Row>
                <Form.Group>
                    <GoBackButton onClick={history.goBack} />
                </Form.Group>
                &nbsp;&nbsp;&nbsp;<h4>New Snapshot</h4>
            </Row>
            <br />
            <Row>
                <Col>
                    <Form.Group>
                        <DirectorySelector
                            onDirectorySelected={e => dispatch({
                                type: 'update',
                                source: e.target.name,
                                data: e.target.value
                            })}

                            onChange={e => dispatch({
                                type: 'update',
                                source: e.target.name,
                                data: e.target.value
                            })}
                            autoFocus placeholder="enter path to snapshot" name="path" value={state.path} />
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button
                        data-testid='estimate-now'
                        size="sm"
                        disabled={!state.resolvedSource?.path}
                        title="Estimate"
                        variant="secondary"
                        onClick={estimate}>Estimate</Button>
                    &nbsp;
                    <Button
                        data-testid='snapshot-now'
                        size="sm"
                        disabled={!state.resolvedSource?.path}
                        title="Snapshot Now"
                        variant="primary"
                        onClick={snapshotNow}>Snapshot Now</Button>
                </Col>
            </Row>
            {state.estimateTaskID && state.estimateTaskVisible &&
                <SnapshotEstimation taskID={state.estimateTaskID} hideDescription={true} showZeroCounters={true} />
            }
            <br />
            {state.resolvedSource && <Row><Col xs={12}>
                <Form.Text>
                    {state.resolvedSource ? state.resolvedSource.path : state.path}
                </Form.Text>

                <PolicyEditor ref={policyEditorRef}
                    embedded
                    host={state.resolvedSource.host}
                    userName={state.resolvedSource.userName}
                    path={state.resolvedSource.path} />
            </Col></Row>}
            <Row><Col>&nbsp;</Col></Row>
            <CLIEquivalent command={`snapshot create ${state.resolvedSource ? state.resolvedSource.path : state.path}`} />
        </>
    )
}
