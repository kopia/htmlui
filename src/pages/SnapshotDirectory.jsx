import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useCallback, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { DirectoryItems } from "../components/DirectoryItems";
import { CLIEquivalent } from '../utils/uiutil';
import { DirectoryBreadcrumbs } from "../components/DirectoryBreadcrumbs";
import { reducer, initState } from '../forms';

const initalState = {
    items: [],
    isLoading: false,
    error: null,
    mountInfo: {},
    oid: "",
}

export function SnapshotDirectory(props) {
    const [state, dispatch] = useReducer(reducer, initalState, initState);
    /**
     * 
     */
    const fetchDirectory = useCallback(() => {
        let oid = props.match.params.oid;
        dispatch({
            type: 'set',
            data: {
                isLoading: true,
                oid: oid,
            }
        });
        axios.get('/api/v1/objects/' + oid).then(result => {
            dispatch({
                type: 'set',
                data: {
                    items: result.data.entries || [],
                    isLoading: false,
                }
            });
        }).catch(error => dispatch({
            type: 'set',
            data: {
                error: error,
                isLoading: false
            }
        }));
        axios.get('/api/v1/mounts/' + oid).then(result => {
            dispatch({
                type: 'set',
                data: {
                    mountInfo: result.data
                }
            })
        }).catch(_ => dispatch({
            type: 'set',
            data: {
                mountInfo: {}
            }
        }));
    }, [props.match.params.oid])

    /**
     * 
     */
    function mount() {
        axios.post('/api/v1/mounts', { "root": state.oid }).then(result => {
            dispatch({
                type: 'set',
                data: {
                    mountInfo: result.data
                }
            })
        }).catch(error => {
            dispatch({
                type: 'set',
                data: {
                    error: error,
                    mountInfo: {}
                }
            })
        })
    };

    useEffect(() => {
        fetchDirectory();
    }, [fetchDirectory, props.match.params.oid]);


    function unmount() {
        axios.delete('/api/v1/mounts/' + state.oid).then(_ => {
            dispatch({
                type: 'set',
                data: {
                    mountInfo: {}
                }
            });
        }).catch(error => dispatch({
            type: 'set',
            data: {
                error: error,
                mountInfo: {}
            }
        }));
    }

    function browseMounted() {
        if (!window.kopiaUI) {
            alert('Directory browsing is not supported in a web browser. Use Kopia UI.');
            return;
        }
        window.kopiaUI.browseDirectory(this.state.mountInfo.path);
    }

    function copyPath() {
        const el = document.querySelector(".mounted-path");
        if (!el) {
            return
        }
        el.select();
        el.setSelectionRange(0, 99999);
        document.execCommand("copy");
    }

    if (state.error) {
        return <p>ERROR: {state.error.message}</p>;
    }
    if (state.isLoading) {
        return <Spinner animation="border" variant="primary" />;
    }
    return (
        <>
            <DirectoryBreadcrumbs />
            <Row>
                <Col xs="auto">
                    {state.mountInfo.path ? <>
                        <Button size="sm" variant="secondary" onClick={unmount}>Unmount</Button>
                        {window.kopiaUI && <>
                            <Button size="sm" variant="secondary" onClick={browseMounted}>Browse</Button>
                        </>}
                        <input readOnly={true} className='form-control form-control-sm mounted-path' value={state.mountInfo.path} />
                        <Button size="sm" variant="success" onClick={copyPath}><FontAwesomeIcon icon={faCopy} /></Button>
                    </> : <>
                        <Button size="sm" variant="secondary" onClick={mount}>Mount as Local Filesystem</Button>
                    </>}
                    &nbsp;
                    <Button size="sm" variant="primary"
                        href={"/snapshots/dir/" + props.match.params.oid + "/restore"}>Restore
                        Files & Directories</Button>
                    &nbsp;
                </Col>
                <Col xs={12} md={6}>
                    You can mount/restore all the files & directories that you see below or restore files individually.
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col>
            </Row>
            <Row>
                <Col xs={12}><DirectoryItems items={state.items} historyState={props.location.state} /></Col>
            </Row>
            <CLIEquivalent command={`snapshot list ${state.oid}`} />
        </>
    )
}
