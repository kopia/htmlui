
import { faChevronCircleDown, faChevronCircleUp, faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/esm/Spinner';
import Form from 'react-bootstrap/Form';
import { Logs } from './Logs';
import { cancelTask, redirect, sizeDisplayName } from '../utils/uiutil';
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';
import i18n from '../utils/i18n';
import { Trans } from 'react-i18next';

export class SnapshotEstimation extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
        this.interval = window.setInterval(() => this.fetchTask(this.props), 500);
        this.fetchTask(this.props);
    }

    componentWillUnmount() {
        if (this.interval) {
            window.clearInterval(this.interval);
        }
    }

    taskID(props) {
        return props.taskID || props.match.params.tid;
    }

    fetchTask(props) {
        axios.get('/api/v1/tasks/' + this.taskID(props)).then(result => {
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
        if (prevProps !== this.props) {
            this.fetchTask(this.props);
        }
    }

    taskStatusDescription(task) {
        if (task.status === "RUNNING") {
            return <><Spinner animation="border" variant="primary" size="sm" /></>
        }

        if (task.status === "SUCCESS") {
            return i18n.t('feedback.task.tasks-total')
        }

        if (task.status === "CANCELED") {
            return "(Canceled)"
        }

        return task.status;
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

        return <>
            {task.counters && <Form.Text className="estimateResults">
                <Trans i18nKey={'feedback.task.estimated-results'} values={
                    {
                        "description": this.taskStatusDescription(task),
                        "bytes": sizeDisplayName(task.counters["Bytes"]?.value, bytesStringBase2),
                        "bytes.excluded": sizeDisplayName(task.counters["Excluded Bytes"]?.value, bytesStringBase2),
                        "files": task.counters["Files"]?.value,
                        "files.excluded": task.counters["Excluded Files"]?.value,
                        "directories": task.counters["Directories"]?.value,
                        "directories.excluded": task.counters["Excluded Directories"]?.value,
                        "errors": task.counters["Errors"]?.value,
                        "errors.ignored": task.counters["Ignored Errors"]?.value
                    }
                } />
            </Form.Text>
            }
            {task.status === "RUNNING" && <>
                {' '}<Button size="sm" variant="light" onClick={() => cancelTask(task.id)} ><FontAwesomeIcon icon={faStopCircle} color="red" /> {i18n.t('common.action.cancel')} </Button>
            </>}
            {this.state.showLog ? <>
                <Button size="sm" variant="light" onClick={() => this.setState({ showLog: false })}><FontAwesomeIcon icon={faChevronCircleUp} /> {i18n.t('event.log.hide-log')}</Button>
                <Logs taskID={this.taskID(this.props)} />
            </> : <Button size="sm" variant="light" onClick={() => this.setState({ showLog: true })}><FontAwesomeIcon icon={faChevronCircleDown} /> {i18n.t('event.log.show-log')}</Button>}
        </>;
    }
}
SnapshotEstimation.contextType = UIPreferencesContext