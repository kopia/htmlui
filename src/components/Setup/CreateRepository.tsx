import { faAngleDoubleDown, faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons';
import { FormField, makeRequiredField } from "@kopia/forms";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { Provider } from "./Providers";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Collapse from 'react-bootstrap/Collapse';
import Spinner from "react-bootstrap/Spinner";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Algorithms, HashAlgorithm } from 'src/backend/ApiTypes';

const ToggleAdvancedButton: React.FC<{ state: [boolean, React.Dispatch<React.SetStateAction<boolean>>] }> = ({ state }) => {
    const [showAdvanced, setShowAdvanced] = state;

    const icon = showAdvanced ? faAngleDoubleUp : faAngleDoubleDown;
    const text = showAdvanced ? "Hide Advanced Options" : "Show Advanced Options";

    return <Button data-testid='advanced-options' onClick={() => setShowAdvanced(previous => !previous)}
        variant="secondary"
        aria-controls="advanced-options-div"
        aria-expanded={showAdvanced}
        size="sm">
        <FontAwesomeIcon icon={icon} style={{ marginRight: 4 }} />
        {text}
    </Button>;
}

export const CreateRepository: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string>();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [algorithms, setAlgorithms] = useState<Algorithms>();
    const [hashAlgorithm, setHashAlgorithm] = useState<string>();
    const [encryptionAlgorithm, setEncryptionAlgorithm] = useState<string>();
    const [splitterAlgorithm, setSplitterAlgorithm] = useState<string>();
    const [formatVersion, setFormatVersion] = useState("");

    const passwordField = makeRequiredField("Repository Password", "password", "Used to encrypt the repository's contents");
    const confirmPasswordField = makeRequiredField("Confirm Repository Password", "confirmPassword", undefined, undefined, (value, requiredFullfilled) => {
        if (requiredFullfilled !== true) {
            return requiredFullfilled;
        }
        if (passwordField.value !== value) {
            return "Passwords do not match";
        }
        return true;
    });
    // Although they are required, they are only required if the showAdvanced is true
    const usernameField = makeRequiredField("Username", "username", "Override this when restoring a snapshot taken by another user");
    const hostnameField = makeRequiredField("Hostname", "hostname", "Override this when restoring a snapshot taken on another machine")

    useEffect(() => {
        (async () => {
            const result = await axios.get<Algorithms>('/api/v1/repo/algorithms');

            setAlgorithms(result.data);

            setHashAlgorithm(result.data.defaultHash);
            setEncryptionAlgorithm(result.data.defaultEncryption);
            setSplitterAlgorithm(result.data.defaultSplitter);
        })();
    }, []);

    if (!location.state) {
        navigate("..");
        return <>Redirecting...</>;
    }

    const storage = location.state;

    const createRepository = (event: FormEvent) => {
        event.preventDefault();

        const passwordValid = passwordField.isValid && confirmPasswordField.isValid;
        const valid2 = (!showAdvanced || (usernameField.isValid && hostnameField.isValid));

        if (!passwordValid) {
            setError("Passwords do not match");
            return;
        }

        if (!valid2) {
            console.warn("Validation failed");
            return;
        }

        const request = {
            storage,
            password: passwordField.value,
            options: {
                blockFormat: {
                    version: parseInt(formatVersion),
                    hash: hashAlgorithm,
                    encryption: encryptionAlgorithm,
                },
                objectFormat: {
                    splitter: splitterAlgorithm,
                },
            },
        }

        console.log("Verify storage", request);
    };

    if (!algorithms) {
        return <Spinner animation="border" variant="primary" />;
    }

    return <Form onSubmit={createRepository}>
        <h3>Create New Repository</h3>
        <p>Enter a strong password to create Kopia repository in the provided storage.</p>
        <Row>
            {passwordField.render({ autoFocus: true, type: "password", placeholder: "enter repository password" })}
            {confirmPasswordField.render({ type: "password", placeholder: "enter repository password again" })}
        </Row>
        <div style={{ marginTop: "1rem" }}>
            <ToggleAdvancedButton state={[showAdvanced, setShowAdvanced]} />
        </div>
        <Collapse in={showAdvanced}>
            <div id="advanced-options-div" style={{ marginTop: "1rem" }}>
                <Row>
                    <Form.Group as={Col}>
                        <Form.Label className="required">Encryption</Form.Label>
                        <Form.Control as="select"
                            name="encryption"
                            onChange={e => setEncryptionAlgorithm(e.target.value)}
                            data-testid="control-encryption"
                            defaultValue={algorithms.defaultEncryption}>
                            {algorithms.encryption.map(algorithm => <option key={algorithm.id} value={algorithm.id}>{algorithm.id}</option>)}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label className="required">Hash Algorithm</Form.Label>
                        <Form.Control as="select"
                            name="hash"
                            onChange={e => setHashAlgorithm(e.target.value)}
                            data-testid="control-hash"
                            defaultValue={algorithms.defaultHash}>
                            {algorithms.hash.map(algorithm => <option key={algorithm.id} value={algorithm.id}>{algorithm.id}</option>)}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label className="required">Splitter</Form.Label>
                        <Form.Control as="select"
                            name="splitter"
                            onChange={e => setSplitterAlgorithm(e.target.value)}
                            data-testid="control-splitter"
                            defaultValue={algorithms.defaultSplitter}>
                            {algorithms.splitter.map(algorithm => <option key={algorithm.id} value={algorithm.id}>{algorithm.id}</option>)}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label className="required">Repository Format</Form.Label>
                        <Form.Control as="select"
                            name="formatVersion"
                            onChange={e => setFormatVersion(e.target.value)}
                            data-testid="control-formatVersion"
                            defaultValue={formatVersion}>
                            <option value="2">Latest format</option>
                            <option value="1">Legacy format compatible with v0.8</option>
                        </Form.Control>
                    </Form.Group>
                </Row>
                <Row>
                    {usernameField.render({})}
                    {hostnameField.render({})}
                </Row>
                <Row style={{ marginTop: "1rem" }}>
                    <Form.Group as={Col}>
                        <Form.Text>Additional parameters can be set when creating repository using command line.</Form.Text>
                    </Form.Group>
                </Row>
            </div>
        </Collapse>
        {error && <Row>
            <Form.Group as={Col}>
                <Form.Text className="error">Error: {error}</Form.Text>
            </Form.Group>
        </Row>}
        <hr />
        <Button data-testid='back-button' variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        &nbsp;
        <Button variant="success" type="submit" data-testid="submit-button">Create Repository</Button>
    </Form>;
}