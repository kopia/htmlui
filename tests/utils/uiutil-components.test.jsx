import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock axios properly for vitest
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import {
  CLIEquivalent,
  GoBackButton,
  PolicyEditorLink,
  sizeWithFailures,
  taskStatusSymbol,
} from "../../src/utils/uiutil";
import axios from "axios";

// Helper to render components with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("CLIEquivalent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders terminal button initially", () => {
    render(<CLIEquivalent command="test command" />);
    const button = screen.getByTitle("Click to show CLI equivalent");
    expect(button).toBeInTheDocument();
  });

  it("shows CLI command when clicked", async () => {
    axios.get.mockResolvedValue({
      data: { executable: "kopia" },
    });

    render(<CLIEquivalent command="test command" />);
    
    const terminalButton = screen.getByTitle("Click to show CLI equivalent");
    fireEvent.click(terminalButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/cli");
    });

    await waitFor(() => {
      const input = screen.getByDisplayValue("kopia test command");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("readonly");
    });
  });

  it("shows copy button when CLI is visible", async () => {
    axios.get.mockResolvedValue({
      data: { executable: "kopia" },
    });

    render(<CLIEquivalent command="test command" />);
    
    const terminalButton = screen.getByTitle("Click to show CLI equivalent");
    fireEvent.click(terminalButton);

    await waitFor(() => {
      const copyButton = screen.getByTitle("Copy to clipboard");
      expect(copyButton).toBeInTheDocument();
    });
  });

  it("handles API error gracefully", () => {
    axios.get.mockRejectedValue(new Error("API Error"));

    render(<CLIEquivalent command="test command" />);
    
    const terminalButton = screen.getByTitle("Click to show CLI equivalent");
    fireEvent.click(terminalButton);

    // Should not crash and should still show the button
    expect(terminalButton).toBeInTheDocument();
  });
});

describe("GoBackButton", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders with correct text and icon", () => {
    renderWithRouter(<GoBackButton />);
    
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Return");
  });

  it("calls navigate(-1) when clicked", () => {
    renderWithRouter(<GoBackButton />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

describe("PolicyEditorLink", () => {
  it("renders link with correct URL and text", () => {
    const source = {
      userName: "john",
      host: "example.com",
      path: "/home/john",
    };

    renderWithRouter(<PolicyEditorLink {...source} />);
    
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("Directory: john@example.com:/home/john");
    expect(link).toHaveAttribute("href", expect.stringContaining("/policies/edit"));
    expect(link).toHaveAttribute("href", expect.stringContaining("userName=john"));
  });

  it("renders global policy link", () => {
    const source = {};

    renderWithRouter(<PolicyEditorLink {...source} />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Global Policy");
  });
});

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows running status with spinner", () => {
    const task = { ...baseTask, status: "RUNNING", endTime: null };
    const result = taskStatusSymbol(task);
    
    expect(result.type).toBe(React.Fragment);
    // The fragment contains multiple elements, check that it includes running text
    const children = result.props.children;
    expect(Array.isArray(children)).toBe(true);
    // Look for text content that includes "Running for"
    const hasRunningText = children.some(child => 
      typeof child === 'string' && child.includes('Running for')
    );
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
    const cancelButton = children.find(child => 
      child && typeof child === 'object' && child.type === 'button'
    );
    expect(cancelButton).toBeDefined();
    expect(cancelButton.props.onClick).toBeDefined();
  });
}); 