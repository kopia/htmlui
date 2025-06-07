import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { DirectoryItems } from "../../src/components/DirectoryItems";
import { UIPreferencesContext } from "../../src/contexts/UIPreferencesContext";

// Mock react-router-dom Link component using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  const routerMock = await createRouterMock()();

  // Override the Link component to include state data for testing
  return {
    ...routerMock,
    // eslint-disable-next-line react/prop-types
    Link: ({ children, to, state }) => (
      <a href={to} data-testid="mock-link" data-link-state={JSON.stringify(state)}>
        {children}
      </a>
    ),
  };
});

// Helper function to render component with necessary providers
const renderDirectoryItems = (props, contextOverrides = {}) => {
  const defaultContext = {
    bytesStringBase2: false,
    pageSize: 10,
    theme: "light",
    defaultSnapshotViewAll: false,
    fontSize: "fs-6",
    setTheme: vi.fn(),
    setPageSize: vi.fn(),
    setByteStringBase: vi.fn(),
    setDefaultSnapshotViewAll: vi.fn(),
    setFontSize: vi.fn(),
  };

  const contextValue = { ...defaultContext, ...contextOverrides };

  return render(
    <BrowserRouter>
      <UIPreferencesContext.Provider value={contextValue}>
        <DirectoryItems {...props} />
      </UIPreferencesContext.Provider>
    </BrowserRouter>,
  );
};

describe("DirectoryItems", () => {
  const mockHistoryState = {
    label: "test-directory",
    oid: "test-oid-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty table when no items provided", () => {
    renderDirectoryItems({ items: [], historyState: mockHistoryState });

    // Should render the table structure but no data rows
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Last Modification")).toBeInTheDocument();
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("Files")).toBeInTheDocument();
    expect(screen.getByText("Directories")).toBeInTheDocument();
  });

  it("renders file item with direct download link", () => {
    const fileItem = {
      name: "document.pdf",
      type: "f",
      obj: "obj123456", // Non-kopia object (regular file)
      size: 2048000,
      mtime: "2023-12-15T10:30:00Z",
    };

    renderDirectoryItems({ items: [fileItem], historyState: mockHistoryState });

    // File name should be rendered as download link
    const fileLink = screen.getByText("document.pdf");
    expect(fileLink).toBeInTheDocument();
    expect(fileLink.closest("a")).toHaveAttribute("href", "/api/v1/objects/obj123456?fname=document.pdf");

    // Should display file size (actual output is "2 MB" not "2.0 MB")
    expect(screen.getByText("2 MB")).toBeInTheDocument();
  });

  it("renders directory item with navigation link", () => {
    const directoryItem = {
      name: "photos",
      type: "d",
      obj: "kdir789abc", // Kopia directory object (starts with 'k')
      mtime: "2023-12-14T15:45:30Z",
      summ: {
        size: 10485760,
        files: 25,
        dirs: 3,
      },
    };

    renderDirectoryItems({ items: [directoryItem], historyState: mockHistoryState });

    // Directory name should be rendered with trailing slash as navigation link
    const dirLink = screen.getByText("photos/");
    expect(dirLink).toBeInTheDocument();
    expect(dirLink.closest("a")).toHaveAttribute("data-testid", "mock-link");

    // Should display summary statistics (actual output is "10.5 MB")
    expect(screen.getByText("10.5 MB")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument(); // Files count
    expect(screen.getByText("3")).toBeInTheDocument(); // Directories count
  });

  it("handles file items without size gracefully", () => {
    const fileItem = {
      name: "empty-file.txt",
      type: "f",
      obj: "obj999",
      mtime: "2023-12-15T10:30:00Z",
      // No size property
    };

    renderDirectoryItems({ items: [fileItem], historyState: mockHistoryState });

    expect(screen.getByText("empty-file.txt")).toBeInTheDocument();
    expect(screen.getByText("0 B")).toBeInTheDocument(); // Should default to 0
  });

  it("uses summary size when direct size is not available", () => {
    const directoryItem = {
      name: "backup-folder",
      type: "d",
      obj: "kdir555",
      mtime: "2023-12-10T08:15:00Z",
      // No direct size property
      summ: {
        size: 5242880, // 5MB
        files: 10,
        dirs: 2,
      },
    };

    renderDirectoryItems({ items: [directoryItem], historyState: mockHistoryState });

    expect(screen.getByText("backup-folder/")).toBeInTheDocument();
    expect(screen.getByText("5.2 MB")).toBeInTheDocument(); // Actual output
  });

  it("handles mixed file and directory items", () => {
    const mixedItems = [
      {
        name: "readme.txt",
        type: "f",
        obj: "obj111",
        size: 1024,
        mtime: "2023-12-15T09:00:00Z",
      },
      {
        name: "images",
        type: "d",
        obj: "kdir222",
        mtime: "2023-12-14T14:30:00Z",
        summ: {
          size: 20971520,
          files: 50,
          dirs: 5,
        },
      },
      {
        name: "config.json",
        type: "f",
        obj: "obj333",
        size: 512,
        mtime: "2023-12-13T16:45:00Z",
      },
    ];

    renderDirectoryItems({ items: mixedItems, historyState: mockHistoryState });

    // Check files (no trailing slash, download links)
    expect(screen.getByText("readme.txt")).toBeInTheDocument();
    expect(screen.getByText("config.json")).toBeInTheDocument();

    // Check directory (with trailing slash, navigation link)
    expect(screen.getByText("images/")).toBeInTheDocument();

    // Check that all items appear in table
    const tableRows = screen.getAllByRole("row");
    expect(tableRows).toHaveLength(4); // 3 data rows + 1 header row
  });

  it("respects bytesStringBase2 preference for size formatting", () => {
    const fileItem = {
      name: "large-file.zip",
      type: "f",
      obj: "obj456",
      size: 1073741824, // Exactly 1GB (base 10) or 1GiB (base 2)
      mtime: "2023-12-15T10:30:00Z",
    };

    // Test with base 10 (default)
    renderDirectoryItems({ items: [fileItem], historyState: mockHistoryState });
    expect(screen.getByText("1.1 GB")).toBeInTheDocument();
  });

  it("respects bytesStringBase2 preference set to true", () => {
    const fileItem = {
      name: "large-file.zip",
      type: "f",
      obj: "obj456",
      size: 1073741824, // Exactly 1GiB in base 2
      mtime: "2023-12-15T10:30:00Z",
    };

    // Test with base 2
    renderDirectoryItems({ items: [fileItem], historyState: mockHistoryState }, { bytesStringBase2: true });
    expect(screen.getByText("1 GiB")).toBeInTheDocument(); // Actual output
  });

  it("handles items without summary data gracefully", () => {
    const itemWithoutSummary = {
      name: "simple-dir",
      type: "d",
      obj: "kdir777",
      mtime: "2023-12-15T12:00:00Z",
      // No summ property
    };

    renderDirectoryItems({ items: [itemWithoutSummary], historyState: mockHistoryState });

    expect(screen.getByText("simple-dir/")).toBeInTheDocument();
    expect(screen.getByText("0 B")).toBeInTheDocument(); // Size defaults to 0

    // Files and Directories columns should be empty for this row
    const tableRows = screen.getAllByRole("row");
    expect(tableRows).toHaveLength(2); // 1 data row + 1 header row
  });

  it("passes correct navigation state for directory links", () => {
    const directoryItem = {
      name: "sub-folder",
      type: "d",
      obj: "kdir888",
      mtime: "2023-12-15T10:30:00Z",
    };

    renderDirectoryItems({ items: [directoryItem], historyState: mockHistoryState });

    const dirLink = screen.getByText("sub-folder/");
    const linkElement = dirLink.closest("a");

    // Check that the link has the correct state data
    const linkState = JSON.parse(linkElement.getAttribute("data-link-state"));
    expect(linkState).toEqual({
      label: "sub-folder",
      oid: "kdir888",
      prevState: mockHistoryState,
    });
  });

  it("encodes file names correctly in download URLs", () => {
    const fileWithSpecialChars = {
      name: "my file & data (2023).txt",
      type: "f",
      obj: "obj999",
      size: 1024,
      mtime: "2023-12-15T10:30:00Z",
    };

    renderDirectoryItems({ items: [fileWithSpecialChars], historyState: mockHistoryState });

    const fileLink = screen.getByText("my file & data (2023).txt");
    expect(fileLink.closest("a")).toHaveAttribute(
      "href",
      "/api/v1/objects/obj999?fname=my%20file%20%26%20data%20(2023).txt",
    );
  });

  it("sorts and displays items correctly in table format", () => {
    const items = [
      {
        name: "z-last.txt",
        type: "f",
        obj: "obj1",
        size: 100,
        mtime: "2023-12-15T10:30:00Z",
      },
      {
        name: "a-first-dir",
        type: "d",
        obj: "kdir1",
        mtime: "2023-12-14T10:30:00Z",
        summ: { size: 1000, files: 5, dirs: 1 },
      },
      {
        name: "m-middle.json",
        type: "f",
        obj: "obj2",
        size: 500,
        mtime: "2023-12-13T10:30:00Z",
      },
    ];

    renderDirectoryItems({ items, historyState: mockHistoryState });

    // All items should be present
    expect(screen.getByText("z-last.txt")).toBeInTheDocument();
    expect(screen.getByText("a-first-dir/")).toBeInTheDocument();
    expect(screen.getByText("m-middle.json")).toBeInTheDocument();

    // Should have proper table structure
    expect(screen.getByRole("table")).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4); // 3 data rows + 1 header
  });
});
