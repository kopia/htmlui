import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, describe, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";

import KopiaTable from "../../src/utils/KopiaTable";
import { UIPreferencesContext, PAGE_SIZES } from "../../src/contexts/UIPreferencesContext";

// Test data and mock setup
const createMockContext = (pageSize = 10) => ({
  pageSize,
  setPageSize: vi.fn(),
  theme: "light",
  bytesStringBase2: false,
  defaultSnapshotViewAll: false,
  fontSize: "fs-6",
  setTheme: vi.fn(),
  setByteStringBase: vi.fn(),
  setDefaultSnapshotViewAll: vi.fn(),
  setFontSize: vi.fn(),
});

const sampleColumns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

const createSampleData = (count = 25) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    status: i % 2 === 0 ? "Active" : "Inactive",
  }));

const renderWithContext = (ui, contextValue = createMockContext()) => {
  return render(<UIPreferencesContext.Provider value={contextValue}>{ui}</UIPreferencesContext.Provider>);
};

describe("KopiaTable", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = createMockContext();
  });

  describe("Basic Rendering", () => {
    it("renders table with provided data and columns", () => {
      const data = createSampleData(5);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Check headers are rendered
      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();

      // Check data rows are rendered
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 5")).toBeInTheDocument();
    });

    it("renders empty table when no data provided", () => {
      renderWithContext(<KopiaTable columns={sampleColumns} data={[]} />, mockContext);

      // Headers should still be present
      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();

      // No data rows should be present
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });

    it("displays page size dropdown with current page size", () => {
      const data = createSampleData(15);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      expect(screen.getByText("Page Size: 10")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("shows pagination controls when data exceeds page size", () => {
      const data = createSampleData(25); // More than default page size of 10
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Pagination controls should be visible - check for pagination list
      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByText("First", { selector: ".visually-hidden" })).toBeInTheDocument();
      expect(screen.getByText("Previous", { selector: ".visually-hidden" })).toBeInTheDocument();
      expect(screen.getByText("Next", { selector: ".visually-hidden" })).toBeInTheDocument();
      expect(screen.getByText("Last", { selector: ".visually-hidden" })).toBeInTheDocument();
    });

    it("does not show pagination when data fits on single page", () => {
      const data = createSampleData(5); // Less than page size
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Should not have pagination list
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("displays correct number of rows per page", () => {
      const data = createSampleData(25);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Should show only 10 rows (default page size)
      const rows = screen.getAllByRole("row");
      // 1 header row + 10 data rows = 11 total
      expect(rows).toHaveLength(11);

      // First 10 items should be visible
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 10")).toBeInTheDocument();
      expect(screen.queryByText("Item 11")).not.toBeInTheDocument();
    });

    it("navigates to next page correctly", async () => {
      const user = userEvent.setup();
      const data = createSampleData(25);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Click next page button - find by role button with Next text
      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Should show next set of items
      expect(screen.getByText("Item 11")).toBeInTheDocument();
      expect(screen.getByText("Item 20")).toBeInTheDocument();
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });

    it("navigates to specific page number", async () => {
      const user = userEvent.setup();
      const data = createSampleData(50); // Use more data to avoid conflicts with row data
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Click on page number 4 - using role button to be more specific
      const pageButton = screen.getByRole("button", { name: "4" });
      await user.click(pageButton);

      // Should show items 31-40
      expect(screen.getByText("Item 31")).toBeInTheDocument();
      expect(screen.getByText("Item 40")).toBeInTheDocument();
      expect(screen.queryByText("Item 30")).not.toBeInTheDocument();
    });

    it("disables navigation buttons appropriately", () => {
      const data = createSampleData(25);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // On first page, previous and first should be disabled
      // Find the pagination list items by their content
      const firstItem = screen.getByText("First", { selector: ".visually-hidden" }).closest("li");
      const prevItem = screen.getByText("Previous", { selector: ".visually-hidden" }).closest("li");
      const nextItem = screen.getByText("Next", { selector: ".visually-hidden" }).closest("li");
      const lastItem = screen.getByText("Last", { selector: ".visually-hidden" }).closest("li");

      expect(firstItem).toHaveClass("disabled");
      expect(prevItem).toHaveClass("disabled");
      expect(nextItem).not.toHaveClass("disabled");
      expect(lastItem).not.toHaveClass("disabled");
    });
  });

  describe("Page Size Changes", () => {
    it("allows changing page size", async () => {
      const user = userEvent.setup();
      const data = createSampleData(50);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Open page size dropdown
      const dropdown = screen.getByText("Page Size: 10");
      await user.click(dropdown);

      // Click on page size 20
      const pageSize20 = screen.getByText("Page Size 20");
      await user.click(pageSize20);

      // Verify setPageSize was called
      expect(mockContext.setPageSize).toHaveBeenCalledWith(20);
    });

    it("displays all available page sizes in dropdown", async () => {
      const user = userEvent.setup();
      const data = createSampleData(25);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Open page size dropdown
      const dropdown = screen.getByText("Page Size: 10");
      await user.click(dropdown);

      // Check all page sizes are present
      PAGE_SIZES.forEach((size) => {
        expect(screen.getByText(`Page Size ${size}`)).toBeInTheDocument();
      });
    });

    it("respects initial page size from context", () => {
      const contextWithLargerPageSize = createMockContext(20);
      const data = createSampleData(15); // Use 15 items so it fits in one page with page size 20
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, contextWithLargerPageSize);

      expect(screen.getByText("Page Size: 20")).toBeInTheDocument();

      // Should show all 15 rows since page size is 20 and data is 15 items
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(16); // 1 header + 15 data rows
    });
  });

  describe("Sorting", () => {
    it("shows sort indicators for sortable columns", () => {
      const data = createSampleData(5);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Headers should be clickable for sorting - look for the div inside the th
      const nameHeader = screen.getByText("Name");
      const headerDiv = nameHeader.closest("div");
      expect(headerDiv).toHaveClass("cursor-pointer");
    });

    it("sorts data when clicking column header", async () => {
      const user = userEvent.setup();
      const data = [
        { id: 3, name: "Charlie", status: "Active" },
        { id: 1, name: "Alice", status: "Inactive" },
        { id: 2, name: "Bob", status: "Active" },
      ];
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Click on Name header to sort
      const nameHeader = screen.getByText("Name");
      await user.click(nameHeader);

      // Get all rows and check order (skip header row)
      const rows = screen.getAllByRole("row");
      const dataRows = rows.slice(1); // Remove header row

      // Should be sorted by name (Alice, Bob, Charlie)
      expect(dataRows[0]).toHaveTextContent("Alice");
      expect(dataRows[1]).toHaveTextContent("Bob");
      expect(dataRows[2]).toHaveTextContent("Charlie");
    });

    it("shows sort direction indicators", async () => {
      const user = userEvent.setup();
      const data = createSampleData(5);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      const nameHeader = screen.getByText("Name");

      // Click to sort ascending
      await user.click(nameHeader);
      const headerDiv = nameHeader.closest("div");
      expect(headerDiv).toHaveTextContent("🔼");

      // Click again to sort descending
      await user.click(nameHeader);
      expect(headerDiv).toHaveTextContent("🔽");
    });

    it("provides accessible sort titles", () => {
      const data = createSampleData(5);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      const nameHeader = screen.getByText("Name");
      const headerDiv = nameHeader.closest("div");
      expect(headerDiv).toHaveAttribute("title", "Sort ascending");
    });
  });

  describe("Accessibility", () => {
    it("has proper table structure", () => {
      const data = createSampleData(5);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Should have table, thead, tbody
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByRole("table")).toHaveClass("table");
    });

    it("has proper column headers", () => {
      const data = createSampleData(5);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(3);
      expect(headers[0]).toHaveTextContent("ID");
      expect(headers[1]).toHaveTextContent("Name");
      expect(headers[2]).toHaveTextContent("Status");
    });
  });

  describe("Edge Cases", () => {
    it("handles very large datasets", () => {
      const data = createSampleData(1000);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Should still only show page size number of rows
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(11); // 1 header + 10 data rows

      // Should show pagination list
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("handles single row of data", () => {
      const data = createSampleData(1);
      renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(2); // 1 header + 1 data row
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("resets page index when current page exceeds total pages", () => {
      const data = createSampleData(25);
      const { rerender } = renderWithContext(<KopiaTable columns={sampleColumns} data={data} />, mockContext);

      // Navigate to last page first
      const lastButton = screen.getByRole("button", { name: /last/i });
      fireEvent.click(lastButton);

      // Now reduce data to force page reset
      const smallerData = createSampleData(5);
      rerender(
        <UIPreferencesContext.Provider value={mockContext}>
          <KopiaTable columns={sampleColumns} data={smallerData} />
        </UIPreferencesContext.Provider>,
      );

      // Should show the reduced data
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 5")).toBeInTheDocument();
    });
  });
});
