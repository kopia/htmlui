import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock react-router-dom using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock()();
});

import { PolicyEditorLink } from "../../src/components/PolicyEditorLink";

// Helper to render components with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

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

  it("renders user policy link", () => {
    const source = {
      userName: "alice",
      host: "server.com",
    };

    renderWithRouter(<PolicyEditorLink {...source} />);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("User: alice@server.com");
    expect(link).toHaveAttribute("href", expect.stringContaining("userName=alice"));
    expect(link).toHaveAttribute("href", expect.stringContaining("host=server.com"));
  });

  it("renders host policy link", () => {
    const source = {
      host: "backup-server",
    };

    renderWithRouter(<PolicyEditorLink {...source} />);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Host: backup-server");
    expect(link).toHaveAttribute("href", expect.stringContaining("host=backup-server"));
  });

  it("encodes special characters in URL parameters", () => {
    const source = {
      userName: "user@domain",
      host: "host-with-special-chars",
      path: "/path with spaces/special@chars",
    };

    renderWithRouter(<PolicyEditorLink {...source} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", expect.stringContaining("userName=user%40domain"));
    expect(link).toHaveAttribute("href", expect.stringContaining("path=%2Fpath%20with%20spaces%2Fspecial%40chars"));
  });
});
