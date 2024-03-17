import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { DirectoryItems } from "../components/DirectoryItems";
import { CLIEquivalent } from '../utils/uiutil';
import { DirectoryBreadcrumbs } from "../components/DirectoryBreadcrumbs";
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';
import i18n from '../utils/i18n';

export class SnapshotDirectory extends Component {
    constructor() {
        super();

        this.state = {
            items: [],
            isLoading: false,
            error: null,
            mountInfo: {},
            oid: "",
        };

        this.mount = this.mount.bind(this);
        this.unmount = this.unmount.bind(this);
        this.browseMounted = this.browseMounted.bind(this);
        this.copyPath = this.copyPath.bind(this);
        this.fetchDirectory = this.fetchDirectory.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.oid !== prevProps.match.params.oid) {
            console.log('OID changed', prevProps.match.params.oid, '=>', this.props.match.params.oid);
            this.fetchDirectory();
        }
    }

    fetchDirectory() {
        let oid = this.props.match.params.oid;

        this.setState({
            isLoading: true,
            oid: oid,
        });

        axios.get('/api/v1/objects/' + oid).then(result => {
            this.setState({
                items: result.data.entries || [],
                isLoading: false,
            });
        }).catch(error => this.setState({
            error,
            isLoading: false
        }));

        axios.get('/api/v1/mounts/' + oid).then(result => {
            this.setState({
                mountInfo: result.data,
            });
        }).catch(error => this.setState({
            mountInfo: {},
        }));
    }

    componentDidMount() {
        this.fetchDirectory();
    }

    mount() {
        axios.post('/api/v1/mounts', { "root": this.state.oid }).then(result => {
            this.setState({
                mountInfo: result.data,
            });
        }).catch(error => this.setState({
            mountInfo: {},
        }));
    }

    unmount() {
        axios.delete('/api/v1/mounts/' + this.state.oid).then(result => {
            this.setState({
                mountInfo: {},
            });
        }).catch(error => this.setState({
            error: error,
            mountInfo: {},
        }));
    }

    browseMounted() {
        if (!window.kopiaUI) {
            alert(i18n.t('snapshot.event.directory.browsing'));
            return;
        }

        window.kopiaUI.browseDirectory(this.state.mountInfo.path);
    }

    copyPath() {
        const el = document.querySelector(".mounted-path");
        if (!el) {
            return
        }

        el.select();
        el.setSelectionRange(0, 99999);

        document.execCommand("copy");
    }

    navigateTo(path) {
        this.props.history.push(path);
    }

    render() {
        let { items, isLoading, error } = this.state;
        if (error) {
            return <p>ERROR: {error.message}</p>;
        }
        if (isLoading) {
            return <Spinner animation="border" variant="primary" />;
        }

        return <>
            <DirectoryBreadcrumbs />
            <Row>
                <Col xs="auto">
                    {this.state.mountInfo.path ? <>
                        <Button size="sm" variant="secondary" onClick={this.unmount}>{i18n.t('snapshot.event.directory.unmount')}</Button>
                        {window.kopiaUI && <>
                            <Button size="sm" variant="secondary" onClick={this.browseMounted}>{i18n.t('snapshot.event.directory.browse')}</Button>
                        </>}
                        <input readOnly={true} className='form-control form-control-sm mounted-path' value={this.state.mountInfo.path} />
                        <Button size="sm" variant="success" onClick={this.copyPath}><FontAwesomeIcon icon={faCopy} /></Button>
                    </> : <>
                        <Button size="sm" variant="secondary" onClick={this.mount}>{i18n.t('snapshot.event.directory.mount')}{' '}</Button>
                    </>}
                    <Button size="sm" variant="primary" onClick={() => this.navigateTo("/snapshots/dir/" + this.props.match.params.oid + "/restore")}>
                        {i18n.t('snapshot.event.directory.restore')}{' '}</Button>
                </Col>
                <Col xs={12} md={6}>
                    {i18n.t('snapshot.feedback.directory.mount.restore')} </Col>
            </Row>
            <br />
            <Row>
                <Col xs={12}><DirectoryItems items={items} historyState={this.props.location.state} /></Col>
            </Row>
            <CLIEquivalent command={`snapshot list ${this.state.oid}`} />
        </>
    }
}
SnapshotDirectory.contextType = UIPreferencesContext