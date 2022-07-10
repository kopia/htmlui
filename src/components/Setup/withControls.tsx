import { Button } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";

export function WithControls(): JSX.Element {
    const navigate = useNavigate();
    
    return <>
        <Outlet />
        <hr />
        <Button data-testid='back-button' variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        &nbsp;
        <Button variant="primary" type="submit" data-testid="submit-button">Next</Button>
    </>;
}