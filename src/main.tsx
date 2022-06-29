import { createRoot } from 'react-dom/client';
import { App } from './App';
import './main.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

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

const root = createRoot(document.getElementById('root')!);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route path="/snapshots/new" element={<NewSnapshot />} />
                <Route path="/snapshots/single-source/" element={<SnapshotsTable />} />
                <Route path="/snapshots/dir/:oid/restore" element={<BeginRestore />} />
                <Route path="/snapshots/dir/:oid" element={<DirectoryObject />} />
                <Route path="/snapshots" element={<SourcesTable />} />
                <Route path="/policies/edit/" element={<PolicyEditorPage />} />
                <Route path="/policies" element={<PoliciesTable />} />
                <Route path="/tasks/:tid" element={<TaskDetails />} />
                <Route path="/tasks" element={<TasksTable />} />
                <Route path="/repo" element={<RepoStatus />} />
            </Route>
        </Routes>
    </BrowserRouter>
);
