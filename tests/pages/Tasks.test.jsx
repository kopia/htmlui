import React from "react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tasks } from "../../src/pages/Tasks";
import { UIPreferencesContext } from "../../src/contexts/UIPreferencesContext";
import { setupAPIMock } from "../testutils/api-mocks";
import "@testing-library/jest-dom";
import { fireEvent } from "@testing-library/react";
import { setupIntervalMocks, cleanupIntervalMocks, triggerIntervals } from "../testutils/interval-mocks";

let axiosMock;

// Mock react-router-dom Link component using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock({ components: { only: true } })();
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
 * Helper function to render Tasks component with necessary providers
 */
const renderTasks = () => {
  return render(
    <UIPreferencesContext.Provider value={mockUIPreferences}>
      <Tasks />
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

  // Setup interval mocking
  setupIntervalMocks();
});

/**
 * Clean up after each test
 */
afterEach(() => {
  axiosMock.reset();
  cleanupIntervalMocks();
});

describe("Tasks component", () => {
  test("shows loading state initially", () => {
    // Mock a delayed response
    axiosMock.onGet("/api/v1/tasks").reply(() => {
      return new Promise(() => {
        // Never resolve to keep loading state
      });
    });

    renderTasks();
    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  test("shows info message when no tasks exist", async () => {
    axiosMock.onGet("/api/v1/tasks").reply(200, { tasks: [] });

    renderTasks();

    await waitFor(() => {
      expect(
        screen.getByText(/A list of tasks will appear here when you create snapshots, restore, run maintenance, etc./),
      ).toBeInTheDocument();
    });
  });

  test("displays tasks in table", async () => {
    const tasks = [
      {
        id: "task1",
        kind: "Snapshot",
        description: "Backing up /home/user",
        status: "SUCCESS",
        startTime: "2023-01-01T10:00:00Z",
      },
      {
        id: "task2",
        kind: "Maintenance",
        description: "Repository maintenance",
        status: "RUNNING",
        startTime: "2023-01-01T11:00:00Z",
      },
    ];

    axiosMock.onGet("/api/v1/tasks").reply(200, { tasks });

    renderTasks();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Backing up /home/user")).toBeInTheDocument();
      expect(screen.getByText("Repository maintenance")).toBeInTheDocument();
    });
  });

  test("filters tasks by status", async () => {
    const tasks = [
      {
        id: "task1",
        kind: "Snapshot",
        description: "Task 1",
        status: "SUCCESS",
        startTime: "2023-01-01T10:00:00Z",
      },
      {
        id: "task2",
        kind: "Maintenance",
        description: "Task 2",
        status: "RUNNING",
        startTime: "2023-01-01T11:00:00Z",
      },
      {
        id: "task3",
        kind: "Restore",
        description: "Task 3",
        status: "FAILED",
        startTime: "2023-01-01T12:00:00Z",
      },
    ];

    axiosMock.onGet("/api/v1/tasks").reply(200, { tasks });

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
      expect(screen.getByText("Task 3")).toBeInTheDocument();
    });

    // Click on the status dropdown
    const statusDropdown = screen.getByText("Status: All");
    await userEvent.click(statusDropdown);

    // Select "Running" status
    const runningOption = screen.getByText("Running");
    await userEvent.click(runningOption);

    // Should only show running tasks
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.queryByText("Task 3")).not.toBeInTheDocument();
  });

  test("filters tasks by kind", async () => {
    const tasks = [
      {
        id: "task1",
        kind: "Snapshot",
        description: "Snapshot task",
        status: "SUCCESS",
        startTime: "2023-01-01T10:00:00Z",
      },
      {
        id: "task2",
        kind: "Maintenance",
        description: "Maintenance task",
        status: "SUCCESS",
        startTime: "2023-01-01T11:00:00Z",
      },
      {
        id: "task3",
        kind: "Restore",
        description: "Restore task",
        status: "SUCCESS",
        startTime: "2023-01-01T12:00:00Z",
      },
    ];

    axiosMock.onGet("/api/v1/tasks").reply(200, { tasks });

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText("Snapshot task")).toBeInTheDocument();
      expect(screen.getByText("Maintenance task")).toBeInTheDocument();
      expect(screen.getByText("Restore task")).toBeInTheDocument();
    });

    // Click on the kind dropdown
    const kindDropdown = screen.getByText("Kind: All");
    await userEvent.click(kindDropdown);

    // Select "Snapshot" kind - use getAllByText since there are multiple elements
    const snapshotOptions = screen.getAllByText("Snapshot");
    // Click on the dropdown option (not the table content)
    const dropdownOption = snapshotOptions.find((el) => el.classList.contains("dropdown-item"));
    await userEvent.click(dropdownOption);

    // Should only show snapshot tasks
    expect(screen.getByText("Snapshot task")).toBeInTheDocument();
    expect(screen.queryByText("Maintenance task")).not.toBeInTheDocument();
    expect(screen.queryByText("Restore task")).not.toBeInTheDocument();
  });

  test("filters tasks by description search", async () => {
    const tasks = [
      {
        id: "task1",
        kind: "Snapshot",
        description: "Backing up important files",
        status: "SUCCESS",
        startTime: "2023-01-01T10:00:00Z",
      },
      {
        id: "task2",
        kind: "Snapshot",
        description: "Backing up documents",
        status: "SUCCESS",
        startTime: "2023-01-01T11:00:00Z",
      },
      {
        id: "task3",
        kind: "Maintenance",
        description: "Repository cleanup",
        status: "SUCCESS",
        startTime: "2023-01-01T12:00:00Z",
      },
    ];

    axiosMock.onGet("/api/v1/tasks").reply(200, { tasks });

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText("Backing up important files")).toBeInTheDocument();
      expect(screen.getByText("Backing up documents")).toBeInTheDocument();
      expect(screen.getByText("Repository cleanup")).toBeInTheDocument();
    });

    // Search for "documents"
    const searchInput = screen.getByPlaceholderText("case-sensitive search description");
    fireEvent.change(searchInput, { target: { value: "documents" } });

    // Should only show tasks with "documents" in description
    expect(screen.queryByText("Backing up important files")).not.toBeInTheDocument();
    expect(screen.getByText("Backing up documents")).toBeInTheDocument();
    expect(screen.queryByText("Repository cleanup")).not.toBeInTheDocument();
  });

  test("combines multiple filters", async () => {
    const tasks = [
      {
        id: "task1",
        kind: "Snapshot",
        description: "Backing up files",
        status: "SUCCESS",
        startTime: "2023-01-01T10:00:00Z",
      },
      {
        id: "task2",
        kind: "Snapshot",
        description: "Backing up files",
        status: "RUNNING",
        startTime: "2023-01-01T11:00:00Z",
      },
      {
        id: "task3",
        kind: "Maintenance",
        description: "Backing up files",
        status: "RUNNING",
        startTime: "2023-01-01T12:00:00Z",
      },
    ];

    axiosMock.onGet("/api/v1/tasks").reply(200, { tasks });

    renderTasks();

    await waitFor(() => {
      expect(screen.getAllByText("Backing up files")).toHaveLength(3);
    });

    // Set status filter to "Running"
    const statusDropdown = screen.getByText("Status: All");
    await userEvent.click(statusDropdown);
    await userEvent.click(screen.getByText("Running"));

    // Set kind filter to "Snapshot"
    const kindDropdown = screen.getByText("Kind: All");
    await userEvent.click(kindDropdown);
    await userEvent.click(screen.getAllByText("Snapshot")[0]); // Use getAllByText and select the first one

    // Should only show task2 (Snapshot + Running)
    expect(screen.getAllByText("Backing up files")).toHaveLength(1);
    const table = screen.getByRole("table");
    // Count data rows (excluding header row)
    const rows = table.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(1);
  });

  test("handles API error gracefully", async () => {
    axiosMock.onGet("/api/v1/tasks").reply(500, { message: "Server error" });

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText("Request failed with status code 500")).toBeInTheDocument();
    });
  });

  test("refreshes tasks periodically", async () => {
    const initialTasks = [
      {
        id: "task1",
        kind: "Snapshot",
        description: "Initial task",
        status: "RUNNING",
        startTime: "2023-01-01T10:00:00Z",
      },
    ];

    const updatedTasks = [
      {
        id: "task1",
        kind: "Snapshot",
        description: "Initial task",
        status: "SUCCESS",
        startTime: "2023-01-01T10:00:00Z",
      },
      {
        id: "task2",
        kind: "Maintenance",
        description: "New task",
        status: "RUNNING",
        startTime: "2023-01-01T10:05:00Z",
      },
    ];

    // First response
    axiosMock.onGet("/api/v1/tasks").replyOnce(200, { tasks: initialTasks });

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText("Initial task")).toBeInTheDocument();
    });

    // Update mock for next request
    axiosMock.onGet("/api/v1/tasks").reply(200, { tasks: updatedTasks });

    // Trigger the interval callback manually
    await triggerIntervals();

    // Wait for the new task to appear
    await waitFor(() => {
      expect(screen.getByText("New task")).toBeInTheDocument();
    });
  });

  test("task links are rendered with correct structure", async () => {
    // Since we're mocking react-router-dom Link to render as <a href="#">,
    // we can't test the actual routing, but we can test the link structure
    const tasks = [
      {
        id: "task123",
        kind: "Snapshot",
        description: "Test task",
        status: "SUCCESS",
        startTime: "2023-01-01T10:00:00Z",
      },
    ];

    axiosMock.onGet("/api/v1/tasks").reply(200, { tasks });

    renderTasks();

    await waitFor(() => {
      // The real KopiaTable renders links in the task cells
      const links = screen.getAllByRole("link");
      // At least one link should exist
      expect(links.length).toBeGreaterThan(0);
      // The link text should be a relative time (from moment.js)
      // Since the test data uses 2023-01-01, it will show something like "3 years ago"
      const linkText = links[0].textContent;
      expect(linkText).toMatch(/\d+ years? ago/);
    });
  });
});
