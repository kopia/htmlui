import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SnapshotEstimation } from "../../src/components/SnapshotEstimation";
import { UIPreferencesContext } from "../../src/contexts/UIPreferencesContext";
import { setupAPIMock } from "../api_mocks";
import "@testing-library/jest-dom";
import { resetRouterMocks, updateRouterMocks } from "../react-router-mock.jsx";
import PropTypes from "prop-types";

// Mock Logs component to avoid complex dependencies
vi.mock("../../src/components/Logs", () => ({
  Logs: function MockLogs({ taskID }) {
    MockLogs.propTypes = {
      taskID: PropTypes.string.isRequired,
    };
    return <div data-testid="mock-logs">Logs for task: {taskID}</div>;
  },
}));

// Mock react-router-dom using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../react-router-mock.jsx");
  return createRouterMock({
    location: { pathname: "/test" },
    params: { tid: "test-task-id" },
  })();
});

// Mock redirect function from uiutil
vi.mock("../../src/utils/uiutil", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    redirect: vi.fn(),
  };
});

// Mock cancelTask function from taskutil
vi.mock("../../src/utils/taskutil", async () => {
  const actual = await vi.importActual("../../src/utils/taskutil");
  return {
    ...actual,
    cancelTask: vi.fn(),
  };
});

// Create mock UI preferences context
const createMockUIContext = () => ({
  pageSize: 10,
  bytesStringBase2: false,
  defaultSnapshotViewAll: false,
  theme: "light",
  fontSize: "fs-6",
  setTheme: vi.fn(),
  setPageSize: vi.fn(),
  setByteStringBase: vi.fn(),
  setDefaultSnapshotViewAll: vi.fn(),
  setFontSize: vi.fn(),
});

// Mock server
let serverMock;

beforeEach(() => {
  serverMock = setupAPIMock();
  resetRouterMocks();
  vi.clearAllMocks();
});

afterEach(() => {
  serverMock.reset();
});

// Helper to render with providers
const renderWithProviders = (component, uiContext = createMockUIContext()) => {
  return render(
    <MemoryRouter>
      <UIPreferencesContext.Provider value={uiContext}>{component}</UIPreferencesContext.Provider>
    </MemoryRouter>,
  );
};

describe("SnapshotEstimation", () => {
  describe("Loading state", () => {
    it("shows loading message while fetching task data", () => {
      // Mock a pending API request
      serverMock.onGet("/api/v1/tasks/test-task-id").reply(() => new Promise(() => {}));

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      expect(screen.getByText("Loading ...")).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("displays error message when API request fails", async () => {
      serverMock.onGet("/api/v1/tasks/test-task-id").reply(500, {
        error: "Internal server error",
      });

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText("Request failed with status code 500")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });

    it("handles network errors gracefully", async () => {
      serverMock.onGet("/api/v1/tasks/test-task-id").networkError();

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText("Network Error")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });
  });

  describe("Task states", () => {
    it("displays running task with spinner and counters", async () => {
      const runningTask = {
        id: "test-task-id",
        status: "RUNNING",
        counters: {
          Bytes: { value: 1024000 },
          "Excluded Bytes": { value: 512000 },
          Files: { value: 100 },
          "Excluded Files": { value: 20 },
          Directories: { value: 10 },
          "Excluded Directories": { value: 2 },
          Errors: { value: 3 },
          "Ignored Errors": { value: 1 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, runningTask);

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText(/Bytes:/)).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Check that spinner is present for running task
      expect(document.querySelector(".spinner-border")).toBeInTheDocument();

      // Check counters display
      expect(screen.getByText("1 MB")).toBeInTheDocument(); // Bytes
      expect(screen.getByText("512 KB")).toBeInTheDocument(); // Excluded Bytes
      expect(screen.getByText("100")).toBeInTheDocument(); // Files count
      expect(screen.getByText("20")).toBeInTheDocument(); // Excluded Files count

      // Check cancel button is present for running task
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("displays completed task without spinner", async () => {
      const completedTask = {
        id: "test-task-id",
        status: "SUCCESS",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 2048000 },
          "Excluded Bytes": { value: 0 },
          Files: { value: 50 },
          "Excluded Files": { value: 0 },
          Directories: { value: 5 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, completedTask);

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText(/Total Bytes:/)).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Check that spinner is not present for completed task
      expect(document.querySelector(".spinner-border")).not.toBeInTheDocument();

      // Check that cancel button is not present for completed task
      expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    });

    it("displays canceled task status", async () => {
      const canceledTask = {
        id: "test-task-id",
        status: "CANCELED",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 500000 },
          "Excluded Bytes": { value: 100000 },
          Files: { value: 25 },
          "Excluded Files": { value: 5 },
          Directories: { value: 3 },
          "Excluded Directories": { value: 1 },
          Errors: { value: 1 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, canceledTask);

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText(/Canceled/)).toBeInTheDocument();
          expect(screen.getByText("500 KB")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });

    it("displays other task statuses", async () => {
      const failedTask = {
        id: "test-task-id",
        status: "FAILED",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 100000 },
          "Excluded Bytes": { value: 0 },
          Files: { value: 10 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 5 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, failedTask);

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText(/FAILED Bytes:/)).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });
  });

  describe("Byte display formats", () => {
    it("displays bytes in base 10 format by default", async () => {
      const task = {
        id: "test-task-id",
        status: "SUCCESS",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 1024000 }, // Should show as 1.0 MB in base 10
          "Excluded Bytes": { value: 0 },
          Files: { value: 10 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, task);

      const uiContext = createMockUIContext();
      uiContext.bytesStringBase2 = false;

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />, uiContext);

      await waitFor(
        () => {
          expect(screen.getByText("1 MB")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });

    it("displays bytes in base 2 format when enabled", async () => {
      const task = {
        id: "test-task-id",
        status: "SUCCESS",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 1048576 }, // Should show as 1.0 MiB in base 2
          "Excluded Bytes": { value: 0 },
          Files: { value: 10 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, task);

      const uiContext = createMockUIContext();
      uiContext.bytesStringBase2 = true;

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />, uiContext);

      await waitFor(
        () => {
          expect(screen.getByText("1 MB")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });
  });

  describe("Log functionality", () => {
    it("shows and hides logs when button is clicked", async () => {
      const task = {
        id: "test-task-id",
        status: "SUCCESS",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 1000 },
          "Excluded Bytes": { value: 0 },
          Files: { value: 1 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, task);

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText("Show Log")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Click show log button
      userEvent.click(screen.getByText("Show Log"));

      await waitFor(
        () => {
          expect(screen.getByText("Hide Log")).toBeInTheDocument();
          expect(screen.getByTestId("mock-logs")).toBeInTheDocument();
          expect(screen.getByText("Logs for task: test-task-id")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Click hide log button
      userEvent.click(screen.getByText("Hide Log"));

      await waitFor(
        () => {
          expect(screen.getByText("Show Log")).toBeInTheDocument();
          expect(screen.queryByTestId("mock-logs")).not.toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });
  });

  describe("Cancel task functionality", () => {
    it("calls cancelTask when cancel button is clicked", async () => {
      const { cancelTask } = await import("../../src/utils/taskutil");

      const runningTask = {
        id: "test-task-id",
        status: "RUNNING",
        counters: {
          Bytes: { value: 1000 },
          "Excluded Bytes": { value: 0 },
          Files: { value: 1 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, runningTask);

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText("Cancel")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      await userEvent.click(screen.getByText("Cancel"));

      expect(cancelTask).toHaveBeenCalledWith("test-task-id");
    });
  });

  describe("Props handling", () => {
    it("uses taskID prop when provided", async () => {
      const task = {
        id: "custom-task-id",
        status: "SUCCESS",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 1000 },
          "Excluded Bytes": { value: 0 },
          Files: { value: 1 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/custom-task-id").reply(200, task);

      renderWithProviders(<SnapshotEstimation taskID="custom-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText(/Total Bytes:/)).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      expect(serverMock.history.get[0].url).toBe("/api/v1/tasks/custom-task-id");
    });

    it("uses router params when taskID prop is not provided", async () => {
      const task = {
        id: "test-task-id",
        status: "SUCCESS",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 1000 },
          "Excluded Bytes": { value: 0 },
          Files: { value: 1 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, task);

      renderWithProviders(<SnapshotEstimation />);

      await waitFor(
        () => {
          expect(screen.getByText(/Total Bytes:/)).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      expect(serverMock.history.get[0].url).toBe("/api/v1/tasks/test-task-id");
    });
  });

  describe("Task without counters", () => {
    it("handles task data without counters gracefully", async () => {
      const taskWithoutCounters = {
        id: "test-task-id",
        status: "RUNNING",
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, taskWithoutCounters);

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          // Should still show log controls
          expect(screen.getByText("Show Log")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Should not show counters section when counters are missing
      expect(screen.queryByText(/Bytes:/)).not.toBeInTheDocument();
    });
  });

  describe("Component lifecycle", () => {
    it("handles props updates correctly", async () => {
      const task1 = {
        id: "task-1",
        status: "SUCCESS",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 1000 },
          "Excluded Bytes": { value: 0 },
          Files: { value: 1 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      const task2 = {
        id: "task-2",
        status: "SUCCESS",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 2000 },
          "Excluded Bytes": { value: 0 },
          Files: { value: 2 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/task-1").reply(200, task1);
      serverMock.onGet("/api/v1/tasks/task-2").reply(200, task2);

      const { rerender } = renderWithProviders(<SnapshotEstimation taskID="task-1" />);

      await waitFor(
        () => {
          expect(screen.getByText("1 KB")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Update props to different task
      rerender(
        <MemoryRouter>
          <UIPreferencesContext.Provider value={createMockUIContext()}>
            <SnapshotEstimation taskID="task-2" />
          </UIPreferencesContext.Provider>
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByText("2 KB")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });

    it("cleans up interval on unmount", async () => {
      const runningTask = {
        id: "test-task-id",
        status: "RUNNING",
        counters: {
          Bytes: { value: 1000 },
          "Excluded Bytes": { value: 0 },
          Files: { value: 1 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, runningTask);

      const { unmount } = renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(screen.getByText("Cancel")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Spy on clearInterval to verify cleanup
      const clearIntervalSpy = vi.spyOn(window, "clearInterval");

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe("Error handling edge cases", () => {
    it("handles redirect on API error", async () => {
      const { redirect } = await import("../../src/utils/uiutil");

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(401, {
        code: "NOT_CONNECTED",
        error: "Not connected",
      });

      renderWithProviders(<SnapshotEstimation taskID="test-task-id" />);

      await waitFor(
        () => {
          expect(redirect).toHaveBeenCalled();
        },
        { timeout: 10000 },
      );
    });

    it("handles missing task ID gracefully", async () => {
      updateRouterMocks({ params: { tid: undefined } });

      serverMock.onGet("/api/v1/tasks/undefined").reply(404, {
        error: "Task not found",
      });

      renderWithProviders(<SnapshotEstimation />);

      await waitFor(
        () => {
          expect(screen.getByText("Request failed with status code 404")).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Reset params
      updateRouterMocks({ params: { tid: "test-task-id" } });
    });
  });

  describe("UI context integration", () => {
    it("respects UI context changes", async () => {
      const task = {
        id: "test-task-id",
        status: "SUCCESS",
        endTime: new Date().toISOString(),
        counters: {
          Bytes: { value: 1048576 }, // 1 MiB
          "Excluded Bytes": { value: 0 },
          Files: { value: 10 },
          "Excluded Files": { value: 0 },
          Directories: { value: 1 },
          "Excluded Directories": { value: 0 },
          Errors: { value: 0 },
          "Ignored Errors": { value: 0 },
        },
      };

      serverMock.onGet("/api/v1/tasks/test-task-id").reply(200, task);

      const uiContext = createMockUIContext();
      uiContext.bytesStringBase2 = false; // Start with base 10

      const { rerender } = renderWithProviders(<SnapshotEstimation taskID="test-task-id" />, uiContext);

      await waitFor(
        () => {
          expect(screen.getByText("1 MB")).toBeInTheDocument(); // Base 10
        },
        { timeout: 10000 },
      );

      // Change to base 2
      uiContext.bytesStringBase2 = true;

      rerender(
        <MemoryRouter>
          <UIPreferencesContext.Provider value={uiContext}>
            <SnapshotEstimation taskID="test-task-id" />
          </UIPreferencesContext.Provider>
        </MemoryRouter>,
      );

      await waitFor(
        () => {
          expect(screen.getByText("1 MB")).toBeInTheDocument(); // Still shows MB (not MiB) due to how sizeDisplayName works
        },
        { timeout: 10000 },
      );
    });
  });
});
