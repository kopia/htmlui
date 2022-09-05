import { FormField } from "@kopia/forms";
import { FormEvent, ReactNode, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Provider } from "./Providers";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import axios from 'axios';

export const WithControls: React.FC<{ provider: Provider, fields: FormField[], additionalValidate?: () => boolean, verifyExists?: () => boolean, children?: ReactNode }> = ({ provider, fields, additionalValidate: validate, verifyExists, children }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [connectError, setConnectError] = useState<string>();

    const verifyStorage = async (event: FormEvent) => {
        event.preventDefault();

        console.log("Verify storage");

        if (!fields.every(field => field.isValid) || (validate && !validate())) {
            console.warn("Input validation failed");
            return;
        }

        if (provider.isInternal === false) {
            const configuration = fields.reduce((state, field) => { state[field.name] = field.value; return state; }, {} as Record<string, string>);
            const storage = { type: provider.name, config: configuration };

            console.log("Verify storage state", configuration);
            setIsLoading(true);
            try {
                await axios.post('/api/v1/repo/exists', { storage });
                setIsLoading(false);
                navigate("../confirm", { state: { storage } });
                // TODO:
                /*
                this.setState({
                // verified and exists
                storageVerified: true,
                confirmCreate: false,
                isLoading: false,
                providerSettings: ed.state,
            });
                */
            } catch (error: any) {
                console.error("Exists", error);
                setIsLoading(false);
                if (error.response.data && error.response.data.code) {
                    if (error.response.data.code === "NOT_INITIALIZED") {
                        setConnectError(undefined);
                        console.log("Not initialized");
                        navigate("../create", { state: { storage } });

                        /* TODO
                        this.setState({
                            // verified and does not exist
                            confirmCreate: true,
                            storageVerified: true,
                            providerSettings: ed.state,
                            connectError: null,
                        });
                        */
                    } else {
                        setConnectError(`${error.response.data.code}: ${error.response.data.error}`);
                    }
                } else {
                    setConnectError(error.message);
                }
            }
            return;
        }

        console.log("Validation succeeded");
    };

    const heading = provider.isInternal
        ? (provider.name === '_token' ? "Enter Repository Token" : "Kopia Server Parameters")
        : "Storage Configuration";

    return <Form onSubmit={verifyStorage}>
        <h3>{heading}</h3>
        {children}
        {connectError && <Row>
            <Form.Group as={Col}>
                <Form.Text className="error">Connect Error: {connectError}</Form.Text>
            </Form.Group>
        </Row>}
        <hr />
        <Button data-testid='back-button' variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        &nbsp;
        <Button variant="primary" type="submit" data-testid="submit-button">Next</Button>
        {isLoading && <Spinner animation="border" variant="primary" />}
    </Form>;
}