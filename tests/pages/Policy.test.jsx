/* eslint-disable react/prop-types */
import React from "react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { Policy } from "../../src/pages/Policy";
import { setupAPIMock } from "../testutils/api-mocks";
import { mockNavigate, resetRouterMocks, updateRouterMocks } from "../testutils/react-router-mock.jsx";

// Mock React Router hooks using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock()();
});

// Mock the PolicyEditor component to avoid complex dependencies
vi.mock("../../src/components/policy-editor/PolicyEditor", () => ({
  PolicyEditor: React.forwardRef(function MockPolicyEditor(props, _ref) {
    return (
      <div data-testid="policy-editor">
        <div>PolicyEditor Mock</div>
        <div>User: {props.userName || ""}</div>
        <div>Host: {props.host || ""}</div>
        <div>Path: {props.path || ""}</div>
        <button onClick={props.close}>Close</button>
      </div>
    );
  }),
}));

vi.mock("../../src/components/GoBackButton", () => ({
  GoBackButton: () => (
    <button data-testid="go-back-button" onClick={() => mockNavigate(-1)}>
      ← Return
    </button>
  ),
}));

vi.mock("../../src/components/CLIEquivalent", () => {
  return {
    CLIEquivalent: (props) => (
      <div data-testid="cli-equivalent">
        <button data-testid="show-cli-button">CLI</button>
        <span>Command: {props.command || ""}</span>
      </div>
    ),
  };
});

let axiosMock;

beforeEach(() => {
  axiosMock = setupAPIMock();
  resetRouterMocks();

  // Mock CLI API endpoint
  axiosMock.onGet("/api/v1/cli").reply(200, {
    executable: "kopia",
  });

  // Reset location mock
  updateRouterMocks({ location: { search: "" } });
});

afterEach(() => {
  axiosMock.reset();
  vi.clearAllMocks();
});

// Helper function to render Policy component with router context
function renderPolicyWithRouter(initialEntries = ["/policy"]) {
  // Update the mock location to match the initial entry
  if (initialEntries[0].includes("?")) {
    updateRouterMocks({ location: { search: initialEntries[0].split("?")[1] } });
  } else {
    updateRouterMocks({ location: { search: "" } });
  }

  const result = render(
    <MemoryRouter initialEntries={initialEntries}>
      <Policy />
    </MemoryRouter>,
  );

  return { ...result, navigate: mockNavigate };
}

describe("Policy Component", () => {
  describe("Rendering", () => {
    test("renders policy page with basic elements", () => {
      renderPolicyWithRouter(["/policy?userName=test&host=localhost&path=/home/test"]);

      expect(screen.getByTestId("go-back-button")).toBeInTheDocument();
      expect(screen.getByTestId("policy-editor")).toBeInTheDocument();
      expect(screen.getByTestId("cli-equivalent")).toBeInTheDocument();
    });

    test("displays correct policy type name for directory policy", () => {
      renderPolicyWithRouter(["/policy?userName=test&host=localhost&path=/home/test"]);

      expect(screen.getByText("Directory: test@localhost:/home/test")).toBeInTheDocument();
    });

    test("displays correct policy type name for user policy", () => {
      renderPolicyWithRouter(["/policy?userName=test&host=localhost"]);

      expect(screen.getByText("User: test@localhost")).toBeInTheDocument();
    });

    test("displays correct policy type name for host policy", () => {
      renderPolicyWithRouter(["/policy?host=localhost"]);

      // Use getAllByText to handle multiple matches and select the one in the header
      const hostTexts = screen.getAllByText("Host: localhost");
      expect(hostTexts[0]).toBeInTheDocument(); // The one in the header
    });

    test("displays correct policy type name for global policy", () => {
      renderPolicyWithRouter(["/policy"]);

      expect(screen.getByText("Global Policy")).toBeInTheDocument();
    });
  });

  describe("Query Parameter Parsing", () => {
    test("parses userName, host, and path from query string", () => {
      renderPolicyWithRouter(["/policy?userName=user1&host=example.com&path=/var/lib"]);

      expect(screen.getByText("User: user1")).toBeInTheDocument();
      expect(screen.getByText("Host: example.com")).toBeInTheDocument();
      expect(screen.getByText("Path: /var/lib")).toBeInTheDocument();
    });

    test("handles URL encoded parameters", () => {
      renderPolicyWithRouter(["/policy?userName=test%40user&host=my-host.com&path=%2Fpath%2Fwith%2Fspaces"]);

      expect(screen.getByText("User: test@user")).toBeInTheDocument();
      expect(screen.getByText("Host: my-host.com")).toBeInTheDocument();
      expect(screen.getByText("Path: /path/with/spaces")).toBeInTheDocument();
    });

    test("handles missing parameters gracefully", () => {
      renderPolicyWithRouter(["/policy?userName=&host=&path="]);

      expect(screen.getByText("Global Policy")).toBeInTheDocument();
    });
  });

  describe("PolicyEditor Integration", () => {
    test("passes correct props to PolicyEditor", () => {
      renderPolicyWithRouter(["/policy?userName=testuser&host=testhost&path=/test/path"]);

      expect(screen.getByText("User: testuser")).toBeInTheDocument();
      expect(screen.getByText("Host: testhost")).toBeInTheDocument();
      expect(screen.getByText("Path: /test/path")).toBeInTheDocument();
    });

    test("PolicyEditor close function works", async () => {
      const user = userEvent.setup();
      renderPolicyWithRouter(["/policy?userName=test&host=localhost&path=/home"]);

      const closeButton = screen.getByText("Close");
      await user.click(closeButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe("CLI Equivalent Display", () => {
    test("shows correct CLI command for directory policy", () => {
      renderPolicyWithRouter(["/policy?userName=user&host=example.com&path=/data"]);

      expect(screen.getByText('Command: policy set "user@example.com:/data"')).toBeInTheDocument();
    });

    test("shows correct CLI command for user policy", () => {
      renderPolicyWithRouter(["/policy?userName=admin&host=server.local&path="]);

      expect(screen.getByText('Command: policy set "admin@server.local:"')).toBeInTheDocument();
    });

    test("shows correct CLI command for host policy", () => {
      renderPolicyWithRouter(["/policy?userName=&host=backup-server&path="]);

      expect(screen.getByText('Command: policy set "@backup-server:"')).toBeInTheDocument();
    });

    test("shows CLI button", () => {
      renderPolicyWithRouter(["/policy?userName=test&host=localhost&path=/home"]);

      expect(screen.getByTestId("show-cli-button")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    test("go back button navigates correctly", async () => {
      const user = userEvent.setup();
      renderPolicyWithRouter(["/policy?userName=test&host=localhost"]);

      const goBackButton = screen.getByTestId("go-back-button");
      await user.click(goBackButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe("Component Structure", () => {
    test("has correct layout structure", () => {
      renderPolicyWithRouter(["/policy?userName=test&host=localhost&path=/home"]);

      // Check for header section
      const header = screen.getByRole("heading", { level: 4 });
      expect(header).toBeInTheDocument();

      // Check for PolicyEditor
      expect(screen.getByTestId("policy-editor")).toBeInTheDocument();

      // Check for CLI equivalent section
      expect(screen.getByTestId("cli-equivalent")).toBeInTheDocument();
    });

    test("header contains go back button and policy type name", () => {
      renderPolicyWithRouter(["/policy?userName=user&host=host&path=/path"]);

      const header = screen.getByRole("heading", { level: 4 });
      expect(header).toContainElement(screen.getByTestId("go-back-button"));
      expect(header).toHaveTextContent("Directory: user@host:/path");
    });
  });

  describe("Error Handling", () => {
    test("handles empty query parameters", () => {
      renderPolicyWithRouter(["/policy?"]);

      expect(screen.getByText("Global Policy")).toBeInTheDocument();
      expect(screen.getByTestId("policy-editor")).toBeInTheDocument();
    });

    test("handles malformed query parameters", () => {
      renderPolicyWithRouter(["/policy?invalid=params&userName"]);

      expect(screen.getByTestId("policy-editor")).toBeInTheDocument();
    });
  });

  describe("Component Props and Refs", () => {
    test("creates editor ref correctly", () => {
      renderPolicyWithRouter(["/policy?userName=test&host=localhost"]);

      // The component should render without errors, indicating ref creation worked
      expect(screen.getByTestId("policy-editor")).toBeInTheDocument();
    });

    test("passes all required props to PolicyEditor", () => {
      renderPolicyWithRouter(["/policy?userName=testUser&host=testHost&path=/testPath"]);

      // Verify the mocked PolicyEditor receives the props
      expect(screen.getByText("User: testUser")).toBeInTheDocument();
      expect(screen.getByText("Host: testHost")).toBeInTheDocument();
      expect(screen.getByText("Path: /testPath")).toBeInTheDocument();
    });
  });
});

describe("Policy Component Integration", () => {
  test("integrates with React Router correctly", () => {
    // Test that the component can be rendered within router context
    expect(() => {
      renderPolicyWithRouter(["/policy?userName=test&host=localhost&path=/home"]);
    }).not.toThrow();
  });

  test("handles route changes", () => {
    renderPolicyWithRouter(["/policy?userName=user1&host=host1&path=/path1"]);

    expect(screen.getByText("Directory: user1@host1:/path1")).toBeInTheDocument();

    // Simulate route change by re-rendering with different query
    render(
      <MemoryRouter initialEntries={["/policy?userName=user2&host=host2&path=/path2"]}>
        <Policy />
      </MemoryRouter>,
    );
  });
});
