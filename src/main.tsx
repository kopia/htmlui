import { createRoot } from 'react-dom/client';
import { App } from './App';
import './main.css';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import { NewSnapshot } from './NewSnapshot';
import { SnapshotsTable } from './SnapshotsTable';
import { DirectoryObject } from './DirectoryObject';
import { BeginRestore } from './BeginRestore';
import { SourcesTable } from './SourcesTable';
import { PolicyEditorPage } from './PolicyEditorPage';
import { TaskDetails } from './TaskDetails';
import { PoliciesTable } from './PoliciesTable';
import { TasksTable } from './TasksTable';
import { RepoStatus } from './RepoStatus';
import { SetupPage } from './components/Setup/SetupPage';
import { getDefaultTheme } from './contexts/UIPreferencesContext';
import { supportedProviders } from './components/Setup/Providers';
import { WithControls } from './components/Setup/WithControls';
import { ProviderSelection } from './components/Setup/ProviderSelection';

const h = document.querySelector("html")!;
h.className = getDefaultTheme();

const root = createRoot(document.getElementById('root')!);
root.render(<>
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route path="snapshots/new" element={<NewSnapshot />} />
                <Route path="snapshots/single-source/" element={<SnapshotsTable />} />
                <Route path="snapshots/dir/:oid/restore" element={<BeginRestore />} />
                <Route path="snapshots/dir/:oid" element={<DirectoryObject />} />
                <Route path="snapshots" element={<SourcesTable />} />
                <Route path="policies/edit/" element={<PolicyEditorPage />} />
                <Route path="policies" element={<PoliciesTable />} />
                <Route path="tasks/:tid" element={<TaskDetails />} />
                <Route path="tasks" element={<TasksTable />} />
                <Route path="repo" element={<RepoStatus />} />
            </Route>
            <Route path="/connect" element={<SetupPage />}>
                <Route index element={<ProviderSelection />} />
                <Route path='' element={<WithControls />}>
                    {supportedProviders.map(provider => <Route path={provider.name} element={<provider.component />} />)}
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
    <div id="appVersion">
        <hr />
        {REACT_APP_FULL_VERSION_INFO ? (
            <p className="version-info">Version {REACT_APP_FULL_VERSION_INFO}</p>
        ) : (
            <p className="version-info">No version</p>
        )}
    </div>
</>
);
