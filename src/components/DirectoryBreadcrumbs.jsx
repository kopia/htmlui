import React from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useHistory, useLocation } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export function DirectoryBreadcrumbs() {
    const location = useLocation();
    const history = useHistory();

    const breadcrumbs = []
    for (let state = location.state; state; state = state.prevState) {
        breadcrumbs.unshift(state)
    }

    return (
        <Breadcrumb>
            {
                breadcrumbs.map((state, i) => {
                    const index = breadcrumbs.length - i - 1 // revert index
                    return <Breadcrumb.Item key={index} size="sm" variant="outline-secondary"
                        onClick={() => {
                            if (index) history.go(-index);
                        }}
                        active={!index}>
                        {state.label}
                        {state.oid && !index && <>&nbsp;<OverlayTrigger placement="top"
                            trigger="click"
                            overlay={<Tooltip
                                className={"wide-tooltip"}>OID: {state.oid}</Tooltip>}
                        >
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </OverlayTrigger></>}
                    </Breadcrumb.Item>;
                })
            }
        </Breadcrumb>
    )
}
