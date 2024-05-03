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
import i18n from '../../utils/i18n';
import { Trans } from 'react-i18next';

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
            return i18n.t('feedback.policy.defined-by-this-policy');
        }

        return <>{i18n.t('feedback.policy.defined-by')} {PolicyEditorLink(p)}</>;
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
                    throw Error(i18n.t('feedback.policy.time-of-day.invalid', { 'tod': tod }))
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
                errorAlert(error, i18n.t('feedback.policy.error-saving-policy'));
            });
        } catch (e) {
            errorAlert(e);
            return
        }
    }

    deletePolicy() {
        if (window.confirm(i18n.t('feedback.policy.confirm-delete-policy'))) {
            this.setState({ saving: true });

            axios.delete(this.policyURL(this.props)).then(result => {
                this.props.close();
            }).catch(error => {
                this.setState({ saving: false });
                errorAlert(error, i18n.t('feedback.policy.error-delete-policy'));
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
            return <p>{i18n.t('common.label.loading')}</p>;
        }

        return <>
            <Form className='policy-editor' onSubmit={this.saveChanges}>
                <Accordion defaultActiveKey="retention">
                    <Accordion.Item eventKey="retention">
                        <Accordion.Header><FontAwesomeIcon icon={faCalendarTimes} className="policy-icon" />{i18n.t('feedback.policy.header.snapshot-retention')}</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.retention.latest-snapshot-retain')} help={i18n.t('feedback.policy.retention.latest-snapshot-retain-help')} />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepLatest", { placeholder: i18n.t('feedback.policy.retention.keep-latest-help') })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepLatest")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.retention.hourly-snapshot-retain')} help={i18n.t('feedback.policy.retention.hourly-snapshot-retain-help')} />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepHourly", { placeholder: i18n.t('feedback.policy.retention.hourly-snapshot-retain-hint') })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepHourly")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.retention.daily-snapshot-retain')} help={i18n.t('feedback.policy.retention.daily-snapshot-retain-help')} />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepDaily", { placeholder: i18n.t('feedback.policy.retention.daily-snapshot-retain-hint') })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepDaily")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.retention.weekly-snapshot-retain')} help={i18n.t('feedback.policy.retention.weekly-snapshot-retain-help')} />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepWeekly", { placeholder: i18n.t('feedback.policy.retention.weekly-snapshot-retain-hint') })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepWeekly")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.retention.monthly-snapshot-retain')} help={i18n.t('feedback.policy.retention.monthly-snapshot-retain-help')} />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepMonthly", { placeholder: i18n.t('feedback.policy.retention.monthly-snapshot-retain-hint') })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepMonthly")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.retention.annual-snapshot-retain')} help={i18n.t('feedback.policy.retention.annual-snapshot-retain-help')} />
                                <ValueColumn>{OptionalNumberField(this, null, "policy.retention.keepAnnual", { placeholder: i18n.t('feedback.policy.retention.annual-snapshot-retain-hint') })}</ValueColumn>
                                {EffectiveValue(this, "retention.keepAnnual")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.retention.ignore-identical-snapshots')} help={i18n.t('feedback.policy.retention.ignore-identical-snapshots-help')} />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.retention.ignoreIdenticalSnapshots", i18n.t('value.policy.inherent-from-parent'))}</ValueColumn>
                                {EffectiveValue(this, "retention.ignoreIdenticalSnapshots")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="files">
                        <Accordion.Header><FontAwesomeIcon icon={faFolderOpen} className="policy-icon" />{i18n.t('feedback.policy.header.files')}</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.files.ignore-files')} help={<Trans i18nKey={'feedback.policy.files.ignore-files-help'} components={{l:<a target="_blank" rel="noreferrer" href="https://kopia.io/docs/advanced/kopiaignore/"> </a>}} />} />
                                <WideValueColumn>{StringList(this, "policy.files.ignore", { placeholder: i18n.t('feedback.policy.files.ignore-files-hint') })}</WideValueColumn>
                                {EffectiveTextAreaValue(this, "files.ignore")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.files.ignore-rules-from-parent-directories')} help={i18n.t('feedback.policy.files.ignore-rules-from-parent-directories-help')} />
                                <ValueColumn>{RequiredBoolean(this, "", "policy.files.noParentIgnore")}</ValueColumn>
                                <EffectiveValueColumn />
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.files.ignore-rule-files')} help={i18n.t('feedback.policy.files.ignore-rule-files-help')} />
                                <ValueColumn>{StringList(this, "policy.files.ignoreDotFiles", { placeholder: i18n.t('feedback.policy.files.ignore-rule-files-hint') })}</ValueColumn>
                                {EffectiveTextAreaValue(this, "files.ignoreDotFiles")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.files.ignore-rule-files-from-parent-directories')} help={i18n.t('feedback.policy.files.ignore-rule-files-from-parent-directories-help')} />
                                <ValueColumn>{RequiredBoolean(this, "", "policy.files.noParentDotFiles")}</ValueColumn>
                                <EffectiveValueColumn />
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.files.ignore-well-known-cache-directories')} help={i18n.t('feedback.policy.files.ignore-well-known-cache-directories-help')} />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.files.ignoreCacheDirs", i18n.t('value.policy.inherent-from-parent'))}</ValueColumn>
                                {EffectiveBooleanValue(this, "files.ignoreCacheDirs")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.files.scan-only-one-filesystem')} help={i18n.t('feedback.policy.files.scan-only-one-filesystem-help')} />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.files.oneFileSystem", i18n.t('value.policy.inherent-from-parent'))}</ValueColumn>
                                {EffectiveBooleanValue(this, "files.oneFileSystem")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="errors">
                        <Accordion.Header><FontAwesomeIcon icon={faExclamationTriangle} className="policy-icon" />{i18n.t('feedback.policy.header.error-handling')}</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.error-handling.ignore-directory-errors')} help={i18n.t('feedback.policy.error-handling.ignore-directory-errors-help')} />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.errorHandling.ignoreDirectoryErrors", i18n.t('value.policy.inherent-from-parent'))}</ValueColumn>
                                {EffectiveBooleanValue(this, "errorHandling.ignoreDirectoryErrors")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.error-handling.ignore-file-errors')} help={i18n.t('feedback.policy.error-handling.ignore-file-errors-help')} />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.errorHandling.ignoreFileErrors", i18n.t('value.policy.inherent-from-parent'))}</ValueColumn>
                                {EffectiveBooleanValue(this, "errorHandling.ignoreFileErrors")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.error-handling.ignore-unknown-directories')} help={i18n.t('feedback.policy.error-handling.ignore-unknown-directories-help')} />
                                <ValueColumn>{OptionalBoolean(this, null, "policy.errorHandling.ignoreUnknownTypes", i18n.t('value.policy.inherent-from-parent'))}</ValueColumn>
                                {EffectiveBooleanValue(this, "errorHandling.ignoreUnknownTypes")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="compression">
                        <Accordion.Header><FontAwesomeIcon icon={faFileArchive} className="policy-icon" />{i18n.t('feedback.policy.header.compression')}</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.compression.compression-algorithm')} help={i18n.t('feedback.policy.compression.compression-algorithm-help')} />
                                <WideValueColumn>
                                    <Form.Control as="select" size="sm"
                                        name="policy.compression.compressorName"
                                        onChange={this.handleChange}
                                        value={stateProperty(this, "policy.compression.compressorName")}>
                                        <option value="">{i18n.t('value.policy.none')}</option>
                                        {this.state.algorithms && this.state.algorithms.compression.map(x => toAlgorithmOption(x, ""))}
                                    </Form.Control>
                                </WideValueColumn>
                                {EffectiveValue(this, "compression.compressorName")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.compression.minimal-file-size')} help={i18n.t('feedback.policy.compression.minimal-file-size-help')} />
                                <ValueColumn>{OptionalNumberField(this, "", "policy.compression.minSize", { placeholder: i18n.t('feedback.policy.compression.minimal-file-size-hint') })}</ValueColumn>
                                {EffectiveValue(this, "compression.minSize")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.compression.maximal-file-size')} help={i18n.t('feedback.policy.compression.maximal-file-size-help')} />
                                <ValueColumn>{OptionalNumberField(this, "", "policy.compression.maxSize", { placeholder: i18n.t('feedback.policy.compression.maximal-file-size-hint') })}</ValueColumn>
                                {EffectiveValue(this, "compression.maxSize")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.compression.only-compress-extensions')} help={i18n.t('feedback.policy.compression.only-compress-extensions-help')} />
                                <WideValueColumn>
                                    {StringList(this, "policy.compression.onlyCompress", { placeholder: i18n.t('feedback.policy.compression.only-compress-extensions-hint') })}
                                </WideValueColumn>
                                {EffectiveTextAreaValue(this, "compression.onlyCompress")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.compression.never-compress-extensions')} help={i18n.t('feedback.policy.compression.never-compress-extensions-help')} />
                                <WideValueColumn>
                                    {StringList(this, "policy.compression.neverCompress", { placeholder: i18n.t('feedback.policy.compression.never-compress-extensions-hint') })}
                                </WideValueColumn>
                                {EffectiveTextAreaValue(this, "compression.neverCompress")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="scheduling">
                        <Accordion.Header><FontAwesomeIcon icon={faClock} className="policy-icon" />{i18n.t('feedback.policy.header.scheduling')}</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.scheduling.snapshot-frequency')} help={i18n.t('feedback.policy.scheduling.snapshot-frequency-help')} />
                                <WideValueColumn>
                                    <Form.Control as="select" size="sm"
                                        name="policy.scheduling.intervalSeconds"
                                        onChange={e => this.handleChange(e, valueToNumber)}
                                        value={stateProperty(this, "policy.scheduling.intervalSeconds")}>
                                        <option value="">(none)</option>
                                        <option value="600">{i18n.t('value.snapshot-frequency.10-minutes')}</option>
                                        <option value="900">{i18n.t('value.snapshot-frequency.15-minutes')}</option>
                                        <option value="1200">{i18n.t('value.snapshot-frequency.20-minutes')}</option>
                                        <option value="1800">{i18n.t('value.snapshot-frequency.30-minutes')}</option>
                                        <option value="3600">{i18n.t('value.snapshot-frequency.hour')}</option>
                                        <option value="10800">{i18n.t('value.snapshot-frequency.3-hours')}</option>
                                        <option value="21600">{i18n.t('value.snapshot-frequency.6-hours')}</option>
                                        <option value="43200">{i18n.t('value.snapshot-frequency.12-hours')}</option>
                                    </Form.Control>
                                </WideValueColumn>
                                {EffectiveValue(this, "scheduling.intervalSeconds")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.scheduling.times-of-day')} help={i18n.t('feedback.policy.scheduling.times-of-day-help')} />
                                <ValueColumn>
                                    {TimesOfDayList(this, "policy.scheduling.timeOfDay", { placeholder: i18n.t('feedback.policy.scheduling.times-of-day-hint') })}
                                </ValueColumn>
                                {EffectiveTimesOfDayValue(this, "scheduling.timeOfDay")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.scheduling.cron-expressions')} help={<Trans i18nKey={'feedback.policy.schedulding.cron'} components={{ l: <a target="_blank" rel="noreferrer" href="https://github.com/hashicorp/cronexpr#implementation"> </a> }} />} />
                                <ValueColumn>
                                    {StringList(this, "policy.scheduling.cron", { placeholder: i18n.t('feedback.policy.scheduling.cron-expressions-hint') })}
                                </ValueColumn>
                                {EffectiveListValue(this, "scheduling.cron")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.scheduling.missed-snapshots-startup')} help={i18n.t('feedback.policy.scheduling.missed-snapshots-startup-help')} />
                                <ValueColumn>
                                    {OptionalBoolean(this, "", "policy.scheduling.runMissed", i18n.t('value.policy.inherent-from-parent'))}
                                </ValueColumn>
                                {EffectiveBooleanValue(this, "scheduling.runMissed")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.scheduling.manual-snapshots-only')} help={i18n.t('feedback.policy.scheduling.manual-snapshots-only-help')} />
                                <ValueColumn>
                                    {OptionalBoolean(this, "", "policy.scheduling.manual", i18n.t('value.policy.inherent-from-parent'))}
                                </ValueColumn>
                                {EffectiveBooleanValue(this, "scheduling.manual")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.scheduling.upcoming-snapshots')} help={i18n.t('feedback.policy.scheduling.upcoming-snapshots-help')} />
                                <ValueColumn>
                                </ValueColumn>
                                <EffectiveValueColumn>
                                    {UpcomingSnapshotTimes(this.state?.resolved)}
                                </EffectiveValueColumn>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="upload">
                        <Accordion.Header><FontAwesomeIcon icon={faUpload} className="policy-icon" />{i18n.t('feedback.policy.header.upload')}</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.upload.maximum-parallel-snapshots')}
                                    help={i18n.t('feedback.policy.upload.maximum-parallel-snapshots-help')} />
                                <ValueColumn>{OptionalNumberField(this, "", "policy.upload.maxParallelSnapshots", { placeholder: !this.props.path ? i18n.t('feedback.policy.upload.maximum-parallel-snapshots-hint-set') : i18n.t('feedback.policy.upload.maximum-parallel-snapshots-hint-unset'), disabled: !!this.props.path })}</ValueColumn>
                                {EffectiveValue(this, "upload.maxParallelSnapshots")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.upload.maximum-parallel-file-reads')} help={i18n.t('feedback.policy.upload.maximum-parallel-file-reads-help')} />
                                <ValueColumn>{OptionalNumberField(this, "", "policy.upload.maxParallelFileReads", { placeholder: i18n.t('feedback.policy.upload.maximum-parallel-file-reads-hint') })}</ValueColumn>
                                {EffectiveValue(this, "upload.maxParallelFileReads")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="snapshot-actions">
                        <Accordion.Header><FontAwesomeIcon icon={faCogs} className="policy-icon" />{i18n.t('feedback.policy.header.snapshot-action')}</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            {ActionRowScript(this, "actions.beforeSnapshotRoot.script", i18n.t('feedback.policy.actions.before-snapshot'), i18n.t('feedback.policy.actions.before-snapshot-help'))}
                            {ActionRowTimeout(this, "actions.beforeSnapshotRoot.timeout")}
                            {ActionRowMode(this, "actions.beforeSnapshotRoot.mode")}
                            <hr />
                            {ActionRowScript(this, "actions.afterSnapshotRoot.script", i18n.t('feedback.policy.actions.after-snapshot'), i18n.t('feedback.policy.actions.after-snapshot-help'))}
                            {ActionRowTimeout(this, "actions.afterSnapshotRoot.timeout")}
                            {ActionRowMode(this, "actions.afterSnapshotRoot.mode")}
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="folder-actions">
                        <Accordion.Header><FontAwesomeIcon icon={faCog} className="policy-icon" />{i18n.t('feedback.policy.header.folder-actions')}</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            {ActionRowScript(this, "actions.beforeFolder.script", i18n.t('feedback.policy.actions.before-folder'), i18n.t('feedback.policy.actions.before-folder-help'))}
                            {ActionRowTimeout(this, "actions.beforeFolder.timeout")}
                            {ActionRowMode(this, "actions.beforeFolder.mode")}
                            <hr />
                            {ActionRowScript(this, "actions.afterFolder.script", i18n.t('feedback.policy.actions.after-folder'), i18n.t('feedback.policy.actions.after-folder-help'))}
                            {ActionRowTimeout(this, "actions.afterFolder.timeout")}
                            {ActionRowMode(this, "actions.afterFolder.mode")}
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="logging">
                        <Accordion.Header><FontAwesomeIcon icon={faFileAlt} className="policy-icon" />{i18n.t('feedback.policy.header.logging')}</Accordion.Header>
                        <Accordion.Body>
                            <SectionHeaderRow />
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.logging.directory-snapshotted')} help={i18n.t('feedback.policy.logging.directory-snapshotted-help')} />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.directories.snapshotted")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.directories.snapshotted")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.logging.directory-ignored')} help={i18n.t('feedback.policy.logging.directory-ignored-help')} />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.directories.ignored")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.directories.ignored")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.logging.file-snapshotted')} help={i18n.t('feedback.policy.logging.file-snapshotted-help')} />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.entries.snapshotted")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.entries.snapshotted")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.logging.file-ignored')} help={i18n.t('feedback.policy.logging.file-ignored-help')} />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.entries.ignored")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.entries.ignored")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.logging.cache-hit')} help={i18n.t('feedback.policy.logging.cache-hit-help')} />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.entries.cacheHit")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.entries.cacheHit")}
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.logging.cache-miss')} help={i18n.t('feedback.policy.logging.cache-miss-help')} />
                                <WideValueColumn>
                                    {LogDetailSelector(this, "policy.logging.entries.cacheMiss")}
                                </WideValueColumn>
                                {EffectiveValue(this, "logging.entries.cacheMiss")}
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="other">
                        <Accordion.Header><FontAwesomeIcon icon={faMagic} className="policy-icon" />{i18n.t('feedback.policy.header.other')}</Accordion.Header>
                        <Accordion.Body>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.other.disable-parent-policy-evaluation')} help={i18n.t('feedback.policy.other.disable-parent-policy-evaluation-help')} />
                                <ValueColumn>
                                    {RequiredBoolean(this, "", "policy.noParent")}
                                </ValueColumn>
                            </Row>
                            <Row>
                                <LabelColumn name={i18n.t('feedback.policy.other.json-representation')} help={i18n.t('feedback.policy.other.json-representation-help')} />
                                <WideValueColumn>
                                    <pre className="debug-json">{JSON.stringify(this.state.policy, null, 4)}
                                    </pre>
                                </WideValueColumn>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <br />
                {!this.props.embedded && <Button size="sm" variant="success" onClick={this.saveChanges} data-testid="button-save" disabled={this.state.saving}>{i18n.t('event.policy.save')}</Button>}
                {!this.state.isNew && !this.props.embedded && <>&nbsp;
                    <Button size="sm" variant="danger" disabled={this.isGlobal() || this.state.saving} onClick={this.deletePolicy}>{i18n.t('event.policy.delete')}</Button>
                </>}
                {this.state.saving && <>
                    &nbsp;
                    <Spinner animation="border" variant="primary" size="sm" />
                </>}
            </Form>
        </>;
    }
}
