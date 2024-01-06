import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Col } from 'react-bootstrap';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { stateProperty } from '.';

export function RequiredDirectory(component, label, name, props = {}, helpText = null) {
    let { onDirectorySelected, ...inputProps } = props;
    if (!window.kopiaUI) {
        return <>
            <Form.Label className="required">{label}</Form.Label>
            <InputGroup as={Col}>
                <Form.Control name={name} size="sm" isInvalid={stateProperty(component, name, null) === ''}
                    onChange={component.handleChange}
                    value={stateProperty(component, name)}{...inputProps} /></InputGroup>
        </>
    }
    return <>
        <Form.Label htmlFor='directoryInput' className="required">{label}</Form.Label>
        <InputGroup as={Col}>
            <FormControl name={name} size="sm" id='directoryInput'
                isInvalid={stateProperty(component, name, null) === ''}
                value={stateProperty(component, name)}
                onChange={component.handleChange}{...inputProps}></FormControl>

            <Button size="sm" onClick={() => window.kopiaUI.selectDirectory(onDirectorySelected)}>
                <FontAwesomeIcon icon={faFolderOpen} />
            </Button>

            {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
            <Form.Control.Feedback type="invalid">Required field</Form.Control.Feedback>
        </InputGroup>
    </>
}