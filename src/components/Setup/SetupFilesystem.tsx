import Row from 'react-bootstrap/Row';
import { WithControls } from "./WithControls";
import { makeRequiredField } from "src/forms/RequiredFieldHook";
import { Provider } from './Providers';

export const SetupFilesystem: React.FC<{ provider: Provider }> = ({ provider }) => {
    const pathField = makeRequiredField("Directory Path", "path");
    const fields = [pathField];

    const validate: () => boolean = () => {
        return pathField.isValid;
    }

    return <WithControls provider={provider} additionalValidate={validate} fields={fields}>
        <Row>
            {pathField.render({ autoFocus: true, placeholder: "enter directory path where you want to store repository files" })}
        </Row>
    </WithControls>;
}