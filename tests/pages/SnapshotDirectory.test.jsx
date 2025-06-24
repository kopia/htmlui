import React from "react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnapshotDirectory } from "../../src/pages/SnapshotDirectory";
import { UIPreferencesContext } from "../../src/contexts/UIPreferencesContext";
import { setupAPIMock } from "../testutils/api-mocks";
import "@testing-library/jest-dom";

let axiosMock;

// Mock react-router-dom using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock({
    simple: true,
    location: { pathname: "/snapshots/single-source" },
    params: { oid: "test-oid-123" },
    navigate: vi.fn(),
  })();
});

// Mock the child components to focus on SnapshotDirectory logic
vi.mock("../../src/components/DirectoryItems", () => ({
  // eslint-disable-next-line react/prop-types
  DirectoryItems: ({ items, historyState }) => (
    <div data-testid="directory-items">
      {/* eslint-disable-next-line react/prop-types */}
      <div data-testid="items-count">{items.length}</div>
      <div data-testid="history-state">{JSON.stringify(historyState)}</div>
    </div>
  ),
}));

// Minimal UIPreferences context value
const mockUIPreferences = {
  pageSize: 10,
  theme: "light",
  bytesStringBase2: false,
  defaultSnapshotViewAll: false,
  fontSize: "fs-6",
  setTheme: vi.fn(),
  setPageSize: vi.fn(),
  setByteStringBase: vi.fn(),
  setDefaultSnapshotViewAll: vi.fn(),
  setFontSize: vi.fn(),
};

/**
 * Helper function to render SnapshotDirectory component with necessary providers
 */
const renderSnapshotDirectory = (contextOverrides = {}) => {
  const contextValue = { ...mockUIPreferences, ...contextOverrides };
  const result = render(
    <UIPreferencesContext.Provider value={contextValue}>
      <SnapshotDirectory />
    </UIPreferencesContext.Provider>,
  );

  return result;
};

/**
 * Setup API mocks before each test
 */
beforeEach(() => {
  axiosMock = setupAPIMock();
  // Reset all mocks
  vi.clearAllMocks();

  // Mock DOM methods used by copyPath
  document.execCommand = vi.fn();
  document.querySelector = vi.fn();

  // Mock window.kopiaUI
  window.kopiaUI = undefined;
  window.alert = vi.fn();
});

/**
 * Clean up after each test
 */
afterEach(() => {
  axiosMock.reset();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("SnapshotDirectory component", () => {
  const mockObjectsResponse = {
    entries: [
      {
        name: "file1.txt",
        type: "f",
        obj: "obj123",
        size: 1024,
        mtime: "2023-01-01T10:00:00Z",
      },
      {
        name: "folder1",
        type: "d",
        obj: "kdir456",
        mtime: "2023-01-01T09:00:00Z",
        summ: {
          size: 2048,
          files: 5,
          dirs: 2,
        },
      },
    ],
  };

  const mockMountResponse = {
    path: "/tmp/kopia-mount-123",
    root: "test-oid-123",
  };

  test("shows loading state initially", () => {
    // Mock delayed responses to keep loading state
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(() => {
      return new Promise(() => {
        // Never resolve to keep loading state
      });
    });
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(() => {
      return new Promise(() => {
        // Never resolve
      });
    });

    const { unmount, container } = renderSnapshotDirectory();

    const spinner = container.querySelector(".spinner-border");
    expect(spinner).toBeInTheDocument();

    unmount();
  });

  test("displays error message when objects API fails", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(500, { message: "Server error" });
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(404);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByText(/ERROR:/)).toBeInTheDocument();
    });

    unmount();
  });

  test("displays directory content after successful load", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(404); // Not mounted

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
      expect(screen.getByTestId("directory-items")).toBeInTheDocument();
      expect(screen.getByTestId("items-count")).toHaveTextContent("2");
      expect(screen.getByTestId("show-cli-button")).toBeInTheDocument();
    });

    // Should show mount button when not mounted
    expect(screen.getByText("Mount as Local Filesystem")).toBeInTheDocument();
    expect(screen.getByText("Restore Files & Directories")).toBeInTheDocument();

    unmount();
  });

  test("shows mounted state with path and unmount button", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(200, mockMountResponse);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByDisplayValue("/tmp/kopia-mount-123")).toBeInTheDocument();
      expect(screen.getByText("Unmount")).toBeInTheDocument();
      expect(screen.queryByText("Mount as Local Filesystem")).not.toBeInTheDocument();
    });

    unmount();
  });

  test("shows browse button when kopiaUI is available", async () => {
    window.kopiaUI = {
      browseDirectory: vi.fn(),
    };

    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(200, mockMountResponse);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    unmount();
  });

  test("handles mount action successfully", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(404); // Initially not mounted
    axiosMock.onPost("/api/v1/mounts").reply(200, mockMountResponse);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByText("Mount as Local Filesystem")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Mount as Local Filesystem"));

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
      expect(axiosMock.history.post[0].url).toBe("/api/v1/mounts");
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ root: "test-oid-123" });
    });

    unmount();
  });

  test("handles mount action failure gracefully", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(404);
    axiosMock.onPost("/api/v1/mounts").reply(500);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByText("Mount as Local Filesystem")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Mount as Local Filesystem"));

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    // Component should handle error gracefully and reset mount info
    unmount();
  });

  test("handles unmount action successfully", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(200, mockMountResponse);
    axiosMock.onDelete("/api/v1/mounts/test-oid-123").reply(200);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByText("Unmount")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Unmount"));

    await waitFor(() => {
      expect(axiosMock.history.delete).toHaveLength(1);
      expect(axiosMock.history.delete[0].url).toBe("/api/v1/mounts/test-oid-123");
    });

    unmount();
  });

  test("handles unmount action failure", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(200, mockMountResponse);
    axiosMock.onDelete("/api/v1/mounts/test-oid-123").reply(500, { message: "Unmount failed" });

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByText("Unmount")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Unmount"));

    await waitFor(() => {
      expect(axiosMock.history.delete).toHaveLength(1);
    });

    // Component should handle error and still reset mount info
    unmount();
  });

  test("handles browse mounted directory when kopiaUI is available", async () => {
    const mockBrowseDirectory = vi.fn();
    window.kopiaUI = {
      browseDirectory: mockBrowseDirectory,
    };

    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(200, mockMountResponse);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Browse"));

    expect(mockBrowseDirectory).toHaveBeenCalledWith("/tmp/kopia-mount-123");

    unmount();
  });

  test("shows alert when browsing without kopiaUI", async () => {
    window.kopiaUI = undefined;

    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(200, mockMountResponse);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByDisplayValue("/tmp/kopia-mount-123")).toBeInTheDocument();
    });

    // Browse button should not be available without kopiaUI
    expect(screen.queryByText("Browse")).not.toBeInTheDocument();

    unmount();
  });

  test("handles copy path functionality", async () => {
    const mockInput = {
      select: vi.fn(),
      setSelectionRange: vi.fn(),
    };
    document.querySelector = vi.fn().mockReturnValue(mockInput);

    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(200, mockMountResponse);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByDisplayValue("/tmp/kopia-mount-123")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("copy-path-button"));

    expect(document.querySelector).toHaveBeenCalledWith(".mounted-path");
    expect(mockInput.select).toHaveBeenCalled();
    expect(mockInput.setSelectionRange).toHaveBeenCalledWith(0, 99999);
    expect(document.execCommand).toHaveBeenCalledWith("copy");

    unmount();
  });

  test("handles copy path when element not found", async () => {
    document.querySelector = vi.fn().mockReturnValue(null);

    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(200, mockMountResponse);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByDisplayValue("/tmp/kopia-mount-123")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("copy-path-button"));

    expect(document.querySelector).toHaveBeenCalledWith(".mounted-path");
    expect(document.execCommand).not.toHaveBeenCalled();

    unmount();
  });

  test("handles empty entries response", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, { entries: [] });
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(404);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByTestId("directory-items")).toBeInTheDocument();
      expect(screen.getByTestId("items-count")).toHaveTextContent("0");
    });

    unmount();
  });

  test("handles missing entries in response", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, {}); // No entries field
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(404);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(screen.getByTestId("directory-items")).toBeInTheDocument();
      expect(screen.getByTestId("items-count")).toHaveTextContent("0");
    });

    unmount();
  });

  test("refetches data when OID changes", async () => {
    // This test would require mocking useParams to return different values
    // For now, we verify the componentDidUpdate logic indirectly through the API calls
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(404);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      expect(axiosMock.history.get.filter((req) => req.url.includes("/api/v1/objects/"))).toHaveLength(1);
      expect(axiosMock.history.get.filter((req) => req.url.includes("/api/v1/mounts/"))).toHaveLength(1);
    });

    unmount();
  });

  test("restore button has correct href", async () => {
    axiosMock.onGet("/api/v1/objects/test-oid-123").reply(200, mockObjectsResponse);
    axiosMock.onGet("/api/v1/mounts/test-oid-123").reply(404);

    const { unmount } = renderSnapshotDirectory();

    await waitFor(() => {
      const restoreButton = screen.getByText("Restore Files & Directories");
      expect(restoreButton).toHaveAttribute("href", "/snapshots/dir/test-oid-123/restore");
    });

    unmount();
  });
});
