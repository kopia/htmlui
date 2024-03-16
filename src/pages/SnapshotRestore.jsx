import axios from 'axios';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from "react-router-dom";
import { handleChange, validateRequiredFields } from '../forms';
import { RequiredBoolean } from '../forms/RequiredBoolean';
import { RequiredField } from '../forms/RequiredField';
import { RequiredNumberField } from '../forms/RequiredNumberField';
import { errorAlert, GoBackButton } from '../utils/uiutil';
import i18n from '../utils/i18n'

export class SnapshotRestore extends Component {
    constructor(props) {
        super();

        this.state = {
            incremental: true,
            continueOnErrors: false,
            restoreOwnership: true,
            restorePermissions: true,
            restoreModTimes: true,
            uncompressedZip: true,
            overwriteFiles: false,
            overwriteDirectories: false,
            overwriteSymlinks: false,
            ignorePermissionErrors: true,
            writeFilesAtomically: false,
            writeSparseFiles: false,
            restoreDirEntryAtDepth: 1000,
            minSizeForPlaceholder: 0,
            restoreTask: "",
        };

        this.handleChange = handleChange.bind(this);
        this.start = this.start.bind(this);
    }

    start(e) {
        e.preventDefault();

        if (!validateRequiredFields(this, ["destination"])) {
            return;
        }

        const dst = (this.state.destination + "");

        let req = {
            root: this.props.match.params.oid,
            options: {
                incremental: this.state.incremental,
                ignoreErrors: this.state.continueOnErrors,
                restoreDirEntryAtDepth: this.state.restoreDirEntryAtDepth,
                minSizeForPlaceholder: this.state.minSizeForPlaceholder,
            },
        }

        if (dst.endsWith(".zip")) {
            req.zipFile = dst;
            req.uncompressedZip = this.state.uncompressedZip;
        } else if (dst.endsWith(".tar")) {
            req.tarFile = dst;
        } else {
            req.fsOutput = {
                targetPath: dst,
                skipOwners: !this.state.restoreOwnership,
                skipPermissions: !this.state.restorePermissions,
                skipTimes: !this.state.restoreModTimes,

                ignorePermissionErrors: this.state.ignorePermissionErrors,
                overwriteFiles: this.state.overwriteFiles,
                overwriteDirectories: this.state.overwriteDirectories,
                overwriteSymlinks: this.state.overwriteSymlinks,
                writeFilesAtomically: this.state.writeFilesAtomically,
                writeSparseFiles: this.state.writeSparseFiles,
            }
        }

        axios.post('/api/v1/restore', req).then(result => {
            this.setState({
                restoreTask: result.data.id,
            })
            this.props.history.replace("/tasks/" + result.data.id);
        }).catch(error => {
            errorAlert(error);
        });
    }

    render() {
        if (this.state.restoreTask) {
            return <p>
                <GoBackButton onClick={this.props.history.goBack} />
                <Link replace={true} to={"/tasks/" + this.state.restoreTask}>{i18n.t('snapshot.feedback.restore.task.go')}</Link>.
            </p>;
        }

        return <div className="padded-top">
            <GoBackButton onClick={this.props.history.goBack} />{' '}<span className="page-title">{i18n.t('snapshot.event.restore')}</span>
            <hr />
            <Form onSubmit={this.start}>
                <Row>
                    {RequiredField(this, i18n.t('snapshot.feedback.restore.destination'), "destination",
                        {
                            autoFocus: true,
                            placeholder: i18n.t('snapshot.feedback.restore.destination.path'),
                        }, i18n.t('snapshot.feedback.restore.destination.help'))}
                </Row>
                <br/>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.skip'), "incremental")}
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.continue.errors'), "continueOnErrors", i18n.t('snapshot.feedback.restore.continue.errors.help'))}
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.file.ownership'), "restoreOwnership")}
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.file.permission'), "restorePermissions")}
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.file.modification.time'), "restoreModTimes")}
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.file.overwrite'), "overwriteFiles")}
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.directory.overwrite'), "overwriteDirectories")}
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.link.overwrite'), "overwriteSymlinks")}
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.file.atomically'), "writeFilesAtomically")}
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.file.sparse'), "writeSparseFiles")}
                </Row>
                <Row>
                    <Col><hr /></Col>
                </Row>
                <Row>
                    {RequiredNumberField(this, i18n.t('snapshot.feedback.restore.shallow.depth'), "restoreDirEntryAtDepth")}
                    {RequiredNumberField(this, i18n.t('snapshot.feedback.restore.shallow.file.size.minimal'), "minSizeForPlaceholder")}
                </Row>
                <Row>
                    <Col><hr /></Col>
                </Row>
                <Row>
                    {RequiredBoolean(this, i18n.t('snapshot.feedback.restore.disable.compression.zip'), "uncompressedZip", i18n.t('snapshot.feedback.restore.disable.compression.zip.help'))}
                </Row>
                <Row>
                    <Col><hr /></Col>
                </Row>
                <Row>
                    <Col>
                        <Button variant="primary" type="submit" data-testid="submit-button">{i18n.t('snapshot.event.restore.begin')}</Button>
                    </Col>
                </Row>
            </Form>
        </div>;
    }
}
