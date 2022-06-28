import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';


export function DirectorySelector(props: { onDirectorySelected: (selectedPath: string) => void; } & any) {
    const { onDirectorySelected, ...inputProps } = props;

    if (!window.kopiaUI) {
        return <Form.Control size="sm" {...inputProps} />;
    }

    return <InputGroup>
        <FormControl size="sm" {...inputProps} />
        <Button size="sm" onClick={() => window.kopiaUI!.selectDirectory(onDirectorySelected)}>
            <FontAwesomeIcon icon={faFolderOpen} />
        </Button>
    </InputGroup>;
}
