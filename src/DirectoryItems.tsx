import { useMemo } from 'react';
import { Link } from "react-router-dom";
import { CellProps, Column, } from 'react-table';
import { Backend } from '@kopia/backend';
import MyTable from './Table';
import { FsSize, Rfc3339Timestamp, objectLink } from '@kopia/utils';

function objectName(name: string | undefined, typeID: string | undefined): string | undefined {
    if (typeID === "d") {
        return name + "/";
    }

    return name;
}

function getDirectorySize(directoryEntry: Backend.DirectoryEntry): number {
    if (directoryEntry.size) {
        return directoryEntry.size;
    }

    if (directoryEntry.summ && directoryEntry.summ.size) {
        return directoryEntry.summ.size;
    }

    return 0;
}

function DirectoryLinkOrDownload(props: { entry: Backend.DirectoryEntry }) {
    const { entry } = props;

    if (entry.obj && entry.obj.startsWith("k")) {
        return <Link to={objectLink(entry.obj)}>{objectName(entry.name, entry.type)}</Link>;
    }

    return <a href={"/api/v1/objects/" + entry.obj + "?fname=" + encodeURIComponent(entry.name!/* TODO: Why is this used as if it cannot be null? */)}>{entry.name}</a>;
}

export function DirectoryItems(props: { items: Backend.DirectoryEntry[] }) {
    const columns: Column<Backend.DirectoryEntry>[] = useMemo(() => [
        {
            id: "name",
            Header: 'Name',
            width: "",
            accessor: entry => <DirectoryLinkOrDownload entry={entry} />,
        }, {
            id: "mtime",
            accessor: "mtime",
            Header: "Last Modification",
            width: 200,
            Cell: ({ cell: { value } }) => <Rfc3339Timestamp timestamp={value} />,
        }, {
            id: "size",
            accessor: x => getDirectorySize(x),
            Header: "Size",
            width: 100,
            Cell: (cell: CellProps<Backend.DirectoryEntry, number>) => <FsSize size={cell.cell.value} summary={cell.row.original.summ} />,
        }, {
            id: "files",
            accessor: entry => entry.summ?.files,
            Header: "Files",
            width: 100,
        }, {
            id: "dirs",
            accessor: entry => entry.summ?.dirs,
            Header: "Directories",
            width: 100,
        }], []);

    return <MyTable data={props.items} columns={columns} />;
}
