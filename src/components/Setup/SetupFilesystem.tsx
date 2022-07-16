import Row from 'react-bootstrap/Row';
import { WithControls } from "./WithControls";
import { makeRequiredField } from "src/forms/RequiredFieldHook";

export function SetupFilesystem() {
    const pathField = makeRequiredField("Directory Path", "path");

    const validate: () => boolean = () => {
        return pathField.isValid;
    }

    return <WithControls validate={validate}>
        <Row>
            {pathField.render({autoFocus: true, placeholder: "enter directory path where you want to store repository files" })}
        </Row>
    </WithControls>;
}