import { faCopy, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import PropTypes from "prop-types";

export function CLIEquivalent(props) {
  let [visible, setVisible] = useState(false);
  let [cliInfo, setCLIInfo] = useState({});

  if (visible && !cliInfo.executable) {
    axios
      .get("/api/v1/cli")
      .then((result) => {
        setCLIInfo(result.data);
      })
      .catch((_error) => {});
  }

  const ref = React.createRef();

  function copyToClibopard() {
    const el = ref.current;
    if (!el) {
      return;
    }

    el.select();
    el.setSelectionRange(0, 99999);

    document.execCommand("copy");
  }

  return (
    <>
      <InputGroup size="sm">
        <Button
          data-testid="show-cli-button"
          size="sm"
          title="Click to show CLI equivalent"
          variant="submit"
          onClick={() => setVisible(!visible)}
        >
          <FontAwesomeIcon size="sm" icon={faTerminal} />
        </Button>
        {visible && (
          <Button size="sm" variant="success" title="Copy to clipboard" onClick={copyToClibopard}>
            <FontAwesomeIcon size="sm" icon={faCopy} />
          </Button>
        )}
        {visible && (
          <FormControl
            size="sm"
            ref={ref}
            className="cli-equivalent"
            readOnly={true}
            value={`${cliInfo.executable} ${props.command}`}
          />
        )}
      </InputGroup>
    </>
  );
}

CLIEquivalent.propTypes = {
  command: PropTypes.string.isRequired,
};
