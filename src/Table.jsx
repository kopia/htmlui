import React, { useContext, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { usePagination, useSortBy, useTable } from 'react-table';
import { PAGE_SIZES, UIPreferencesContext } from './contexts/UIPreferencesContext';

function paginationItems(count, active, gotoPage) {
  let items = [];

  function pageWithNumber(number) {
    return <Pagination.Item key={number} active={number === active} onClick={() => gotoPage(number - 1)}>
      {number}
    </Pagination.Item>;
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

export default function MyTable({ columns, data }) {
  const { bytesStringBase2, setBytesStringBase2, pageSize, setPageSize } = useContext(UIPreferencesContext);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize: setTablePageSize,
    state: { pageIndex },
  } = useTable({
    columns,
    data,
    initialState: { pageSize },
    autoResetPage: false,
    autoResetSortBy: false,
  },
    useSortBy,
    usePagination,
  )

  useEffect(() => {
    setTablePageSize(pageSize);
  }, [pageSize, setTablePageSize]);

  if (pageIndex >= pageCount && pageIndex !== 0 && pageCount > 0) {
    gotoPage(pageCount - 1);
  }

  const paginationUI = <>
    <>{pageOptions.length > 1 && (
      <Pagination size="sm" variant="dark">
        <Pagination.First onClick={() => gotoPage(0)} disabled={!canPreviousPage} />
        <Pagination.Prev onClick={() => previousPage()} disabled={!canPreviousPage} />
        {paginationItems(pageOptions.length, pageIndex + 1, gotoPage)}
        <Pagination.Next onClick={() => nextPage()} disabled={!canNextPage} />
        <Pagination.Last onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} />
      </Pagination>)}
    </>
    <Stack direction="horizontal" gap={3} style={{ marginBottom: '1em' }}>
      <div className="small">
        {/* TODO: Any more elegant way for this label? */}
        <span style={{ marginRight: '.5em', verticalAlign: 'middle' }}>Storage Unit:</span>
        <ToggleButtonGroup
          size="sm"
          name="storage-unit"
          value={bytesStringBase2}
          onChange={setBytesStringBase2}
        >
          <ToggleButton value={false} id="decimal">Decimal</ToggleButton>
          <ToggleButton value={true} id="binary">Binary</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <Dropdown>
        <Dropdown.Toggle size="sm">
          Page Size: {pageSize}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {PAGE_SIZES.map(pageSize => (
            <Dropdown.Item size="sm" key={pageSize} onClick={() => setPageSize(pageSize)}>
              Page Size {pageSize}
            </Dropdown.Item>))}
        </Dropdown.Menu>
      </Dropdown>
    </Stack>
  </>;

  return (
    <>
      <Table size="sm" striped bordered hover {...getTableProps()}>
        <thead className="table-dark">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps({
                  ...column.getSortByToggleProps(), style: {
                    width: column.width,
                  }
                })}>{column.render('Header')}
                  {column.isSorted ? (column.isSortedDesc ? '🔽' : '🔼') : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map(
            (row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  })}
                </tr>
              )
            }
          )}
        </tbody>
      </Table>
      {paginationUI}
    </>
  )
}
