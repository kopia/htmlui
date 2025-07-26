import React from "react";
import { Link } from "react-router-dom";
import KopiaTable from "./KopiaTable";
import { objectLink, LocaleFormatUtils } from "../utils/formatutils";
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
  const context = React.useContext(UIPreferencesContext);

  const { bytesStringBase2, locale } = context;
  const fmt = new LocaleFormatUtils(locale);
  const columns = [
    {
      id: "name",
      header: "Name",
      width: "",
      cell: (x) => directoryLinkOrDownload(x.row.original, historyState),
    },
    {
      id: "mtime",
      accessorFn: (x) => x.mtime,
      header: "Last Modification",
      width: 200,
      cell: (x) => fmt.timestamp(x.cell.getValue()),
    },
    {
      id: "size",
      accessorFn: (x) => sizeInfo(x),
      header: "Size",
      width: 100,
      cell: (x) => <div className="align-right">
        {sizeWithFailures(x.cell.getValue(), x.row.original.summ, bytesStringBase2)}
      </div>,
    },
    {
      id: "files",
      accessorFn: (x) => (x.summ ? x.summ.files : undefined),
      header: "Files",
      width: 100,
      cell: (x) => <div className="align-right">
        {fmt.number(x.getValue())}
      </div>
    },
    {
      id: "dirs",
      accessorFn: (x) => (x.summ ? x.summ.dirs : undefined),
      header: "Directories",
      width: 100,
      cell: (x) => <div className="align-right">
        {fmt.number(x.getValue())}
      </div>
    },
  ];

  return <KopiaTable data={items} columns={columns} />;
}

DirectoryItems.propTypes = {
  historyState: PropTypes.object,
  items: PropTypes.array.isRequired,
};
