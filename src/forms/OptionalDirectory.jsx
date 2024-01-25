import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Col, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { stateProperty } from '.';
import { setDeepStateProperty } from '../utils/deepstate';

/**
 * This functions returns a directory selector that allows the user to select a directory. 
 * The selections is invoked using a button that calls a functions within the electron app. 
 * If the electron app is not present, the button is not visible. 
 * 
 * @param {*} component
 * The component that this function is called from 
 * @param {string} label
 * Label, that is added before the input field 
 * @param {string} name
 * Name of the variable in which the directory path is stored 
 * @param {*} props
 * Additional properties of the component 
 * @returns The form group with the components
 */
export function OptionalDirectory(component, label, name, props = {}) {
    /**
     * Saves the selected path as a deepstate variable within the component
     * @param {The path that has been selected} path 
     */
    function onDirectorySelected(path) {
        setDeepStateProperty(component, name, path)
    }
    
    return <FormGroup>
        {label && <Form.Label htmlFor='directoryInput' className="required">{label}</Form.Label>}
        <InputGroup as={Col}>
            <FormControl
                id='directoryInput'
                size="sm"
                name={name}
                value={stateProperty(component, name)}
                data-testid={'control-' + name}
                onChange={component.handleChange}{...props}></FormControl>
            {window.kopiaUI &&
                <Button size="sm" onClick={() => window.kopiaUI.selectDirectory(onDirectorySelected)}>
                    <FontAwesomeIcon icon={faFolderOpen} />
                </Button>}
        </InputGroup>
    </FormGroup>
}