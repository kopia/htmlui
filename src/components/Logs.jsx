import axios from 'axios';
import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import { handleChange } from '../forms';
import { redirect } from '../utils/uiutil';

export class Logs extends Component {
    constructor() {
        super();
        this.state = {
            items: [],
            isLoading: false,
            error: null,
        };

        this.handleChange = handleChange.bind(this);
        this.fetchLog = this.fetchLog.bind(this);
        this.interval = window.setInterval(this.fetchLog, 3000);
        this.messagesEndRef = React.createRef();
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    componentDidMount() {
        this.setState({
            isLoading: true,
        });

        this.fetchLog();
        this.scrollToBottom();
    }

    componentWillUnmount() {
        window.clearInterval(this.interval);
    }

    lastMessage(l) {
        if (!l || !l.length) {
            return "";
        }

        return l[l.length - 1].msg;
    }

    fetchLog() {
        axios.get('/api/v1/tasks/' + this.props.taskID + "/logs").then(result => {
            let oldLogs = this.state.logs;
            this.setState({
                logs: result.data.logs,
                isLoading: false,
            });

            if (this.lastMessage(oldLogs) !== this.lastMessage(result.data.logs)) {
                this.scrollToBottom();
            }
        }).catch(error => {
            redirect(error);
            this.setState({
                error,
                isLoading: false
            });
        });
    }

    fullLogTime(x) {
        return new Date(x * 1000).toLocaleString();
    }

    formatLogTime(x) {
        const d = new Date(x * 1000);
        let result = "";

        result += ("0" + d.getHours()).substr(-2);
        result += ":";
        result += ("0" + d.getMinutes()).substr(-2);
        result += ":";
        result += ("0" + d.getSeconds()).substr(-2);
        result += ".";
        result += ("00" + d.getMilliseconds()).substr(-3)

        return result;
    }

    formatLogParams(entry) {
        // if there are any properties other than `msg, ts, level, mod` output them as JSON.
        let { msg, ts, level, mod, ...parametersOnly } = entry;

        const p = JSON.stringify(parametersOnly);
        if (p !== "{}") {
            return <code>{p}</code>;
        }

        return "";
    }

    scrollToBottom() {
        const c = this.messagesEndRef.current;
        if (c) {
            c.scrollIntoView({ behavior: 'smooth' })
        }
    }

    render() {
        const { logs, isLoading, error } = this.state;
        if (error) {
            return <p>{error.message}</p>;
        }
        if (isLoading) {
            return <p>Loading ...</p>;
        }

        if (logs) {
            return <div className="logs-table"><Table size="sm" bordered hover>
                <tbody>
                    {logs.map((v, ndx) => <tr key={ndx + '-' + v.ts} className={'loglevel-' + v.level}>
                        <td className="elide" title={this.fullLogTime(v.ts)}>{this.formatLogTime(v.ts)} {v.msg} {this.formatLogParams(v)}</td></tr>)}
                </tbody>
            </Table>
                <div ref={this.messagesEndRef} />
            </div>;
        }

        return null;
    }
}
