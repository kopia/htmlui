import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Logs } from "../../src/components/Logs";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import {
  setupIntervalMocks,
  cleanupIntervalMocks,
  triggerIntervals,
  getIntervalMockSpies,
} from "../testutils/interval-mocks";

describe("Logs Component", () => {
  let axiosMock;

  beforeEach(() => {
    // Create a new mock adapter instance for each test
    axiosMock = new MockAdapter(axios);

    // Mock scrollIntoView since it's not available in jsdom
    Element.prototype.scrollIntoView = vi.fn();

    // Setup interval mocking
    setupIntervalMocks();
  });

  afterEach(() => {
    // Clean up
    axiosMock.restore();
    cleanupIntervalMocks();
  });

  const mockLogsResponse = {
    logs: [
      {
        ts: 1672531200, // 2023-01-01 00:00:00
        msg: "First log message",
        level: "info",
        mod: "test-module",
      },
      {
        ts: 1672531260, // 2023-01-01 00:01:00
        msg: "Second log message",
        level: "warning",
        mod: "test-module",
      },
      {
        ts: 1672531320, // 2023-01-01 00:02:00
        msg: "Third log message with params",
        level: "error",
        mod: "test-module",
        user: "testuser",
        action: "delete",
      },
    ],
  };

  it("renders loading state initially", () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(() => {
      // Return a promise that never resolves to keep loading state
      return new Promise(() => {});
    });

    render(<Logs taskID="test-task-123" />);

    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  it("renders logs in a table after successful fetch", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, mockLogsResponse);

    render(<Logs taskID="test-task-123" />);

    // Wait for the logs to be loaded
    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    // Check that all log messages are rendered
    expect(screen.getByText(/First log message/)).toBeInTheDocument();
    expect(screen.getByText(/Second log message/)).toBeInTheDocument();
    expect(screen.getByText(/Third log message with params/)).toBeInTheDocument();
  });

  it("displays formatted time for each log entry", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, {
      logs: [
        {
          ts: 1672531200.123, // Include milliseconds
          msg: "Test message",
          level: "info",
        },
      ],
    });

    render(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      // The component formats time as HH:MM:SS.mmm
      // For timestamp 1672531200.123, depending on timezone
      const timeElement = screen.getByText(/Test message/).parentElement;
      expect(timeElement.textContent).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
    });
  });

  it("displays additional parameters as JSON", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, mockLogsResponse);

    render(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      // The third log entry has extra parameters that should be displayed as JSON
      const jsonParams = screen.getByText('{"user":"testuser","action":"delete"}');
      expect(jsonParams).toBeInTheDocument();
      expect(jsonParams.tagName).toBe("CODE");
    });
  });

  it("applies correct CSS classes based on log level", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, mockLogsResponse);

    const { container } = render(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      const rows = container.querySelectorAll("tr");
      expect(rows[0]).toHaveClass("loglevel-info");
      expect(rows[1]).toHaveClass("loglevel-warning");
      expect(rows[2]).toHaveClass("loglevel-error");
    });
  });

  it("handles API errors gracefully", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").networkError();

    render(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
    });
  });

  it("refreshes logs periodically", async () => {
    let callCount = 0;
    const responses = [
      { logs: [{ ts: 1672531200, msg: "Initial log", level: "info" }] },
      {
        logs: [
          { ts: 1672531200, msg: "Initial log", level: "info" },
          { ts: 1672531260, msg: "New log entry", level: "info" },
        ],
      },
    ];

    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(() => {
      const response = responses[Math.min(callCount, responses.length - 1)];
      callCount++;
      return [200, response];
    });

    render(<Logs taskID="test-task-123" />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/Initial log/)).toBeInTheDocument();
    });

    expect(callCount).toBe(1);

    // Trigger the interval callback manually
    await triggerIntervals();

    // Wait for the component to make another request
    await waitFor(() => {
      expect(callCount).toBe(2);
    });

    // The component should eventually display the new log
    await waitFor(() => {
      expect(screen.getByText(/New log entry/)).toBeInTheDocument();
    });
  });

  it("scrolls to bottom when new logs arrive", async () => {
    let callCount = 0;
    const responses = [
      { logs: [{ ts: 1672531200, msg: "First log", level: "info" }] },
      {
        logs: [
          { ts: 1672531200, msg: "First log", level: "info" },
          { ts: 1672531260, msg: "Second log", level: "info" },
        ],
      },
    ];

    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(() => {
      const response = responses[Math.min(callCount, responses.length - 1)];
      callCount++;
      return [200, response];
    });

    render(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.getByText(/First log/)).toBeInTheDocument();
    });

    // Clear the mock calls from initial render
    Element.prototype.scrollIntoView.mockClear();

    // Trigger the interval callback manually
    await triggerIntervals();

    // Wait for new logs to appear
    await waitFor(() => {
      expect(screen.getByText(/Second log/)).toBeInTheDocument();
    });

    // Verify scrollIntoView was called
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("doesn't scroll if no new logs arrive", async () => {
    const sameResponse = {
      logs: [{ ts: 1672531200, msg: "Same log", level: "info" }],
    };

    let callCount = 0;
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(() => {
      callCount++;
      return [200, sameResponse];
    });

    render(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.getByText(/Same log/)).toBeInTheDocument();
    });

    const initialCallCount = callCount;

    // Clear the mock calls from initial render
    Element.prototype.scrollIntoView.mockClear();

    // Trigger the interval callback manually
    await triggerIntervals();

    // Wait for another fetch to happen
    await waitFor(() => {
      expect(callCount).toBeGreaterThan(initialCallCount);
    });

    // scrollIntoView should not be called since logs didn't change
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("clears interval on unmount", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, mockLogsResponse);

    const { unmount } = render(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.getByText(/First log message/)).toBeInTheDocument();
    });

    // Unmount the component
    unmount();

    // Verify clearInterval was called
    const { clearIntervalSpy } = getIntervalMockSpies();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("handles empty logs gracefully", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, { logs: [] });

    const { container } = render(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    // Should render an empty table
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelectorAll("tbody tr")).toHaveLength(0);
  });

  it("shows full timestamp on hover", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, {
      logs: [
        {
          ts: 1672531200,
          msg: "Hover test message",
          level: "info",
        },
      ],
    });

    const { container } = render(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.getByText(/Hover test message/)).toBeInTheDocument();
    });

    // Find the td element with class "elide" that contains the title
    const cell = container.querySelector("td.elide");
    expect(cell).toBeTruthy();

    const title = cell.getAttribute("title");
    expect(title).toBeTruthy();
    expect(title).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});
