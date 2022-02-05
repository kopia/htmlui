import axios from 'axios';
import React, { Component } from 'react';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { Link } from "react-router-dom";
import MyTable from './Table';
import { CLIEquivalent, compare, errorAlert, GoBackButton, objectLink, parseQuery, redirectIfNotConnected, rfc3339TimestampForDisplay, sizeWithFailures, sourceQueryStringParams } from './uiutil';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'react-bootstrap/Modal';

function pillVariant(tag) {
    if (tag.startsWith("latest-")) {
        return "success";
    }
    if (tag.startsWith("daily-")) {
        return "info";
    }
    if (tag.startsWith("weekly-")) {
        return "danger";
    }
    if (tag.startsWith("monthly-")) {
        return "secondary";
    }
    if (tag.startsWith("annual-")) {
        return "warning";
    }
    return "primary";
}

export class SnapshotsTable extends Component {
    constructor() {
        super();
        this.state = {
            snapshots: [],
            showHidden: false,
            isLoading: true,
            isRefreshing: false,
            error: null,
            selectedSnapshotManifestIDs: {},
        };

        this.fetchSnapshots = this.fetchSnapshots.bind(this);
        this.toggleShowHidden = this.toggleShowHidden.bind(this);
        this.isSelected = this.isSelected.bind(this);
        this.toggleSelected = this.toggleSelected.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.deselectAll = this.deselectAll.bind(this);
        this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
        this.deleteSelectedSnapshots = this.deleteSelectedSnapshots.bind(this);
        this.cancelDelete = this.cancelDelete.bind(this);
        this.deleteSnapshotSource = this.deleteSnapshotSource.bind(this);
    }

    selectAll() {
        let snapIds = {};
        for (const sn of this.state.snapshots) {
            snapIds[sn.id] = true;
        }

        this.setState({
            selectedSnapshotManifestIDs: snapIds,
        })
    }

    deselectAll() {
        this.setState({
            selectedSnapshotManifestIDs: {},
        })
    }

    isSelected(snap) {
        return !!this.state.selectedSnapshotManifestIDs[snap.id];
    }

    toggleSelected(snap) {
        let sel = { ...this.state.selectedSnapshotManifestIDs };

        if (sel[snap.id]) {
            delete (sel[snap.id]);
        } else {
            sel[snap.id] = true;
        }

        this.setState({
            selectedSnapshotManifestIDs: sel,
        });
    }

    componentDidUpdate(oldProps, oldState) {
        if (this.state.showHidden !== oldState.showHidden) {
            this.fetchSnapshots();
        }
    }

    componentDidMount() {
        this.fetchSnapshots();
    }

    showDeleteConfirm() {
        this.setState({
            alsoDeleteSource: false,
            showDeleteConfirmationDialog: true,
        });
    }

    deleteSelectedSnapshots() {
        let req = {
            source: {
                host: this.state.host,
                userName: this.state.userName,
                path: this.state.path,
            },
            snapshotManifestIds: [],
            deleteSourceAndPolicy: this.state.alsoDeleteSource,
        };

        for (let id in this.state.selectedSnapshotManifestIDs) {
            req.snapshotManifestIds.push(id);
        }

        axios.post('/api/v1/snapshots/delete', req).then(result => {
            if (req.deleteSourceAndPolicy) {
                this.props.history.goBack();
            } else {
                this.fetchSnapshots();
            }
        }).catch(error => {
            redirectIfNotConnected(error);
            errorAlert(error);
        });

        this.setState({
            showDeleteConfirmationDialog: false
        });
    }

    deleteSnapshotSource() {
        let req = {
            source: {
                host: this.state.host,
                userName: this.state.userName,
                path: this.state.path,
            },
            deleteSourceAndPolicy: true,
        };

        axios.post('/api/v1/snapshots/delete', req).then(result => {
            this.props.history.goBack();
        }).catch(error => {
            redirectIfNotConnected(error);
            errorAlert(error);
        });
    }

    cancelDelete() {
        this.setState({
            showDeleteConfirmationDialog: false
        });
    }

    fetchSnapshots() {
        let q = parseQuery(this.props.location.search);

        this.setState({
            isRefreshing: true,
            host: q.host,
            userName: q.userName,
            path: q.path,
            hiddenCount: 0,
            selectedSnapshot: null,
        });

        let u = '/api/v1/snapshots?' + sourceQueryStringParams(q);

        if (this.state.showHidden) {
            u += "&all=1";
        }

        axios.get(u).then(result => {
            console.log('got snapshots', result.data);
            this.setState({
                snapshots: result.data.snapshots,
                selectedSnapshotManifestIDs: {},
                unfilteredCount: result.data.unfilteredCount,
                uniqueCount: result.data.uniqueCount,
                isLoading: false,
                isRefreshing: false,
            });
        }).catch(error => this.setState({
            error,
            isLoading: false,
            isRefreshing: false,
        }));
    }

    selectSnapshot(x) {
        this.setState({
            selectedSnapshot: x,
        })
    }

    toggleShowHidden(x) {
        this.setState({
            showHidden: x.target.checked,
        });
    }

    render() {
        let { snapshots, unfilteredCount, uniqueCount, isLoading, error } = this.state;
        if (error) {
            return <p>{error.message}</p>;
        }

        if (isLoading && !snapshots) {
            return <Spinner animation="border" variant="primary" />;
        }

        snapshots.sort((a, b) => -compare(a.startTime, b.startTime));

        const columns = [{
            id: 'selected',
            Header: '',
            width: 20,
            align: "center",
            Cell: x => <div className="form-check multiselect"><input type="checkbox" className="form-check-input" checked={this.isSelected(x.row.original)} onChange={() => this.toggleSelected(x.row.original)} /></div>,
        }, {
            id: 'startTime',
            Header: 'Start time',
            width: 200,
            accessor: x => <Link to={objectLink(x.rootID)}>{rfc3339TimestampForDisplay(x.startTime)}</Link>,
        }, {
            id: 'rootID',
            Header: 'Root',
            width: "",
            accessor: x => x.rootID,
        }, {
            Header: 'Retention',
            accessor: 'retention',
            width: "",
            Cell: x => <span>{x.cell.value.map(l =>
                <><Badge bg={pillVariant(l)}>{l}</Badge>{' '}</>
            )}</span>
        }, {
            Header: 'Size',
            accessor: 'summary.size',
            width: 100,
            Cell: x => sizeWithFailures(x.cell.value, x.row.original.summary),
        }, {
            Header: 'Files',
            accessor: 'summary.files',
            width: 100,
        }, {
            Header: 'Dirs',
            accessor: 'summary.dirs',
            width: 100,
        }]

        const selectedElements = Object.keys(this.state.selectedSnapshotManifestIDs);

        return <>
            <Row>
                <Col>
                    <GoBackButton onClick={this.props.history.goBack} />
                    &nbsp;
                    {snapshots.length > 0 && (selectedElements.length < snapshots.length ?
                        <Button size="sm" variant="primary" onClick={this.selectAll}>Select All</Button> :
                        <Button size="sm" variant="primary" onClick={this.deselectAll}>Deselect All</Button>)}
                    &nbsp;
                    {selectedElements.length > 0 && <>&nbsp;
                        <Button size="sm" variant="danger" onClick={this.showDeleteConfirm}>Delete Selected ({selectedElements.length})</Button>
                    </>}
                    {snapshots.length === 0 && <>&nbsp;
                        <Button size="sm" variant="danger" onClick={this.deleteSnapshotSource}>Delete Snapshot Source</Button>
                    </>}
                </Col>
                <Col>
                </Col>
                <Col xs="auto">
                    <Button size="sm" variant="primary">
                        {this.state.isRefreshing ? <Spinner animation="border" variant="light" size="sm" /> : <FontAwesomeIcon icon={faSync} onClick={this.fetchSnapshots} />}
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className="vpadded">
                        Displaying {snapshots.length !== unfilteredCount ? snapshots.length + ' out of ' + unfilteredCount : snapshots.length} snapshots of&nbsp;<b>{this.state.userName}@{this.state.host}:{this.state.path}</b>
                    </div>
                </Col>
            </Row>
            {unfilteredCount !== uniqueCount && <Row>
                <Col>
                    <div className="vpadded">
                        <Form.Group controlId="formBasicCheckbox">
                            <Form.Check
                                type="checkbox"
                                checked={this.state.showHidden}
                                label={'Show ' + unfilteredCount + ' individual snapshots'}
                                onChange={this.toggleShowHidden} />
                        </Form.Group>
                    </div>
                </Col>
            </Row>}
            <Row>
                <Col xs={12}>
                    <MyTable data={snapshots} columns={columns} />
                </Col>
            </Row>

            <CLIEquivalent command={`snapshot list "${this.state.userName}@${this.state.host}:${this.state.path}"${this.state.showHidden ? " --show-identical" : ""}`} />

            <Modal show={this.state.showDeleteConfirmationDialog} backdrop="static" keyboard={false} onHide={this.cancelDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <>
                        {selectedElements.length > 1 ?
                            <p>Do you want to delete the selected <b>{selectedElements.length} snapshots</b>?</p> :
                            <p>Do you want to delete the selected snapshot?</p>}
                        {selectedElements.length === snapshots.length && <Row><Form.Group>
                            <Form.Check
                                label="Wipe all snapshots and the policy for this source."
                                className="required"
                                checked={this.state.alsoDeleteSource}
                                onChange={() => this.setState({ alsoDeleteSource: !this.state.alsoDeleteSource })}
                                type="checkbox" />
                        </Form.Group></Row>}
                    </>
                </Modal.Body>

                <Modal.Footer>
                    <Button size="sm" variant="danger" onClick={this.deleteSelectedSnapshots}>Delete</Button>
                    <Button size="sm" variant="secondary" onClick={this.cancelDelete}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        </>;
    }
}
