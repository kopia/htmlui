import React from "react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Task } from "../../src/pages/Task";
import { UIPreferencesContext } from "../../src/contexts/UIPreferencesContext";
import { setupAPIMock } from "../testutils/api-mocks";
import "@testing-library/jest-dom";

let axiosMock;

// Mock react-router-dom using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock({
    simple: true,
    location: { pathname: "/tasks/123" },
    params: { tid: "123" },
    navigate: vi.fn(),
  })();
});

// Mock the Logs component to avoid its complex implementation
vi.mock("../../src/components/Logs", () => ({
  // eslint-disable-next-line react/prop-types
  Logs: ({ taskID }) => <div data-testid="logs-component">Logs for task {taskID}</div>,
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
 * Helper function to render Task component with necessary providers
 */
const renderTask = (props = {}) => {
  return render(
    <UIPreferencesContext.Provider value={mockUIPreferences}>
      <Task {...props} />
    </UIPreferencesContext.Provider>,
  );
};

/**
 * Setup API mocks before each test
 */
beforeEach(() => {
  axiosMock = setupAPIMock();
  // Clear all previous mocks
  vi.clearAllMocks();
});

/**
 * Clean up after each test
 */
afterEach(() => {
  axiosMock.reset();
});

describe("Task component", () => {
  test("shows loading state initially", () => {
    // Mock a delayed response
    axiosMock.onGet("/api/v1/tasks/123").reply(() => {
      return new Promise(() => {
        // Never resolve to keep loading state
      });
    });

    renderTask();
    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  test("displays running task with progress", async () => {
    const runningTask = {
      id: "123",
      kind: "Snapshot",
      description: "Backing up /home/user",
      status: "RUNNING",
      startTime: "2023-01-01T10:00:00Z",
      endTime: null,
      progressInfo: "50% complete",
      counters: {
        files: { value: 100, units: "files", level: "info" },
        bytes: { value: 1024000, units: "bytes", level: "info" },
        errors: { value: 0, units: "errors", level: "error" },
      },
    };

    axiosMock.onGet("/api/v1/tasks/123").reply(200, runningTask);

    renderTask();

    await waitFor(() => {
      expect(screen.getByText(/Running for/)).toBeInTheDocument();
      expect(screen.getByText(/50% complete/)).toBeInTheDocument();
      expect(screen.getByText("Snapshot: Backing up /home/user")).toBeInTheDocument();
    });

    // Check counters are displayed
    expect(screen.getByText("files")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("bytes")).toBeInTheDocument();
  });

  test("displays successful task", async () => {
    const successTask = {
      id: "123",
      kind: "Maintenance",
      description: "Repository maintenance",
      status: "SUCCESS",
      startTime: "2023-01-01T10:00:00Z",
      endTime: "2023-01-01T10:05:00Z",
      progressInfo: "Completed",
      counters: {
        processed: { value: 500, units: "objects", level: "info" },
      },
    };

    axiosMock.onGet("/api/v1/tasks/123").reply(200, successTask);

    renderTask();

    await waitFor(() => {
      expect(screen.getByText(/Task succeeded after/)).toBeInTheDocument();
      expect(screen.getByText("Maintenance: Repository maintenance")).toBeInTheDocument();
    });
  });

  test("displays failed task with error message", async () => {
    const failedTask = {
      id: "123",
      kind: "Restore",
      description: "Restoring files",
      status: "FAILED",
      startTime: "2023-01-01T10:00:00Z",
      endTime: "2023-01-01T10:01:00Z",
      errorMessage: "Permission denied",
      counters: {},
    };

    axiosMock.onGet("/api/v1/tasks/123").reply(200, failedTask);

    renderTask();

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText(/Permission denied/)).toBeInTheDocument();
    });
  });

  test("displays cancel button for running task", async () => {
    const runningTask = {
      id: "123",
      kind: "Snapshot",
      description: "Backing up",
      status: "RUNNING",
      startTime: "2023-01-01T10:00:00Z",
      endTime: null,
      progressInfo: "In progress",
      counters: {},
    };

    axiosMock.onGet("/api/v1/tasks/123").reply(200, runningTask);

    renderTask({ navigate: true });

    await waitFor(() => {
      const stopButton = screen.getByRole("button", { name: /Stop/i });
      expect(stopButton).toBeInTheDocument();
    });
  });

  test("handles API error gracefully", async () => {
    axiosMock.onGet("/api/v1/tasks/123").reply(500, { message: "Server error" });

    renderTask();

    await waitFor(() => {
      expect(screen.getByText("Request failed with status code 500")).toBeInTheDocument();
    });
  });

  test("filters out zero value counters when showZeroCounters is false", async () => {
    const task = {
      id: "123",
      kind: "Snapshot",
      description: "Test task",
      status: "SUCCESS",
      startTime: "2023-01-01T10:00:00Z",
      endTime: "2023-01-01T10:05:00Z",
      counters: {
        files: { value: 100, units: "files", level: "info" },
        errors: { value: 0, units: "errors", level: "error" },
        warnings: { value: 0, units: "warnings", level: "warning" },
      },
    };

    axiosMock.onGet("/api/v1/tasks/123").reply(200, task);

    renderTask({ showZeroCounters: false });

    await waitFor(() => {
      expect(screen.getByText("files")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      // Zero value counters should not be shown
      expect(screen.queryByText("errors")).not.toBeInTheDocument();
      expect(screen.queryByText("warnings")).not.toBeInTheDocument();
    });
  });

  test("shows zero value counters when showZeroCounters is true", async () => {
    const task = {
      id: "123",
      kind: "Snapshot",
      description: "Test task",
      status: "SUCCESS",
      startTime: "2023-01-01T10:00:00Z",
      endTime: "2023-01-01T10:05:00Z",
      counters: {
        files: { value: 100, units: "files", level: "info" },
        errors: { value: 0, units: "errors", level: "error" },
        warnings: { value: 0, units: "warnings", level: "warning" },
      },
    };

    axiosMock.onGet("/api/v1/tasks/123").reply(200, task);

    renderTask({ showZeroCounters: true });

    await waitFor(() => {
      expect(screen.getByText("files")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      // Zero value counters should be shown when showZeroCounters is true
      expect(screen.getByText("errors")).toBeInTheDocument();
      expect(screen.getByText("warnings")).toBeInTheDocument();
      expect(screen.getAllByText("0")).toHaveLength(2);
    });
  });

  test("renders logs component with correct task ID", async () => {
    const task = {
      id: "123",
      kind: "Snapshot",
      description: "Test task",
      status: "SUCCESS",
      startTime: "2023-01-01T10:00:00Z",
      endTime: "2023-01-01T10:05:00Z",
      counters: {},
    };

    axiosMock.onGet("/api/v1/tasks/123").reply(200, task);

    renderTask();

    await waitFor(() => {
      expect(screen.getByTestId("logs-component")).toBeInTheDocument();
      expect(screen.getByText("Logs for task 123")).toBeInTheDocument();
    });
  });
});
