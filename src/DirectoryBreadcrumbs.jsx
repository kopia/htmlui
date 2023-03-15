import React from 'react';
import Button from 'react-bootstrap/Button';
import { useHistory, useLocation } from 'react-router-dom';
import { GoBackButton } from './uiutil';

export function DirectoryBreadcrumbs() {
    const location = useLocation();
    const history = useHistory();

    const breadcrumbs = []
    for (let state = location.state; state; state = state.prevState) {
        breadcrumbs.unshift(state)
    }

    return (<>
            {breadcrumbs.length >= 1 && <GoBackButton onClick={history.goBack}/>}
            {
                breadcrumbs.map((state, i) => {
                    const index = breadcrumbs.length - i - 1 // revert index
                    return (
                        <Button key={index} size="sm" variant="outline-secondary" onClick={() => history.go(-index)}
                                disabled={!index}>{state.label}</Button>
                    );
                })
            }
        </>
    )
}
