import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { setupAPIMock } from "../testutils/api-mocks";
import { CLIEquivalent } from "../../src/components/CLIEquivalent";

describe("CLIEquivalent", () => {
  let axiosMock;

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock = setupAPIMock();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  it("renders terminal button initially", () => {
    render(<CLIEquivalent command="test command" />);
    const button = screen.getByTestId("show-cli-button");
    expect(button).toBeInTheDocument();
  });

  it("shows CLI command when clicked", async () => {
    render(<CLIEquivalent command="test command" />);

    const terminalButton = screen.getByTestId("show-cli-button");
    fireEvent.click(terminalButton);

    await waitFor(() => {
      const input = screen.getByDisplayValue("kopia test command");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("readonly");
    });
  });

  it("shows copy button when CLI is visible", async () => {
    render(<CLIEquivalent command="test command" />);

    const terminalButton = screen.getByTestId("show-cli-button");
    fireEvent.click(terminalButton);

    await waitFor(() => {
      const copyButton = screen.getByTitle("Copy to clipboard");
      expect(copyButton).toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    // Override the default mock to simulate an error
    axiosMock.onGet("/api/v1/cli").reply(500, { message: "API Error" });

    render(<CLIEquivalent command="test command" />);

    const terminalButton = screen.getByTestId("show-cli-button");
    fireEvent.click(terminalButton);

    // Should not crash and should still show the button
    expect(terminalButton).toBeInTheDocument();
  });
});
