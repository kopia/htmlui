import React from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory, useLocation } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export function DirectoryBreadcrumbs() {
    const location = useLocation();
    const history = useHistory();

    const breadcrumbs = []
    for (let state = location.state; state; state = state.prevState) {
        breadcrumbs.unshift(state)
    }

    // TODO: get name of "snapshot"!!?? #####
    // TODO: no tooltip if no OID #####
    // TODO: enable copying of OID to clipboard #####
    // TODO: disable / improve wrapping of tooltip #####
    // TODO: there is some flickering if hovering changes #####
    // TODO: disable clicking on current breadcrumb item #####
    return (
        <Breadcrumb>
            <Breadcrumb.Item size="sm" variant="secondary" onClick={history.goBack}>Snapshots #####</Breadcrumb.Item>
            {
                breadcrumbs.map((state, i) => {
                    const index = breadcrumbs.length - i - 1 // revert index
                    return (
                        <OverlayTrigger key={index} placement="top" overlay={<Tooltip>OID: {state.oid}</Tooltip>}>
                            <Breadcrumb.Item size="sm" variant="outline-secondary"
                                             onClick={() => history.go(-index)}
                                             active={!index}>
                                {state.label}
                            </Breadcrumb.Item>
                        </OverlayTrigger>
                    );
                })
            }
        </Breadcrumb>
    )
}
