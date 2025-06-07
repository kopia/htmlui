import React from "react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Snapshots } from "../../src/pages/Snapshots";
import { UIPreferencesContext } from "../../src/contexts/UIPreferencesContext";
import { setupAPIMock } from "../testutils/api-mocks";
import "@testing-library/jest-dom";

let axiosMock;

// Mock react-router-dom Link component using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock()();
});

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
 * Helper function to render Snapshots component with necessary providers
 */
const renderSnapshots = (contextOverrides = {}) => {
  const contextValue = { ...mockUIPreferences, ...contextOverrides };
  const result = render(
    <UIPreferencesContext.Provider value={contextValue}>
      <Snapshots />
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
});

/**
 * Clean up after each test
 */
afterEach(() => {
  axiosMock.reset();
  // Clear all timers to prevent interference
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("Snapshots component", () => {
  const mockSourcesResponse = {
    localUsername: "testuser",
    localHost: "testhost",
    multiUser: false,
    sources: [
      {
        source: {
          path: "/home/user/documents",
          host: "testhost",
          userName: "testuser",
        },
        status: "IDLE",
        lastSnapshot: {
          startTime: "2023-01-01T10:00:00Z",
          stats: { totalSize: 1024000 },
          rootEntry: { summ: { files: 100, dirs: 10 } },
        },
        nextSnapshotTime: "2023-01-02T10:00:00Z",
      },
      {
        source: {
          path: "/home/user/photos",
          host: "testhost",
          userName: "testuser",
        },
        status: "UPLOADING",
        upload: {
          hashedFiles: 50,
          hashedBytes: 512000,
          cachedFiles: 20,
          cachedBytes: 204800,
          estimatedBytes: 1024000,
          directory: "/home/user/photos",
        },
        currentTask: "task123",
        lastSnapshot: null,
        nextSnapshotTime: null,
      },
    ],
  };

  test("shows loading state initially", () => {
    // Mock a delayed response
    axiosMock.onGet("/api/v1/sources").reply(() => {
      return new Promise(() => {
        // Never resolve to keep loading state
      });
    });

    const { unmount } = renderSnapshots();
    // Bootstrap spinner doesn't have role="status", check for the spinner class instead
    const spinner = document.querySelector(".spinner-border");
    expect(spinner).toBeInTheDocument();
    unmount();
  });

  test("displays sources in table after loading", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, mockSourcesResponse);

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("/home/user/documents")).toBeInTheDocument();
      expect(screen.getByText("/home/user/photos")).toBeInTheDocument();
    });

    unmount();
  });

  test("displays snapshot status correctly for IDLE source", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, mockSourcesResponse);

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      // The Button with as={Link} renders as an <a> element, not a button with data-testid
      expect(screen.getByText("Policy")).toBeInTheDocument();
      expect(screen.getByTestId("snapshot-now")).toBeInTheDocument();
    });

    unmount();
  });

  test("displays upload progress for UPLOADING source", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, mockSourcesResponse);

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      expect(screen.getByTestId("snapshot-uploading")).toBeInTheDocument();
      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Details")).toHaveAttribute("href", "/tasks/task123");
    });

    unmount();
  });

  test("handles sync button click", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, mockSourcesResponse);
    axiosMock.onPost("/api/v1/repo/sync").reply(200, {});

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      expect(screen.getByTitle("Synchronize")).toBeInTheDocument();
    });

    // The sync button contains an icon that has the onClick handler
    const syncButton = screen.getByTitle("Synchronize");
    const syncIcon = syncButton.querySelector("svg");
    await userEvent.click(syncIcon);

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
      expect(axiosMock.history.post[0].url).toBe("/api/v1/repo/sync");
    });

    unmount();
  });

  test("handles start snapshot action", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, mockSourcesResponse);
    axiosMock.onPost(/\/api\/v1\/sources\/upload/).reply(200, {});

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      expect(screen.getByTestId("snapshot-now")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("snapshot-now"));

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
      expect(axiosMock.history.post[0].url).toContain("/api/v1/sources/upload");
    });

    unmount();
  });

  test("shows pending status correctly", async () => {
    const pendingSource = {
      ...mockSourcesResponse,
      sources: [
        {
          source: {
            path: "/home/user/pending",
            host: "testhost",
            userName: "testuser",
          },
          status: "PENDING",
          lastSnapshot: null,
          nextSnapshotTime: null,
        },
      ],
    };

    axiosMock.onGet("/api/v1/sources").reply(200, pendingSource);

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      expect(screen.getByTestId("snapshot-pending")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    unmount();
  });

  test("filters sources by owner in multi-user mode", async () => {
    const multiUserResponse = {
      ...mockSourcesResponse,
      multiUser: true,
      sources: [
        ...mockSourcesResponse.sources,
        {
          source: {
            path: "/home/otheruser/data",
            host: "otherhost",
            userName: "otheruser",
          },
          status: "IDLE",
          lastSnapshot: null,
          nextSnapshotTime: null,
        },
      ],
    };

    axiosMock.onGet("/api/v1/sources").reply(200, multiUserResponse);

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      expect(screen.getByText("Local Snapshots")).toBeInTheDocument();
    });

    // Initially shows local snapshots
    expect(screen.getByText("/home/user/documents")).toBeInTheDocument();
    expect(screen.queryByText("/home/otheruser/data")).not.toBeInTheDocument();

    // Click dropdown and select all snapshots
    const dropdown = screen.getByText("Local Snapshots");
    await userEvent.click(dropdown);
    await userEvent.click(screen.getByText("All Snapshots"));

    // Should now show all sources
    expect(screen.getByText("/home/user/documents")).toBeInTheDocument();
    expect(screen.getByText("/home/otheruser/data")).toBeInTheDocument();

    unmount();
  });

  test("shows overdue badge for past due snapshots", async () => {
    const overdueResponse = {
      ...mockSourcesResponse,
      sources: [
        {
          source: {
            path: "/home/user/overdue",
            host: "testhost",
            userName: "testuser",
          },
          status: "IDLE",
          lastSnapshot: null,
          nextSnapshotTime: "2020-01-01T10:00:00Z", // Past date
        },
      ],
    };

    axiosMock.onGet("/api/v1/sources").reply(200, overdueResponse);

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      expect(screen.getByText("overdue")).toBeInTheDocument();
    });

    unmount();
  });

  test("handles API error gracefully", async () => {
    axiosMock.onGet("/api/v1/sources").reply(500, { message: "Server error" });

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      expect(screen.getByText("Request failed with status code 500")).toBeInTheDocument();
    });

    unmount();
  });

  test("refreshes sources periodically", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, mockSourcesResponse);

    // Spy on setInterval to verify it's called
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    const { unmount } = renderSnapshots();

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText("/home/user/documents")).toBeInTheDocument();
    });

    // Verify that setInterval was called with 3000ms for periodic refresh
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 3000);

    // Verify clearInterval is called on unmount
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  test("respects defaultSnapshotViewAll preference", async () => {
    const multiUserResponse = {
      ...mockSourcesResponse,
      multiUser: true,
      sources: [
        ...mockSourcesResponse.sources,
        {
          source: {
            path: "/home/otheruser/data",
            host: "otherhost",
            userName: "otheruser",
          },
          status: "IDLE",
          lastSnapshot: null,
          nextSnapshotTime: null,
        },
      ],
    };

    axiosMock.onGet("/api/v1/sources").reply(200, multiUserResponse);

    // Render with defaultSnapshotViewAll set to true
    const { unmount } = renderSnapshots({ defaultSnapshotViewAll: true });

    await waitFor(() => {
      expect(screen.getByText("All Snapshots")).toBeInTheDocument();
    });

    // Should show all sources when defaultSnapshotViewAll is true
    expect(screen.getByText("/home/user/documents")).toBeInTheDocument();
    expect(screen.getByText("/home/otheruser/data")).toBeInTheDocument();

    unmount();
  });

  test("updates preference when changing owner filter", async () => {
    const setDefaultSnapshotViewAll = vi.fn();

    axiosMock.onGet("/api/v1/sources").reply(200, {
      ...mockSourcesResponse,
      multiUser: true,
    });

    const { unmount } = renderSnapshots({ setDefaultSnapshotViewAll });

    await waitFor(() => {
      expect(screen.getByText("Local Snapshots")).toBeInTheDocument();
    });

    // Click dropdown and select all snapshots
    await userEvent.click(screen.getByText("Local Snapshots"));
    await userEvent.click(screen.getByText("All Snapshots"));

    expect(setDefaultSnapshotViewAll).toHaveBeenCalledWith(true);

    unmount();
  });

  test("shows paused status in next snapshot time", async () => {
    const pausedResponse = {
      ...mockSourcesResponse,
      sources: [
        {
          source: {
            path: "/home/user/paused",
            host: "testhost",
            userName: "testuser",
          },
          status: "PAUSED",
          lastSnapshot: null,
          nextSnapshotTime: null,
        },
      ],
    };

    axiosMock.onGet("/api/v1/sources").reply(200, pausedResponse);

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      expect(screen.getByText("paused")).toBeInTheDocument();
    });

    unmount();
  });

  test("displays CLI equivalent command", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, mockSourcesResponse);

    const { unmount } = renderSnapshots();

    await waitFor(() => {
      // Look for the terminal button that CLIEquivalent renders
      expect(screen.getByTestId("show-cli-button")).toBeInTheDocument();
    });

    // Click the terminal button to show the CLI command
    const terminalButton = screen.getByTestId("show-cli-button");
    await userEvent.click(terminalButton);

    // Should show the actual CLI command with kopia executable
    await waitFor(() => {
      const input = screen.getByDisplayValue("kopia snapshot list");
      expect(input).toBeInTheDocument();
    });

    unmount();
  });
});
