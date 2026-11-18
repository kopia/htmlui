import { faCopy, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import PropTypes from "prop-types";
import i18n from "../utils/i18n";

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

  const ref = useRef(null);

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
          title={i18n.t("common:cli.show")}
          variant="submit"
          onClick={() => setVisible(!visible)}
        >
          <FontAwesomeIcon size="sm" icon={faTerminal} />
        </Button>
        {visible && (
          <Button size="sm" variant="success" title={i18n.t("common:cli.copy")} onClick={copyToClibopard}>
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
