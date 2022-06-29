import { Button } from "react-bootstrap";

export function withControls(wrappedComponent: () => JSX.Element): () => JSX.Element {
    return () => <>
        {wrappedComponent()}
        <hr />
        <Button data-testid='back-button' variant="secondary" onClick={window.history.back}>Back</Button>
        &nbsp;
        <Button variant="primary" type="submit" data-testid="submit-button">Next</Button>
    </>;
}