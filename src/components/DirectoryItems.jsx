import React from "react";
import { Link } from "react-router";
import KopiaTable from "./KopiaTable";
import { compare, objectLink, rfc3339TimestampForDisplay } from "../utils/formatutils";
import { sizeWithFailures } from "../utils/uiutil";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import PropTypes from "prop-types";

function objectName(name, typeID) {
  if (typeID === "d") {
    return name + "/";
  }

  return name;
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
    return (
      <Link to={objectLink(x.obj)} state={{ label: x.name, oid: x.obj, prevState: state }}>
        {objectName(x.name, x.type)}
      </Link>
    );
  }

  return <a href={"/api/v1/objects/" + x.obj + "?fname=" + encodeURIComponent(x.name)}>{x.name}</a>;
}

export function DirectoryItems({ historyState, items }) {
  const context = React.use(UIPreferencesContext);

  const { bytesStringBase2 } = context;
  const columns = [
    {
      id: "name",
      header: "Name",
      width: "",
      accessorFn: (x) => x.name,
      sortDescFirst: true, // first click sorts descending, like the other columns
      sortingFn: (rowA, rowB, columnId) => {
        const aIsDir = rowA.original.type === "d";
        const bIsDir = rowB.original.type === "d";
        if (aIsDir !== bIsDir) {
          return aIsDir ? -1 : 1; // directories always first, in both directions
        }

        const aName = rowA.getValue(columnId);
        const bName = rowB.getValue(columnId);
        const v = compare(aName.toLowerCase(), bName.toLowerCase());
        if (v !== 0) {
          return v;
        }

        return compare(aName, bName); // exact-compare fallback for case-insensitive ties
      },
      cell: (x) => directoryLinkOrDownload(x.row.original, historyState),
    },
    {
      id: "mtime",
      accessorFn: (x) => x.mtime,
      header: "Last Modification",
      width: 200,
      cell: (x) => rfc3339TimestampForDisplay(x.cell.getValue()),
    },
    {
      id: "size",
      accessorFn: (x) => sizeInfo(x),
      header: "Size",
      width: 100,
      cell: (x) => sizeWithFailures(x.cell.getValue(), x.row.original.summ, bytesStringBase2),
    },
    {
      id: "files",
      accessorFn: (x) => (x.summ ? x.summ.files : undefined),
      header: "Files",
      width: 100,
    },
    {
      id: "dirs",
      accessorFn: (x) => (x.summ ? x.summ.dirs : undefined),
      header: "Directories",
      width: 100,
    },
  ];

  return <KopiaTable data={items} columns={columns} tableKey="directory" />;
}

DirectoryItems.propTypes = {
  historyState: PropTypes.object,
  items: PropTypes.array.isRequired,
};
