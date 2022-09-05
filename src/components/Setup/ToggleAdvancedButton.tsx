import { faAngleDoubleDown, faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons';
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const ToggleAdvancedButton: React.FC<{ state: [boolean, React.Dispatch<React.SetStateAction<boolean>>] }> = ({ state }) => {
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
