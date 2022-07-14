import { RequiredFieldHook } from "../../forms";
import { useState } from "react";
import Row from 'react-bootstrap/Row';
import { WithControls } from "./WithControls";

export function SetupFilesystem2() {
    const pathState = useState<string>();

    const validate: () => boolean = () => {
        console.log(pathState[0])
        return false;
    }

    return <WithControls validate={validate}>
        <Row>
            {RequiredFieldHook(pathState, "Directory Path", "path", { autoFocus: true, placeholder: "enter directory path where you want to store repository files" })}
        </Row>
    </WithControls>;
}