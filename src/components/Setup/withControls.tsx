import { FormEvent, ReactNode } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export const WithControls: React.FC<{ validate: () => boolean, children: ReactNode | undefined }> = ({ validate, children }) => {
    const navigate = useNavigate();

    const verifyStorage = (event: FormEvent) => {
        event.preventDefault();

        console.log("Verify storage");

        if (!validate()) {
            console.error("Validation failed");
            return;
        }

        console.log("Validation succeeded");
    };

    return <Form onSubmit={verifyStorage}>
        {children}
        <hr />
        <Button data-testid='back-button' variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        &nbsp;
        <Button variant="primary" type="submit" data-testid="submit-button">Next</Button>
    </Form>;
}