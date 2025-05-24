import React, { useContext, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Pagination from "react-bootstrap/Pagination";
import Table from "react-bootstrap/Table";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { PAGE_SIZES, UIPreferencesContext } from "../contexts/UIPreferencesContext";
import PropTypes from "prop-types";

function paginationItems(count, active, gotoPage) {
  let items = [];

  function pageWithNumber(number) {
    return (
      <Pagination.Item key={number} active={number === active} onClick={() => gotoPage(number - 1)}>
        {number}
      </Pagination.Item>
    );
  }

  function dotDotDot() {
    return <Pagination.Ellipsis />;
  }

  let minPageNumber = active - 10;
  if (minPageNumber < 1) {
    minPageNumber = 1;
  }

  let maxPageNumber = active + 9;
  if (minPageNumber + 19 >= maxPageNumber) {
    maxPageNumber = minPageNumber + 19;
  }
  if (maxPageNumber > count) {
    maxPageNumber = count;
  }

  if (minPageNumber > 1) {
    items.push(dotDotDot());
  }

  for (let number = minPageNumber; number <= maxPageNumber; number++) {
    items.push(pageWithNumber(number));
  }

  if (maxPageNumber < count) {
    items.push(dotDotDot());
  }

  return items;
}

export default function KopiaTable({ columns, data }) {
  const { pageSize, setPageSize } = useContext(UIPreferencesContext);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //default page index
    pageSize: pageSize, //default page size
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), //load client-side pagination code
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
    onSortingChange: setSorting,
  });

  if (pagination.pageIndex >= table.getPageCount() && pagination.pageIndex !== 0) {
    table.resetPageIndex();
  }

  const paginationUI = (
    <>
      <>
        {table.getPageCount() > 1 && (
          <Pagination size="sm" variant="dark">
            <Pagination.First onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} />
            <Pagination.Prev onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
            {paginationItems(table.getPageCount(), pagination.pageIndex + 1, table.setPageIndex)}
            <Pagination.Next onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
            <Pagination.Last
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            />
          </Pagination>
        )}
      </>
      <>
        <Dropdown style={{ marginBottom: "1em" }}>
          <Dropdown.Toggle size="sm">Page Size: {pageSize}</Dropdown.Toggle>
          <Dropdown.Menu>
            {PAGE_SIZES.map((pageSize) => (
              <Dropdown.Item
                size="sm"
                key={pageSize}
                onClick={() => {
                  table.setPageSize(pageSize);
                  setPageSize(pageSize);
                }}
              >
                Page Size {pageSize}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </>
    </>
  );

  return (
    <>
      <div className="p-2">
        <Table size="sm" striped bordered hover>
          <thead className="table-dark">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    <div
                      className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === "asc"
                            ? "Sort ascending"
                            : header.column.getNextSortingOrder() === "desc"
                              ? "Sort descending"
                              : "Clear sort"
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        {paginationUI}
      </div>
    </>
  );
}

KopiaTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
};
