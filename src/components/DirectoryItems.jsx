import React, { Component } from 'react';
import { Link } from "react-router-dom";
import KopiaTable from '../utils/KopiaTable';
import { objectLink, rfc3339TimestampForDisplay, sizeWithFailures } from '../utils/uiutil';
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';

function objectName(name, typeID) {
    if (typeID === "d") {
        return name + "/";
    }

    return name
}

function sizeInfo(item) {
    if (item.size) {
        return item.size;
    }

    if (item.summ && item.summ.size) {
        return item.summ.size;
    }

    return 0;
}

function directoryLinkOrDownload(x, state) {
    if (x.obj.startsWith("k")) {
        return <Link to={objectLink(x.obj, x.name, state)}>{objectName(x.name, x.type)}</Link>;
    }

    return <a href={"/api/v1/objects/" + x.obj + "?fname=" + encodeURIComponent(x.name)}>{x.name}</a>;
}

export class DirectoryItems extends Component {
    render() {
        const { bytesStringBase2 } = this.context;
        const columns = [{
            id: "name",
            Header: 'Name',
            width: "",
            accessor: x => directoryLinkOrDownload(x, this.props.historyState),
        }, {
            id: "mtime",
            accessor: "mtime",
            Header: "Last Modification",
            width: 200,
            Cell: x => rfc3339TimestampForDisplay(x.cell.value),
        }, {
            id: "size",
            accessor: x => sizeInfo(x),
            Header: "Size",
            width: 100,
            Cell: x => sizeWithFailures(x.cell.value, x.row.original.summ, bytesStringBase2),
        }, {
            id: "files",
            accessor: "summ.files",
            Header: "Files",
            width: 100,
        }, {
            id: "dirs",
            accessor: "summ.dirs",
            Header: "Directories",
            width: 100,
        }]

        return <KopiaTable data={this.props.items} columns={columns} />;
    }
}
DirectoryItems.contextType = UIPreferencesContext