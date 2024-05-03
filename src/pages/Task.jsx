
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import { Logs } from '../components/Logs';
import { cancelTask, formatDuration, GoBackButton, redirect, sizeDisplayName } from '../utils/uiutil';
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';
import i18n from '../utils/i18n'

export class Task extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            isLoading: true,
            error: null,
            showLog: false,
        };

        this.taskID = this.taskID.bind(this);
        this.fetchTask = this.fetchTask.bind(this);
    }

    componentDidMount() {
        this.setState({
            isLoading: true,
        });

        // poll frequently, we will stop as soon as the task ends.
        this.interval = window.setInterval(() => this.fetchTask(), 500);
        this.fetchTask();
    }

    componentWillUnmount() {
        if (this.interval) {
            window.clearInterval(this.interval);
        }
    }

    taskID(props) {
        return props.taskID || props.match.params.tid;
    }

    fetchTask() {
        axios.get('/api/v1/tasks/' + this.taskID(this.props)).then(result => {
            this.setState({
                task: result.data,
                isLoading: false,
            });

            if (result.data.endTime) {
                window.clearInterval(this.interval);
                this.interval = null;
            }
        }).catch(error => {
            redirect(error);
            this.setState({
                error,
                isLoading: false
            });
        });
    }

    componentDidUpdate(prevProps) {
        if (this.taskID(prevProps) !== this.taskID(this.props)) {
            this.fetchTask();
        }
    }

    summaryControl(task) {
        const dur = formatDuration(task.startTime, task.endTime, true)

        switch (task.status) {

            case "SUCCESS":
                return <Alert size="sm" variant="success">{i18n.t('feedback.task.status.task-succeeded-after')} {dur}.</Alert>;

            case "FAILED":
                return <Alert variant="danger"><b>{i18n.t('feedback.task.status.task-error')}:</b> {task.errorMessage}.</Alert>;

            case "CANCELED":
                return <Alert variant="warning">{i18n.t('feedback.task.status.task-canceled')}.</Alert>;

            case "CANCELING":
                return <Alert variant="primary">
                    <Spinner animation="border" variant="warning" size="sm" />{i18n.t('feedback.task.status.task-canceling')} {dur}: {task.progressInfo}.</Alert>;

            default:
                return <Alert variant="primary">
                    <Spinner animation="border" variant="primary" size="sm" />{i18n.t('feedback.task.status.task-running-for')} {dur}: {task.progressInfo}.</Alert>;
        }
    }

    valueThreshold() {
        if (this.props.showZeroCounters) {
            return -1;
        }

        return 0
    }

    counterBadge(label, c) {
        if (c.value < this.valueThreshold()) {
            return "";
        }

        let formatted = c.value.toLocaleString();
        if (c.units === "bytes") {
            formatted = sizeDisplayName(c.value);
        }

        return <tr key={label}><td>{label}</td><td>{formatted}</td></tr>;
    }

    counterLevelToSortOrder(l) {
        switch (l) {
            case "error":
                return 30
            case "notice":
                return 10;
            case "warning":
                return 5;
            default:
                return 0;
        }
    }

    sortedBadges(counters) {
        let keys = Object.keys(counters);

        // sort keys by their level and the name alphabetically.
        keys.sort((a, b) => {
            if (counters[a].level !== counters[b].level) {
                return this.counterLevelToSortOrder(counters[b].level) - this.counterLevelToSortOrder(counters[a].level);
            }

            if (a < b) {
                return -1;
            }

            if (a > b) {
                return 1;
            }

            return 0;
        });

        return keys.map(c => this.counterBadge(c, counters[c]));
    }

    render() {
        const { task, isLoading, error } = this.state;
        const { bytesStringBase2 } = this.context
        if (error) {
            return <p>{error.message}</p>;
        }

        if (isLoading) {
            return <p>{i18n.t('common.label.loading')}</p>;
        }

        return <Form>
            {this.props.history &&
                <Row>
                    <Form.Group>
                        <h4>
                            <GoBackButton onClick={this.props.history.goBack} />
                            {task.status === "RUNNING" && <>
                                &nbsp;<Button size="sm" variant="danger" onClick={() => cancelTask(task.id)} ><FontAwesomeIcon icon={faStopCircle} /> {i18n.t('common.action.stop')} </Button>
                            </>}
                            &nbsp;{task.kind}: {task.description}</h4>
                    </Form.Group>
                </Row>}
            <Row>
                <Col xs={12}>
                    {this.summaryControl(task)}
                </Col>
            </Row>
            {task.counters && <Row>
                <Col>
                    <Table bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>{i18n.t('feedback.task.header.counter')}</th>
                                <th>{i18n.t('feedback.task.header.value')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.sortedBadges(task.counters, bytesStringBase2)}
                        </tbody>
                    </Table>
                </Col>
            </Row>}
            <Row>
                <Col xs={6}>
                    <Form.Group>
                        <Form.Label><b>{i18n.t('feedback.task.status.task-started')}</b></Form.Label>
                        <Form.Control type="text" readOnly={true} value={new Date(task.startTime).toLocaleString()} />
                    </Form.Group>
                </Col>
                <Col xs={6}>
                    <Form.Group>
                        <Form.Label><b>{i18n.t('feedback.task.status.task-finished')}</b></Form.Label>
                        <Form.Control type="text" readOnly={true} value={new Date(task.endTime).toLocaleString()} />
                    </Form.Group>
                </Col>
            </Row>
            <br />
            <Row>
                <Form.Group>
                    <Form.Label><b>{i18n.t('feedback.task.logs')}</b></Form.Label>
                    <Logs taskID={this.taskID(this.props)} />
                </Form.Group>
            </Row>
        </Form>
    }
}
Task.contextType = UIPreferencesContext