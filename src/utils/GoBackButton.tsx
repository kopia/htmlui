import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Button from 'react-bootstrap/Button';


export function GoBackButton(props: any) {
    return <Button size="sm" variant="outline-secondary" {...props}><FontAwesomeIcon icon={faChevronLeft} /> Return </Button>;
}
