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

    // TODO: enable copying of OID to clipboard #####
    return (
        <Breadcrumb>
            {
                breadcrumbs.map((state, i) => {
                    const index = breadcrumbs.length - i - 1 // revert index
                    let item = <Breadcrumb.Item key={index} size="sm" variant="outline-secondary"
                                                onClick={() => {
                                                    if (index) history.go(-index);
                                                }}
                                                active={!index}>
                        {state.label}
                    </Breadcrumb.Item>;
                    return (
                        state.oid
                            ? <OverlayTrigger key={index} placement="top" overlay={<Tooltip className={"wide-tooltip"}>OID: {state.oid}</Tooltip>}>
                                {item}
                            </OverlayTrigger>
                            : item
                    );
                })
            }
        </Breadcrumb>
    )
}
