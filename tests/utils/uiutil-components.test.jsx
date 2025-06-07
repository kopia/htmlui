import React from "react";
import "@testing-library/jest-dom";

import { sizeWithFailures } from "../../src/utils/uiutil";
import { taskStatusSymbol } from "../../src/utils/taskutil";

describe("sizeWithFailures", () => {
  it("returns empty string for undefined size", () => {
    expect(sizeWithFailures(undefined)).toBe("");
  });

  it("returns simple size display without errors", () => {
    const result = sizeWithFailures(1024, null, false);
    expect(result.props.children).toBe("1 KB");
  });

  it("returns simple size display when no failures", () => {
    const summ = { errors: [], numFailed: 0 };
    const result = sizeWithFailures(1024, summ, false);
    expect(result.props.children).toBe("1 KB");
  });

  it("shows error icon when there are failures", () => {
    const summ = {
      errors: [{ path: "/test", error: "Permission denied" }],
      numFailed: 1,
    };
    const result = sizeWithFailures(1024, summ, false);

    // Should be a span containing size, nbsp, and error icon
    expect(result.type).toBe("span");
    expect(result.props.children).toHaveLength(3);
    // First child should be the size, second is nbsp, third is the icon
    expect(result.props.children[0]).toBe("1 KB");
  });

  it("formats multiple errors correctly", () => {
    const summ = {
      errors: [
        { path: "/test1", error: "Error 1" },
        { path: "/test2", error: "Error 2" },
      ],
      numFailed: 2,
    };
    const result = sizeWithFailures(1024, summ, false);

    expect(result.type).toBe("span");
    // Check that error icon has the correct title format
    const errorIcon = result.props.children[2]; // Third element is the icon
    expect(errorIcon.props.title).toContain("Encountered 2 errors:");
    expect(errorIcon.props.title).toContain("- /test1: Error 1");
    expect(errorIcon.props.title).toContain("- /test2: Error 2");
  });

  it("formats single error without prefix", () => {
    const summ = {
      errors: [{ path: "/test", error: "Single error" }],
      numFailed: 1,
    };
    const result = sizeWithFailures(1024, summ, false);

    const errorIcon = result.props.children[2]; // Third element is the icon
    expect(errorIcon.props.title).toContain("Error: ");
    expect(errorIcon.props.title).toContain("/test: Single error");
    expect(errorIcon.props.title).not.toContain("- /test");
  });
});

describe("taskStatusSymbol", () => {
  const baseTask = {
    id: "task-123",
    startTime: "2023-01-01T12:00:00Z",
    endTime: "2023-01-01T12:01:30Z",
  };

  it("shows running status with spinner", () => {
    const task = { ...baseTask, status: "RUNNING", endTime: null };
    const result = taskStatusSymbol(task);

    expect(result.type).toBe(React.Fragment);
    // The fragment contains multiple elements, check that it includes running text
    const children = result.props.children;
    expect(Array.isArray(children)).toBe(true);
    // Look for text content that includes "Running for"
    const hasRunningText = children.some((child) => typeof child === "string" && child.includes("Running for"));
    expect(hasRunningText).toBe(true);
  });

  it("shows success status with check icon", () => {
    const task = { ...baseTask, status: "SUCCESS" };
    const result = taskStatusSymbol(task);

    expect(result.type).toBe("p");
    expect(result.props.children[1]).toContain("Finished in");
  });

  it("shows failed status with error icon", () => {
    const task = { ...baseTask, status: "FAILED" };
    const result = taskStatusSymbol(task);

    expect(result.type).toBe("p");
    expect(result.props.children[1]).toContain("Failed after");
  });

  it("shows canceled status with ban icon", () => {
    const task = { ...baseTask, status: "CANCELED" };
    const result = taskStatusSymbol(task);

    expect(result.type).toBe("p");
    expect(result.props.children[1]).toContain("Canceled after");
  });

  it("returns status string for unknown status", () => {
    const task = { ...baseTask, status: "UNKNOWN" };
    const result = taskStatusSymbol(task);

    expect(result).toBe("UNKNOWN");
  });

  it("includes cancel button for running tasks", () => {
    const task = { ...baseTask, status: "RUNNING", endTime: null };
    const result = taskStatusSymbol(task);

    // Should have a cancel button somewhere in the children
    const children = result.props.children;
    const cancelButton = children.find((child) => child && typeof child === "object" && child.type === "button");
    expect(cancelButton).toBeDefined();
    expect(cancelButton.props.onClick).toBeDefined();
  });
});
