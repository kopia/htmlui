
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import moment from 'moment';
import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import KopiaTable from '../utils/KopiaTable';
import { Link } from 'react-router-dom';
import { redirect, taskStatusSymbol } from '../utils/uiutil';
import { useTranslation } from "react-i18next";
import { useState, useLayoutEffect, useCallback } from 'react';

export function Tasks() {
    const [isLoading, setIsLoading] = useState(false);
    const [searchDescription, setDescription] = useState("")
    const [response, setResponse] = useState({ items: [], kinds: [] });
    const [kind, setKind] = useState("All");
    const [status, setStatus] = useState("All");
    const [error, setError] = useState();
    const { t } = useTranslation();

    const fetchTasks = useCallback(() => {
        axios.get('/api/v1/tasks').then(result => {
            setIsLoading(false);
            setResponse({ items: result.data.tasks, kinds: getUniqueKinds(result.data.tasks) });
        }).catch(error => {
            redirect(error);
            setError(error);
            setIsLoading(false);
        });
    }, [])

    useLayoutEffect(() => {
        setIsLoading(true)
        fetchTasks()
        let interval = setInterval(fetchTasks, 5000)
        return () => {
            window.clearInterval(interval);
        };
    }, [fetchTasks]);

    function getUniqueKinds(tasks) {
        let o = {};

        for (const tsk of tasks) {
            o[tsk.kind] = true;
        }

        let result = [];
        for (const kind in o) {
            result.push(kind);
        }

        return result;
    }

    function handleDescription(desc) {
        setDescription(desc.target.value)
    }

    function taskMatches(t) {
        if (kind !== "All" && t.kind !== kind) {
            return false;
        }

        if (status !== "All" && t.status.toLowerCase() !== status.toLowerCase()) {
            return false;
        }

        if (searchDescription && t.description.indexOf(searchDescription) < 0) {
            return false;
        }

        return true
    }

    function filterItems(items) {
        return items.filter(c => taskMatches(c))
    }

    if (error) {
        return <p>{error.message}</p>;
    }
    if (isLoading) {
        return <p>{t('common.label.loading')}</p>;
    }

    const columns = [{
        Header: t('feedback.task.table.header-start-time'),
        width: 160,
        accessor: x => <Link to={'/tasks/' + x.id} title={moment(x.startTime).toLocaleString()}>
            {moment(x.startTime).fromNow()}
        </Link>
    }, {
        Header: t('feedback.task.table.header-status'),
        width: 240,
        accessor: x => taskStatusSymbol(x),
    }, {
        Header: t('feedback.task.table.header-kind'),
        width: "",
        accessor: x => <p>{x.kind}</p>,
    }, {
        Header: t('feedback.task.table.header-description'),
        width: "",
        accessor: x => <p>{x.description}</p>,
    }]

    const filteredItems = filterItems(response.items)
    return (
        <>
            <Form>
                <div className="list-actions">
                    <Row>
                        <Col xs="auto">
                            <Dropdown>
                                <Dropdown.Toggle size="sm" variant="primary">{t('feedback.task.table.header-status')}: {status}</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setStatus("All")}>{t('event.task.select.task-all')}</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={() => setStatus("Running")}>{t('event.task.select.task-running')}</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setStatus("Failed")}>{t('event.task.select.task-failed')}</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        <Col xs="auto">
                            <Dropdown>
                                <Dropdown.Toggle size="sm" variant="primary">{t('feedback.task.table.header-kind')}: {kind}</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setKind("All")}>{t('event.task.select.task-all')}</Dropdown.Item>
                                    <Dropdown.Divider />
                                    {response.kinds.map(kind => <Dropdown.Item key={kind} onClick={() => setKind(kind)}>{kind}</Dropdown.Item>)}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        <Col xs="4">
                            <Form.Control size="sm" type="text" name="searchDescription" placeholder={t('feedback.task.search-tasks-by-hint')} value={searchDescription} onChange={handleDescription} autoFocus={true} />
                        </Col>
                    </Row>
                </div>
                <Row>
                    <Col>
                        {!response.items.length ?
                            <Alert variant="info">
                                <FontAwesomeIcon size="sm" icon={faInfoCircle} /> {t('feedback.task.no-tasks-help')}
                            </Alert> : <KopiaTable data={filteredItems} columns={columns} />}
                    </Col>
                </Row>
            </Form>
        </>);
}
