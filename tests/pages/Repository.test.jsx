import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Repository } from "../../src/pages/Repository";
import { setupAPIMock } from "../testutils/api-mocks";
import { AppContext } from "../../src/contexts/AppContext";
import { vi } from "vitest";
import "@testing-library/jest-dom";

let axiosMock;

// Mock child components to keep tests focused on Repository logic
vi.mock("../../src/components/SetupRepository", () => ({
  SetupRepository: () => <div>Setup Repository Component</div>,
}));

vi.mock("../../src/components/Logs", () => ({
  // eslint-disable-next-line react/prop-types
  Logs: ({ taskID }) => <div>Logs for task {taskID}</div>,
}));

vi.mock("../../src/utils/taskutil", async () => {
  const actual = await vi.importActual("../../src/utils/taskutil");
  return {
    ...actual,
    cancelTask: vi.fn(),
  };
});

// Mock context value
const mockContextValue = {
  repositoryUpdated: vi.fn(),
  repositoryDescriptionUpdated: vi.fn(),
  repoDescription: "Test Repository",
};

// Common test data
const connectedStatus = {
  connected: true,
  description: "My Test Repository",
  readonly: false,
  configFile: "/path/to/config",
  storage: "filesystem",
  encryption: "AES256-GCM-HMAC-SHA256",
  hash: "BLAKE2B-256",
  splitter: "DYNAMIC-4M-BUZHASH",
  formatVersion: "1",
  eccOverheadPercent: 10,
  ecc: "REED-SOLOMON",
  supportsContentCompression: true,
  username: "testuser",
  hostname: "testhost",
};

// Helper function to render Repository with context
const renderWithContext = (contextValue = mockContextValue) => {
  return render(
    <AppContext.Provider value={contextValue}>
      <Repository />
    </AppContext.Provider>,
  );
};

/**
 * Setup API mocks before each test
 */
beforeEach(() => {
  axiosMock = setupAPIMock();
  // Clear all mocks
  vi.clearAllMocks();
});

/**
 * Clean up after each test
 */
afterEach(() => {
  axiosMock.reset();
});

describe("Repository component - loading state", () => {
  test("shows loading spinner initially", () => {
    // Mock a delayed response
    axiosMock.onGet("/api/v1/repo/status").reply(() => {
      return new Promise(() => {
        // Never resolve to keep loading state
      });
    });

    renderWithContext();
    // React Bootstrap spinner has this specific class
    const spinner = document.querySelector(".spinner-border");
    expect(spinner).toBeInTheDocument();
  });

  test("handles API error gracefully", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(500, { message: "Server error" });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Request failed with status code 500")).toBeInTheDocument();
    });
  });
});

describe("Repository component - connected state", () => {
  test("displays connected repository information", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, connectedStatus);

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Connected To Repository")).toBeInTheDocument();
      expect(screen.getByDisplayValue("My Test Repository")).toBeInTheDocument();
      expect(screen.getByDisplayValue("filesystem")).toBeInTheDocument();
      expect(screen.getByDisplayValue("AES256-GCM-HMAC-SHA256")).toBeInTheDocument();
      expect(screen.getByDisplayValue("BLAKE2B-256")).toBeInTheDocument();
      expect(screen.getByDisplayValue("DYNAMIC-4M-BUZHASH")).toBeInTheDocument();
      expect(screen.getByDisplayValue("10%")).toBeInTheDocument();
      expect(screen.getByDisplayValue("REED-SOLOMON")).toBeInTheDocument();
      expect(screen.getByDisplayValue("yes")).toBeInTheDocument();
      expect(screen.getByDisplayValue("testuser@testhost")).toBeInTheDocument();
    });

    expect(mockContextValue.repositoryDescriptionUpdated).toHaveBeenCalledWith("My Test Repository");
  });

  test("displays readonly badge when repository is readonly", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, {
      ...connectedStatus,
      readonly: true,
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Repository is read-only")).toBeInTheDocument();
    });
  });

  test("displays server URL when connected via API server", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, {
      ...connectedStatus,
      apiServerURL: "https://api.example.com",
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByDisplayValue("https://api.example.com")).toBeInTheDocument();
      // Should not display other config details when using API server
      expect(screen.queryByDisplayValue("filesystem")).not.toBeInTheDocument();
    });
  });

  test("updates repository description", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, connectedStatus);
    axiosMock.onPost("/api/v1/repo/description").reply(200, {
      description: "Updated Description",
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByDisplayValue("My Test Repository")).toBeInTheDocument();
    });

    // Change description
    const descriptionInput = screen.getByDisplayValue("My Test Repository");
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, "Updated Description");

    // Click update button
    const updateButton = screen.getByTestId("update-description");
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(mockContextValue.repositoryDescriptionUpdated).toHaveBeenCalledWith("Updated Description");
    });
  });

  test("shows validation error when description is empty", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, {
      ...connectedStatus,
      description: "",
    });

    renderWithContext();

    await waitFor(() => {
      // Get the description input specifically by its name attribute
      const descriptionInput = screen.getByDisplayValue(""); // Empty value
      expect(descriptionInput).toHaveAttribute("name", "status.description");
      expect(descriptionInput).toHaveClass("is-invalid");
      expect(screen.getByText("Description Is Required")).toBeInTheDocument();
    });
  });

  test("disconnects from repository", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, connectedStatus);
    axiosMock.onPost("/api/v1/repo/disconnect").reply(200, {});

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByTestId("disconnect")).toBeInTheDocument();
    });

    const disconnectButton = screen.getByTestId("disconnect");
    await userEvent.click(disconnectButton);

    await waitFor(() => {
      expect(mockContextValue.repositoryUpdated).toHaveBeenCalledWith(false);
    });
  });

  test("displays disabled ECC when eccOverheadPercent is 0", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, {
      ...connectedStatus,
      eccOverheadPercent: 0,
      ecc: null,
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByDisplayValue("Disabled")).toBeInTheDocument();
      expect(screen.getByDisplayValue("-")).toBeInTheDocument();
    });
  });
});

describe("Repository component - initializing state", () => {
  test("shows initializing state with task ID", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, {
      connected: false,
      initTaskID: "task-123",
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Initializing Repository...")).toBeInTheDocument();
      expect(screen.getByText("Show Log")).toBeInTheDocument();
    });
  });

  test("toggles log display during initialization", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, {
      connected: false,
      initTaskID: "task-123",
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Show Log")).toBeInTheDocument();
    });

    // Click to show log
    const showLogButton = screen.getByText("Show Log");
    await userEvent.click(showLogButton);

    expect(screen.getByText("Hide Log")).toBeInTheDocument();

    // Click to hide log
    const hideLogButton = screen.getByText("Hide Log");
    await userEvent.click(hideLogButton);

    expect(screen.getByText("Show Log")).toBeInTheDocument();
  });

  test("cancels connection during initialization", async () => {
    // Import the mocked cancelTask
    const { cancelTask } = await import("../../src/utils/taskutil");

    axiosMock.onGet("/api/v1/repo/status").reply(200, {
      connected: false,
      initTaskID: "task-123",
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Cancel Connection")).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("Cancel Connection");
    await userEvent.click(cancelButton);

    // Verify cancelTask was called with correct task ID
    expect(cancelTask).toHaveBeenCalledWith("task-123");
  });

  test("polls for status during initialization", async () => {
    let callCount = 0;
    axiosMock.onGet("/api/v1/repo/status").reply(() => {
      callCount++;
      if (callCount === 1) {
        return [200, { connected: false, initTaskID: "task-123" }];
      } else {
        return [200, { connected: true, description: "Connected!", ...connectedStatus }];
      }
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Initializing Repository...")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.getByText("Connected To Repository")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});

describe("Repository component - disconnected state", () => {
  test("shows SetupRepository component when not connected", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, {
      connected: false,
      initTaskID: null,
    });

    renderWithContext();

    await waitFor(() => {
      // SetupRepository component should be rendered
      // We're not testing its internals, just that it's rendered
      expect(screen.queryByText("Connected To Repository")).not.toBeInTheDocument();
      expect(screen.queryByText("Initializing Repository...")).not.toBeInTheDocument();
    });
  });
});

describe("Repository component - CLI equivalent", () => {
  test("displays CLI equivalent command", async () => {
    axiosMock.onGet("/api/v1/repo/status").reply(200, connectedStatus);

    renderWithContext();

    await waitFor(() => {
      // Look for the terminal button that CLIEquivalent renders
      expect(screen.getByTestId("show-cli-button")).toBeInTheDocument();
    });

    // Click the terminal button to show the CLI command
    const terminalButton = screen.getByTestId("show-cli-button");
    await userEvent.click(terminalButton);

    // Should show the actual CLI command with kopia executable
    await waitFor(() => {
      const input = screen.getByDisplayValue("kopia repository status");
      expect(input).toBeInTheDocument();
    });
  });
});
