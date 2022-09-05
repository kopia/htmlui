import { makeBooleanField, makeRequiredField } from "@kopia/forms";
import { FormEvent, useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Collapse from 'react-bootstrap/Collapse';
import Spinner from "react-bootstrap/Spinner";
import axios from 'axios';
import { Algorithms, CurrentUser } from 'src/backend/ApiTypes';
import { ToggleAdvancedButton } from "./ToggleAdvancedButton";

interface State {
    storage: {
        provider: string,
        config: unknown
    },
    clientOptions?: {
        username: string,
        hostname: string
    }
}

export const ConfirmConnect: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string>();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const passwordField = makeRequiredField("Repository Password", "password", "Used to encrypt the repository's contents");
    
    // Although they are required, they are only required if the showAdvanced is true
    const usernameField = makeRequiredField("Username", "username", "Override this when restoring a snapshot taken by another user");
    const hostnameField = makeRequiredField("Hostname", "hostname", "Override this when restoring a snapshot taken on another machine");
    const readonlyField = makeBooleanField("Connect in read-only mode", "readonly", "Read-only mode prevents any changes to the repository.");
    const descriptionField = makeRequiredField("Repository Description", "description", "Helps to distinguish between multiple connected repositories");

    useEffect(() => {
        if (!location.state) {
            navigate("..");
            return;
        }

        const state = location.state as State;

        if (state.clientOptions) {
            usernameField.setValue(state.clientOptions.username);
            hostnameField.setValue(state.clientOptions.hostname);
        }
    }, [location]);

    const state = location.state as State;
    console.log("State", state);

    const connectRepository = async (event: FormEvent) => {
        event.preventDefault();

        const passwordValid = passwordField.isValid;
        const valid2 = (!showAdvanced || (usernameField.isValid && hostnameField.isValid));

        if (!passwordValid) {
            setError("Passwords do not match");
            return;
        }

        if (!valid2) {
            console.warn("Validation failed");
            return;
        }

        const clientOptions = {
            username: usernameField.value,
            hostname: hostnameField.value,
            readonly: readonlyField.value === "true",
            description: descriptionField.value
        };

        const request = {
            storage: state.storage,
            clientOptions,
            password: passwordField.value
        };

        try {
            const createResult = await axios.post<any>('/api/v1/repo/connect', request);
            console.log("Repository created", createResult);
            navigate("/repo");
        }
        catch (e) {
            const error = e as any;
            if (error.response.data) {
                setError(error.response.data.code + ": " + error.response.data.error);
            }
        }
    };

    // if (!algorithms) {
    //     return <Spinner animation="border" variant="primary" />;
    // }

    return <Form onSubmit={connectRepository}>
        <h3>Confirm Connection</h3>
        <Row>
            <Form.Group as={Col}>
                <Form.Label className="required">Connect As</Form.Label>
                <Form.Control
                    value={`${usernameField.value}@${hostnameField.value}`}
                    readOnly={true}
                    size="sm" />
                <Form.Text className="text-muted">To override, click 'Show Advanced Options'</Form.Text>
            </Form.Group>
        </Row>
        <Row>
            {descriptionField.render({ autoFocus: state.storage.provider === "_token", placeholder: "enter repository description" })}
        </Row>
        <div style={{ marginTop: "1rem" }}>
            <ToggleAdvancedButton state={[showAdvanced, setShowAdvanced]} />
        </div>
        <Collapse in={showAdvanced}>
            <div id="advanced-options-div" className="advancedOptions">
                <Row>
                    {readonlyField.render({})}
                </Row>
                {usernameField.render({})}
                {hostnameField.render({})}
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
        <Button variant="success" type="submit" data-testid="submit-button">Connect To Repository</Button>
    </Form>;
}