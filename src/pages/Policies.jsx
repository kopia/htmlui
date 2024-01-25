import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { Component } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import { handleChange } from '../forms';
import { OptionalDirectory } from '../forms/OptionalDirectory'
import KopiaTable from '../utils/KopiaTable';
import { CLIEquivalent, compare, isAbsolutePath, ownerName, policyEditorURL, redirect } from '../utils/uiutil';

const applicablePolicies = "Applicable Policies"
const localPolicies = "Local Path Policies"
const allPolicies = "All Policies"
const globalPolicy = "Global Policy"
const perUserPolicies = "Per-User Policies"
const perHostPolicies = "Per-Host Policies"

export class Policies extends Component {
    constructor() {
        super();
        this.state = {
            policies: [],
            isLoading: false,
            error: null,
            editorTarget: null,
            selectedOwner: applicablePolicies,
            policyPath: "",
            sources: [],
        };

        this.editPolicyForPath = this.editPolicyForPath.bind(this);
        this.handleChange = handleChange.bind(this);
        this.fetchPolicies = this.fetchPolicies.bind(this);
        this.fetchSourcesWithoutSpinner = this.fetchSourcesWithoutSpinner.bind(this);
    }

    componentDidMount() {
        this.setState({
            isLoading: true,
        });

        this.fetchPolicies();
        this.fetchSourcesWithoutSpinner();
    }

    sync() {
        this.fetchPolicies();

        axios.post('/api/v1/repo/sync', {}).then(result => {
            this.fetchSourcesWithoutSpinner();
        }).catch(error => {
            this.setState({
                error,
                isLoading: false
            });
        });
    }

    fetchPolicies() {
        axios.get('/api/v1/policies').then(result => {
            this.setState({
                policies: result.data.policies,
                isLoading: false,
            });
        }).catch(error => {
            redirect(error);
            this.setState({
                error,
                isLoading: false
            });
        });
    }

    fetchSourcesWithoutSpinner() {
        axios.get('/api/v1/sources').then(result => {
            this.setState({
                localSourceName: result.data.localUsername + "@" + result.data.localHost,
                localUsername: result.data.localUsername,
                localHost: result.data.localHost,
                multiUser: result.data.multiUser,
                sources: result.data.sources,
                isLoading: false,
            });
        }).catch(error => {
            redirect(error);
            this.setState({
                error,
                isLoading: false
            });
        });
    }

    editPolicyForPath(e) {
        e.preventDefault();

        if (!this.state.policyPath) {
            return;
        }

        if (!isAbsolutePath(this.state.policyPath)) {
            alert("Policies can only be defined for absolute paths.");
            return;
        }

        this.props.history.push(policyEditorURL({
            userName: this.state.localUsername,
            host: this.state.localHost,
            path: this.state.policyPath,
        }));
    }

    selectOwner(h) {
        this.setState({
            selectedOwner: h,
        });
    }

    policySummary(policies) {
        let bits = [];
        /**
         * Check if the object is empty
         * @param {*} obj 
         * @returns true if the object is empty
         */
        function isEmptyObject(obj) {
            return (
                Object.getPrototypeOf(obj) === Object.prototype &&
                Object.getOwnPropertyNames(obj).length === 0 &&
                Object.getOwnPropertySymbols(obj).length === 0
            );
        }
        /**
         * Check if object has it's key as a property.
         * However, if the object itself is a set of sets, it has to be checked by isEmptyObject()
         * @param {*} obj 
         * @returns 
         */
        function isEmpty(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key))
                    return isEmptyObject(obj[key]);
            }
            return true;
        }
        for (let pol in policies.policy) {
            if (!isEmpty(policies.policy[pol])) {
                bits.push(<Badge bg="policy-badge" key={pol}>{pol}</Badge>);
            }
        }
        return bits;
    }

    isGlobalPolicy(x) {
        return !x.target.userName && !x.target.host && !x.target.path;
    }

    isLocalHostPolicy(x) {
        return !x.target.userName && x.target.host === this.state.localHost && !x.target.path;
    }

    isLocalUserPolicy(x) {
        return ownerName(x.target) === this.state.localSourceName;
    }

    render() {
        let { policies, sources, isLoading, error } = this.state;
        if (error) {
            return <p>{error.message}</p>;
        }
        if (isLoading) {
            return <p>Loading ...</p>;
        }

        let uniqueOwners = sources.reduce((a, d) => {
            const owner = ownerName(d.source);

            if (!a.includes(owner)) { a.push(owner); }
            return a;
        }, []);

        uniqueOwners.sort();

        switch (this.state.selectedOwner) {
            case allPolicies:
                // do nothing;
                break;

            case globalPolicy:
                policies = policies.filter(x => this.isGlobalPolicy(x));
                break;

            case localPolicies:
                policies = policies.filter(x => this.isLocalUserPolicy(x));
                break;

            case applicablePolicies:
                policies = policies.filter(x => this.isLocalUserPolicy(x) || this.isLocalHostPolicy(x) || this.isGlobalPolicy(x));
                break;

            case perUserPolicies:
                policies = policies.filter(x => !!x.target.userName && !!x.target.host && !x.target.path);
                break;

            case perHostPolicies:
                policies = policies.filter(x => !x.target.userName && !!x.target.host && !x.target.path);
                break;

            default:
                policies = policies.filter(x => ownerName(x.target) === this.state.selectedOwner);
                break;
        };

        policies.sort((l, r) => {
            const hc = compare(l.target.host, r.target.host);
            if (hc) {
                return hc;
            }
            const uc = compare(l.target.userName, r.target.userName);
            if (uc) {
                return uc;
            }
            return compare(l.target.path, r.target.path);
        });


        const columns = [{
            Header: 'Username',
            width: 100,
            accessor: x => x.target.userName || "*",
        }, {
            Header: 'Host',
            width: 100,
            accessor: x => x.target.host || "*",
        }, {
            Header: 'Path',
            accessor: x => x.target.path || "*",
        }, {
            Header: 'Defined',
            accessor: x => this.policySummary(x),
        }, {
            id: 'edit',
            Header: 'Actions',
            width: 50,
            Cell: x => <Button data-testid="edit-policy" as={Link} to={policyEditorURL(x.row.original.target)} variant="primary" size="sm">Edit</Button>
        }]

        return <>
            {!this.state.editorTarget && <div className="list-actions">
                <Form onSubmit={this.editPolicyForPath}>
                    <Row>
                        <Col xs="auto">
                            <Dropdown>
                                <Dropdown.Toggle size="sm" variant="primary" id="dropdown-basic">
                                    <FontAwesomeIcon icon={faUserFriends} />&nbsp;{this.state.selectedOwner}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => this.selectOwner(applicablePolicies)}>{applicablePolicies}</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.selectOwner(localPolicies)}>{localPolicies}</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.selectOwner(allPolicies)}>{allPolicies}</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={() => this.selectOwner(globalPolicy)}>{globalPolicy}</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.selectOwner(perUserPolicies)}>{perUserPolicies}</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.selectOwner(perHostPolicies)}>{perHostPolicies}</Dropdown.Item>
                                    <Dropdown.Divider />
                                    {uniqueOwners.map(v => <Dropdown.Item key={v} onClick={() => this.selectOwner(v)}>{v}</Dropdown.Item>)}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        {(this.state.selectedOwner === localPolicies || this.state.selectedOwner === this.state.localSourceName || this.state.selectedOwner === applicablePolicies) ? <>
                            <Col>
                                {OptionalDirectory(this, null, "policyPath", { autoFocus: true, placeholder: "enter directory to find or set policy" })}
                            </Col>
                            <Col xs="auto">
                                <Button disabled={!this.state.policyPath} size="sm" type="submit" onClick={this.editPolicyForPath}>Set Policy</Button>
                            </Col>
                        </> : <Col />}
                    </Row>
                </Form>
            </div>}

            {policies.length > 0 ? <div>
                <p>Found {policies.length} policies matching criteria.</p>
                <KopiaTable data={policies} columns={columns} />
            </div> : ((this.state.selectedOwner === localPolicies && this.state.policyPath) ? <p>
                No policy found for directory <code>{this.state.policyPath}</code>. Click <b>Set Policy</b> to define it.
            </p> : <p>No policies found.</p>)}
            <CLIEquivalent command="policy list" />
        </>;
    }
}