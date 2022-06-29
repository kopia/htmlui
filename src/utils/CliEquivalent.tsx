import { faCopy, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

interface CliInfo {
    executable?: string
}

export function CliEquivalent(props: any) {
    let [visible, setVisible] = useState(false);
    let [cliInfo, setCliInfo] = useState<CliInfo>({});

    if (visible && !cliInfo.executable) {
        axios.get('/api/v1/cli').then(result => {
            setCliInfo(result.data);
        }).catch(error => { });
    }

    const ref = React.createRef<HTMLInputElement>();

    function copyToClibopard() {
        const el = ref.current;
        if (!el) {
            return;
        }

        el.select();
        el.setSelectionRange(0, 99999);

        document.execCommand("copy");
    }


    return <>
        <InputGroup size="sm">
            <Button size="sm" title="Click to show CLI equivalent" variant="warning" onClick={() => setVisible(!visible)}><FontAwesomeIcon size="sm" icon={faTerminal} /></Button>
            {visible && <Button size="sm" variant="outline-dark" title="Copy to clipboard" onClick={copyToClibopard}><FontAwesomeIcon size="sm" icon={faCopy} /></Button>}
            {visible && <FormControl size="sm" ref={ref} className="cli-equivalent" value={`${cliInfo.executable} ${props.command}`} />}
        </InputGroup>
    </>;
}
