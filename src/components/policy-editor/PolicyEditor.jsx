import { faCalendarTimes, faClock, faExclamationTriangle, faFileAlt, faFileArchive, faFolderOpen, faMagic, faCog, faCogs, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Accordion from 'react-bootstrap/Accordion';
import { handleChange, stateProperty, valueToNumber } from '../../forms';
import { StringList } from '../../forms/StringList';
import { LogDetailSelector } from '../../forms/LogDetailSelector';
import { OptionalBoolean } from '../../forms/OptionalBoolean';
import { OptionalNumberField } from '../../forms/OptionalNumberField';
import { RequiredBoolean } from '../../forms/RequiredBoolean';
import { TimesOfDayList } from '../../forms/TimesOfDayList';
import { errorAlert, PolicyEditorLink, sourceQueryStringParams, toAlgorithmOption } from '../../utils/uiutil';
import { LabelColumn } from './LabelColumn';
import { ValueColumn } from './ValueColumn';
import { WideValueColumn } from './WideValueColumn';
import { EffectiveValue } from './EffectiveValue';
import { EffectiveListValue } from './EffectiveListValue';
import { EffectiveTextAreaValue } from './EffectiveTextAreaValue';
import { EffectiveTimesOfDayValue } from './EffectiveTimesOfDayValue';
import { EffectiveBooleanValue } from './EffectiveBooleanValue';
import { EffectiveValueColumn } from './EffectiveValueColumn';
import { UpcomingSnapshotTimes } from './UpcomingSnapshotTimes';
import { SectionHeaderRow } from './SectionHeaderRow';
import { ActionRowScript } from './ActionRowScript';
import { ActionRowTimeout } from './ActionRowTimeout';
import { ActionRowMode } from './ActionRowMode';

export class PolicyEditor extends Component {
    constructor() {
        super();
        this.state = {
            items: [],
            isLoading: false,
            error: null,
        };

        this.fetchPolicy = this.fetchPolicy.bind(this);
        this.handleChange = handleChange.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.isGlobal = this.isGlobal.bind(this);
        this.deletePolicy = this.deletePolicy.bind(this);
        this.policyURL = this.policyURL.bind(this);
        this.resolvePolicy = this.resolvePolicy.bind(this);
        this.PolicyDefinitionPoint = this.PolicyDefinitionPoint.bind(this);
        this.getAndValidatePolicy = this.getAndValidatePolicy.bind(this);
    }

    componentDidMount() {
        axios.get('/api/v1/repo/algorithms').then(result => {
            this.setState({
                algorithms: result.data,
            });

            this.fetchPolicy(this.props);
        });
    }

    componentDidUpdate(prevProps) {
        if (sourceQueryStringParams(this.props) !== sourceQueryStringParams(prevProps)) {
            this.fetchPolicy(this.props);
        }

        const pjs = JSON.stringify(this.state.policy);
        if (pjs !== this.lastResolvedPolicy) {
            this.resolvePolicy(this.props);
            this.lastResolvedPolicy = pjs;
        }
    }

    fetchPolicy(props) {
        axios.get(this.policyURL(props)).then(result => {
            this.setState({
                isLoading: false,
                policy: result.data,
            });
        }).catch(error => {
            if (error.response && error.response.data.code !== "NOT_FOUND") {
                this.setState({
                    error: error,
                    isLoading: false
                })
            } else {
                this.setState({
                    policy: {},
                    isNew: true,
                    isLoading: false
                })
            }
        });
    }

    resolvePolicy(props) {
        const u = '/api/v1/policy/resolve?' + sourceQueryStringParams(props);

        try {
            axios.post(u, {
                "updates": this.getAndValidatePolicy(),
                "numUpcomingSnapshotTimes": 5,
            }).then(result => {
                this.setState({ resolved: result.data });
            }).catch(error => {
                this.setState({ resolvedError: error });
            });
        }
        catch (e) {
        }
    }

    PolicyDefinitionPoint(p) {
        if (!p) {
            return "";
        }

        if (p.userName === this.props.userName && p.host === this.props.host && p.path === this.props.path) {
            return "(Defined by this policy)";
        }

        return <>Defined by {PolicyEditorLink(p)}</>;
    }

    getAndValidatePolicy() {
        function removeEmpty(l) {
            if (!l) {
                return l;
            }

            let result = [];
            for (let i = 0; i < l.length; i++) {
                const s = l[i];
                if (s === "") {
                    continue;
                }

                result.push(s);
            }

            return result;
        }

        function validateTimesOfDay(l) {
            for (const tod of l) {
                if (typeof (tod) !== "object") {
                    // unparsed
                    throw Error("invalid time of day: '" + tod + "'")
                }
            }

            return l;
        }

        // clone and clean up policy before saving
        let policy = JSON.parse(JSON.stringify(this.state.policy));
        if (policy.files) {
            if (policy.files.ignore) {
                policy.files.ignore = removeEmpty(policy.files.ignore)
            }
            if (policy.files.ignoreDotFiles) {
                policy.files.ignoreDotFiles = removeEmpty(policy.files.ignoreDotFiles)
            }
        }

        if (policy.compression) {
            if (policy.compression.onlyCompress) {
                policy.compression.onlyCompress = removeEmpty(policy.compression.onlyCompress)
            }
            if (policy.compression.neverCompress) {
                policy.compression.neverCompress = removeEmpty(policy.compression.neverCompress)
            }
        }

        if (policy.scheduling) {
            if (policy.scheduling.timeOfDay) {
                policy.scheduling.timeOfDay = validateTimesOfDay(removeEmpty(policy.scheduling.timeOfDay));
            }
        }

        if (policy.actions) {
            policy.actions = this.sanitizeActions(policy.actions, ["beforeSnapshotRoot", "afterSnapshotRoot", "beforeFolder", "afterFolder"]);
        }

        return policy;
    }

    sanitizeActions(actions, actionTypes) {
        actionTypes.forEach(actionType => {
            if (actions[actionType]) {
                if (actions[actionType].script === undefined || actions[actionType].script === "") {
                    actions[actionType] = undefined;
                } else {
                    if (actions[actionType].timeout === undefined) {
                        actions[actionType].timeout = 300;
                    }
                }
            }
        });
        return actions;
    }

    saveChanges(e) {
        e.preventDefault()

        try {
            const policy = this.getAndValidatePolicy();

            this.setState({ saving: true });
            axios.put(this.policyURL(this.props), policy).then(result => {
                this.props.close();
            }).catch(error => {
                this.setState({ saving: false });
                errorAlert(error, 'Error saving policy');
            });
        } catch (e) {
            errorAlert(e);
            return
        }
    }

    deletePolicy() {
        if (window.confirm('Are you sure you want to delete this policy?')) {
            this.setState({ saving: true });

            axios.delete(this.policyURL(this.props)).then(result => {
                this.props.close();
            }).catch(error => {
                this.setState({ saving: false });
                errorAlert(error, 'Error deleting policy');
            });
        }
    }

    policyURL(props) {
        return '/api/v1/policy?' + sourceQueryStringParams(props);
    }

    isGlobal() {
        return !this.props.host && !this.props.userName && !this.props.path;
    }

    render() {
        const { isLoading, error } = this.state;
        if (error) {
            return <p>{error.message}</p>;
        }

        if (isLoading) {
            return <p>Loading ...</p>;
        }

        return <>
            <Form className='policy-editor' onSubmit={this.saveChanges}>
                <Accordion defaultActiveKey="scheduling">
                    <Accordion.Item eventKey="retention">
                        <Accordion.Header><FontAwesomeIcon icon={faCalendarTimes} />&nbsp;Snapshot Retention</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name="Latest Snapshots" help="Number of the most recent snapshots to retain per source" />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepLatest", { placeholder: "# of latest snapshots" })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepLatest")}
                            </Row>
                            <Row>
                                <LabelColumn name="Hourly" help="How many hourly snapshots to retain per source. The latest snapshot from each hour will be retained" />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepHourly", { placeholder: "# of hourly snapshots" })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepHourly")}
                            </Row>
                            <Row>
                                <LabelColumn name="Daily" help="How many daily snapshots to retain per source. The latest snapshot from each day will be retained" />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepDaily", { placeholder: "# of daily snapshots" })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepDaily")}
                            </Row>
                            <Row>
                                <LabelColumn name="Weekly" help="How many weekly snapshots to retain per source. The latest snapshot from each week will be retained" />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepWeekly", { placeholder: "# of weekly snapshots" })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepWeekly")}
                            </Row>
                            <Row>
                                <LabelColumn name="Monthly" help="How many monthly snapshots to retain per source. The latest snapshot from each calendar month will be retained" />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepMonthly", { placeholder: "# of monthly snapshots" })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepMonthly")}
                            </Row>
                            <Row>
                                <LabelColumn name="Annual" help="How many annual snapshots to retain per source. The latest snapshot from each calendar year will be retained" />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepAnnual", { placeholder: "# of annual snapshots" })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepAnnual")}
                            </Row>
                            <Row>
                                <LabelColumn name="Ignore Identical Snapshots" help="Do NOT save a snapshot when no files have been changed" />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.retention.ignoreIdenticalSnapshots", "inherit from parent")}</ValueColumn>
                                {EffectiveValue(this, "retention.ignoreIdenticalSnapshots")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="files">
                        <Accordion.Header><FontAwesomeIcon icon={faFolderOpen} />&nbsp;Files</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name="Ignore Files" help={<> List of file and directory names to ignore. <br /> (See <a target="_blank" rel="noreferrer" href="https://kopia.io/docs/advanced/kopiaignore/">documentation on ignoring files</a>).</>} />
                                <WideValueColumn>{StringList(this, "policy.files.ignore", { placeholder: "e.g. /file.txt" })}</WideValueColumn>
                                {EffectiveTextAreaValue(this, "files.ignore")}
                            </Row>
                            <Row>
                                <LabelColumn name="Ignore Rules From Parent Directories" help="When set, ignore rules from the parent directory are ignored" />
                                <ValueColumn>{RequiredBoolean(this, "", "policy.files.noParentIgnore")}</ValueColumn>
                                <EffectiveValueColumn />
                            </Row>
                            <Row>
                                <LabelColumn name="Ignore Rule Files" help="List of additional files containing ignore rules (each file configures ignore rules for the directory and its subdirectories)" />
                                <ValueColumn>{StringList(this, "policy.files.ignoreDotFiles", { placeholder: "e.g. .kopiaignore" })}</ValueColumn>
                                {EffectiveTextAreaValue(this, "files.ignoreDotFiles")}
                            </Row>
                            <Row>
                                <LabelColumn name="Ignore Rule Files From Parent Directories" help="When set, the files specifying ignore rules (.kopiaignore, etc.) from the parent directory are ignored" />
                                <ValueColumn>{RequiredBoolean(this, "", "policy.files.noParentDotFiles")}</ValueColumn>
                                <EffectiveValueColumn />
                            </Row>
                            <Row>
                                <LabelColumn name="Ignore Well-Known Cache Directories" help="Ignore directories containing CACHEDIR.TAG and similar" />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.files.ignoreCacheDirs", "inherit from parent")}</ValueColumn>
                                {EffectiveBooleanValue(this, "files.ignoreCacheDirs")}
                            </Row>
                            <Row>
                                <LabelColumn name="Scan only one filesystem" help="Do not cross filesystem boundaries when creating a snapshot" />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.files.oneFileSystem", "inherit from parent")}</ValueColumn>
                                {EffectiveBooleanValue(this, "files.oneFileSystem")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="errors">
                        <Accordion.Header><FontAwesomeIcon icon={faExclamationTriangle} />&nbsp;Error Handling</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name="Ignore Directory Errors" help="Treat directory read errors as non-fatal." />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.errorHandling.ignoreDirectoryErrors", "inherit from parent")}</ValueColumn>
                                {EffectiveBooleanValue(this, "errorHandling.ignoreDirectoryErrors")}
                            </Row>
                            <Row>
                                <LabelColumn name="Ignore File Errors" help="Treat file read errors as non-fatal." />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.errorHandling.ignoreFileErrors", "inherit from parent")}</ValueColumn>
                                {EffectiveBooleanValue(this, "errorHandling.ignoreFileErrors")}
                            </Row>
                            <Row>
                                <LabelColumn name="Ignore Unknown Directory Entries" help="Treat unrecognized/unsupported directory entries as non-fatal errors." />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.errorHandling.ignoreUnknownTypes", "inherit from parent")}</ValueColumn>
                                {EffectiveBooleanValue(this, "errorHandling.ignoreUnknownTypes")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="compression">
                        <Accordion.Header><FontAwesomeIcon icon={faFileArchive} />&nbsp;Compression</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name="Compression Algorithm" help="Specify compression algorithm to use when snapshotting files in this directory and subdirectories" />
                                <WideValueColumn>
                                    <Form.Control as="select" size="sm"
                                        name="policy.compression.compressorName"
                                        onChange={this.handleChange}
                                        value={stateProperty(this, "policy.compression.compressorName")}>
                                        <option value="">(none)</option>
                                        {this.state.algorithms && this.state.algorithms.compression.map(x => toAlgorithmOption(x, ""))}
                                    </Form.Control>
                                </WideValueColumn>
                                {EffectiveValue(this, "compression.compressorName")}
                            </Row>
                            <Row>
                                <LabelColumn name="Minimum File Size" help="Files that are smaller than the provided value will not be compressed" />
                                <ValueColumn>{OptionalNumberField(this, "", "policy.compression.minSize", { placeholder: "minimum file size in bytes" })}</ValueColumn>
                                {EffectiveValue(this, "compression.minSize")}
                            </Row>
                            <Row>
                                <LabelColumn name="Max File Size" help="Files whose size exceeds the provided value will not be compressed" />
                                <ValueColumn>{OptionalNumberField(this, "", "policy.compression.maxSize", { placeholder: "maximum file size in bytes" })}</ValueColumn>
                                {EffectiveValue(this, "compression.maxSize")}
                            </Row>
                            <Row>
                                <LabelColumn name="Only Compress Extensions" help="Only compress files with the following file extensions (one extension per line)" />
                                <WideValueColumn>
                                    {StringList(this, "policy.compression.onlyCompress", { placeholder: "e.g. *.txt" })}
                                </WideValueColumn>
                                {EffectiveTextAreaValue(this, "compression.onlyCompress")}
                            </Row>
                            <Row>
                                <LabelColumn name="Never Compress Extensions" help="Never compress the following file extensions (one extension per line)" />
                                <WideValueColumn>
                                    {StringList(this, "policy.compression.neverCompress", { placeholder: "e.g. *.mp4" })}
                                </WideValueColumn>
                                {EffectiveTextAreaValue(this, "compression.neverCompress")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="scheduling">
                        <Accordion.Header><FontAwesomeIcon icon={faClock} />&nbsp;Scheduling</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name="Snapshot Frequency" help="How frequently to create snapshots in KopiaUI or Kopia server (has no effect outside of the server mode)" />
                                <WideValueColumn>
                                    <Form.Control as="select" size="sm"
                                        name="policy.scheduling.intervalSeconds"
                                        onChange={e => this.handleChange(e, valueToNumber)}
                                        value={stateProperty(this, "policy.scheduling.intervalSeconds")}>
                                        <option value="">(none)</option>
                                        <option value="600">every 10 minutes</option>
                                        <option value="900">every 15 minutes</option>
                                        <option value="1200">every 20 minutes</option>
                                        <option value="1800">every 30 minutes</option>
                                        <option value="3600">every hour</option>
                                        <option value="10800">every 3 hours</option>
                                        <option value="21600">every 6 hours</option>
                                        <option value="43200">every 12 hours</option>
                                    </Form.Control>
                                </WideValueColumn>
                                {EffectiveValue(this, "scheduling.intervalSeconds")}
                            </Row>
                            <Row>
                                <LabelColumn name="Times Of Day" help="Create snapshots at the specified times of day (24hr format)" />
                                <ValueColumn>
                                    {TimesOfDayList(this, "policy.scheduling.timeOfDay", { placeholder: "e.g. 17:00" })}
                                </ValueColumn>
                                {EffectiveTimesOfDayValue(this, "scheduling.timeOfDay")}
                            </Row>
                            <Row>
                                <LabelColumn name="Cron Expressions" help={<>Snapshot schedules using UNIX crontab syntax (one per line):
                                    <br /> See <a target="_blank" rel="noreferrer" href="https://github.com/hashicorp/cronexpr#implementation">supported format details</a>.</>} />
                                <ValueColumn>
                                    {StringList(this, "policy.scheduling.cron", { placeholder: "minute hour day month weekday #comment" })}
                                </ValueColumn>
                                {EffectiveListValue(this, "scheduling.cron")}
                            </Row>
                            <Row>
                                <LabelColumn name="Run Missed Snapshots on Startup" help="Immediately run any missed snapshots when kopia starts (only relevant for Time-of-day snapshots)" />
                                <ValueColumn>
                                    {OptionalBoolean(this, "", "policy.scheduling.runMissed", "inherit from parent")}
                                </ValueColumn>
                                {EffectiveBooleanValue(this, "scheduling.runMissed")}
                            </Row>
                            <Row>
                                <LabelColumn name="Manual Snapshots Only" help="Only create snapshots manually (disables scheduled snapshots)" />
                                <ValueColumn>
                                    {OptionalBoolean(this, "", "policy.scheduling.manual", "inherit from parent")}
                                </ValueColumn>
                                {EffectiveBooleanValue(this, "scheduling.manual")}
                            </Row>
                            <Row>
                                <LabelColumn name="Upcoming Snapshots" help="Times of upcoming snapshots calculated based on policy parameters" />
                                <ValueColumn>
                                </ValueColumn>
                                <EffectiveValueColumn>
                                    {UpcomingSnapshotTimes(this.state?.resolved)}
                                </EffectiveValueColumn>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="upload">
                        <Accordion.Header><FontAwesomeIcon icon={faUpload} />&nbsp;Upload</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name="Maximum Parallel Snapshots"
                                    help="Maximum number of snapshots that can be uploaded simultaneously" />
                                <ValueColumn>{OptionalNumberField(this, "", "policy.upload.maxParallelSnapshots", { placeholder: !this.props.path ? "max number of parallel snapshots" : "must be specified using global, user, or host policy", disabled: !!this.props.path })}</ValueColumn>
                                {EffectiveValue(this, "upload.maxParallelSnapshots")}
                            </Row>
                            <Row>
                                <LabelColumn name="Maximum Parallel File Reads" help="Maximum number of files that will be read in parallel (defaults to the number of logical processors)" />
                                <ValueColumn>{OptionalNumberField(this, "", "policy.upload.maxParallelFileReads", { placeholder: "max number of parallel file reads" })}</ValueColumn>
                                {EffectiveValue(this, "upload.maxParallelFileReads")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="snapshot-actions">
                        <Accordion.Header><FontAwesomeIcon icon={faCogs} />&nbsp;Snapshot Actions</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            {ActionRowScript(this, "actions.beforeSnapshotRoot.script", "Before Snapshot", "Script to run before snapshot")}
                            {ActionRowTimeout(this, "actions.beforeSnapshotRoot.timeout")}
                            {ActionRowMode(this, "actions.beforeSnapshotRoot.mode")}
                            <hr />
                            {ActionRowScript(this, "actions.afterSnapshotRoot.script", "After Snapshot", "Script to run after snapshot")}
                            {ActionRowTimeout(this, "actions.afterSnapshotRoot.timeout")}
                            {ActionRowMode(this, "actions.afterSnapshotRoot.mode")}
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="folder-actions">
                        <Accordion.Header><FontAwesomeIcon icon={faCog} />&nbsp;Folder Actions</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            {ActionRowScript(this, "actions.beforeFolder.script", "Before Folder", "Script to run before folder")}
                            {ActionRowTimeout(this, "actions.beforeFolder.timeout")}
                            {ActionRowMode(this, "actions.beforeFolder.mode")}
                            <hr />
                            {ActionRowScript(this, "actions.afterFolder.script", "After Folder", "Script to run after folder")}
                            {ActionRowTimeout(this, "actions.afterFolder.timeout")}
                            {ActionRowMode(this, "actions.afterFolder.mode")}
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="logging">
                        <Accordion.Header><FontAwesomeIcon icon={faFileAlt} />&nbsp;Logging</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name="Directory Snapshotted" help="Log verbosity when a directory is snapshotted" />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.directories.snapshotted")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.directories.snapshotted")}
                            </Row>
                            <Row>
                                <LabelColumn name="Directory Ignored" help="Log verbosity when a directory is ignored" />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.directories.ignored")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.directories.ignored")}
                            </Row>
                            <Row>
                                <LabelColumn name="File Snapshotted" help="Log verbosity when a file, symbolic link, etc. is snapshotted" />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.entries.snapshotted")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.entries.snapshotted")}
                            </Row>
                            <Row>
                                <LabelColumn name="File Ignored" help="Log verbosity when a file, symbolic link, etc. is ignored" />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.entries.ignored")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.entries.ignored")}
                            </Row>
                            <Row>
                                <LabelColumn name="Cache Hit" help="Log verbosity when a cache is used instead of uploading the file" />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.entries.cacheHit")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.entries.cacheHit")}
                            </Row>
                            <Row>
                                <LabelColumn name="Cache Miss" help="Log verbosity when a cache cannot be used and a file must be hashed" />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.entries.cacheMiss")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.entries.cacheMiss")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="other">
                        <Accordion.Header><FontAwesomeIcon icon={faMagic} />&nbsp;Other</Accordion.Header>
                        <Accordion.Body>
                            <Row>
                                <LabelColumn name="Disable Parent Policy Evaluation" help="Prevents any parent policies from affecting this directory and its subdirectories" />
                                <ValueColumn>
                                    {RequiredBoolean(this, "", "policy.noParent")}
                                </ValueColumn>
                            </Row>
                            <Row>
                                <LabelColumn name="JSON Representation" help="This is the internal representation of a policy" />
                                <WideValueColumn>
                                    <pre className="debug-json">{JSON.stringify(this.state.policy, null, 4)}
                                    </pre>
                                </WideValueColumn>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

                {!this.props.embedded && <Button size="sm" variant="success" onClick={this.saveChanges} data-testid="button-save" disabled={this.state.saving}>Save Policy</Button>}
                {!this.state.isNew && !this.props.embedded && <>&nbsp;
                    <Button size="sm" variant="danger" disabled={this.isGlobal() || this.state.saving} onClick={this.deletePolicy}>Delete Policy</Button>
                </>}
                {this.state.saving && <>
                    &nbsp;
                    <Spinner animation="border" variant="primary" size="sm" />
                </>}
            </Form>
        </>;
    }
}
