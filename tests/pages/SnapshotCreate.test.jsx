/* eslint-disable react/prop-types, react/display-name */
import React from "react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { SnapshotCreate } from "../../src/pages/SnapshotCreate";
import { setupAPIMock } from "../testutils/api-mocks";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

let axiosMock;

// Mock react-router-dom using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock({
    simple: true,
    location: { pathname: "/snapshots/create" },
    navigate: vi.fn(),
  })();
});

// Mock utility components with minimal implementations
vi.mock("../../src/utils/uiutil", () => ({
  errorAlert: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("../../src/components/GoBackButton", () => ({
  GoBackButton: () => <button data-testid="go-back-button">Go Back</button>,
}));

// Mock PolicyEditor with a simple implementation that tracks ref calls
vi.mock("../../src/components/policy-editor/PolicyEditor", () => ({
  PolicyEditor: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      getAndValidatePolicy: vi.fn(() => ({ somePolicy: "data" })),
    }));

    return (
      <div data-testid="policy-editor" data-embedded={props.embedded}>
        Policy Editor for {props.path}
      </div>
    );
  }),
}));

// Mock SnapshotEstimation component
vi.mock("../../src/components/SnapshotEstimation", () => ({
  SnapshotEstimation: ({ taskID }) => <div data-testid="snapshot-estimation">Estimating task: {taskID}</div>,
}));

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

describe("SnapshotCreate component", () => {
  test("renders initial form elements", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    expect(screen.getByText("New Snapshot")).toBeInTheDocument();
    expect(screen.getByTestId("go-back-button")).toBeInTheDocument();
    expect(screen.getByTestId("control-path")).toBeInTheDocument();
    expect(screen.getByTestId("estimate-now")).toBeInTheDocument();
    expect(screen.getByTestId("snapshot-now")).toBeInTheDocument();
  });

  test("estimate and snapshot buttons are disabled when no path is resolved", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const estimateButton = screen.getByTestId("estimate-now");
    const snapshotButton = screen.getByTestId("snapshot-now");

    expect(estimateButton).toBeDisabled();
    expect(snapshotButton).toBeDisabled();
  });

  test("handles path input and resolution", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/documents",
        host: "testhost",
        userName: "testuser",
      },
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home/user/documents" } });
    });

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
      expect(JSON.parse(axiosMock.history.post[0].data).path).toBe("/home/user/documents");
    });
  });

  test("enables buttons after path resolution", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/documents",
        host: "testhost",
        userName: "testuser",
      },
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home/user/documents" } });
    });

    await waitFor(() => {
      const estimateButton = screen.getByTestId("estimate-now");
      const snapshotButton = screen.getByTestId("snapshot-now");
      expect(estimateButton).not.toBeDisabled();
      expect(snapshotButton).not.toBeDisabled();
    });
  });

  test("displays resolved path and policy editor after path resolution", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/documents",
        host: "testhost",
        userName: "testuser",
      },
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home/user/documents" } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("policy-editor")).toBeInTheDocument();
      expect(screen.getByText("/home/user/documents")).toBeInTheDocument();
    });

    const policyEditor = screen.getByTestId("policy-editor");
    expect(policyEditor).toHaveAttribute("data-embedded", "true");
  });

  test("handles estimate button click", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/documents",
        host: "testhost",
        userName: "testuser",
      },
    });

    axiosMock.onPost("/api/v1/estimate").reply(200, {
      id: "estimate-task-123",
      description: "Estimating /home/user/documents",
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home/user/documents" } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("estimate-now")).not.toBeDisabled();
    });

    const estimateButton = screen.getByTestId("estimate-now");

    await act(async () => {
      fireEvent.click(estimateButton);
    });

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(2); // resolve + estimate
      const estimateRequest = JSON.parse(axiosMock.history.post[1].data);
      expect(estimateRequest.root).toBe("/home/user/documents");
      expect(estimateRequest.maxExamplesPerBucket).toBe(10);
      expect(estimateRequest.policyOverride).toEqual({ somePolicy: "data" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("snapshot-estimation")).toBeInTheDocument();
      expect(screen.getByText("Estimating task: estimate-task-123")).toBeInTheDocument();
    });
  });

  test("handles snapshot now button click", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/documents",
        host: "testhost",
        userName: "testuser",
      },
    });

    axiosMock.onPost("/api/v1/sources").reply(200, {
      id: "source-123",
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home/user/documents" } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("snapshot-now")).not.toBeDisabled();
    });

    const snapshotButton = screen.getByTestId("snapshot-now");

    await act(async () => {
      fireEvent.click(snapshotButton);
    });

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(2); // resolve + sources
      const snapshotRequest = JSON.parse(axiosMock.history.post[1].data);
      expect(snapshotRequest.path).toBe("/home/user/documents");
      expect(snapshotRequest.createSnapshot).toBe(true);
      expect(snapshotRequest.policy).toEqual({ somePolicy: "data" });
    });
  });

  test("handles API errors gracefully", async () => {
    const { errorAlert } = await import("../../src/utils/uiutil");
    const mockErrorAlert = vi.mocked(errorAlert);

    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/documents",
        host: "testhost",
        userName: "testuser",
      },
    });

    axiosMock.onPost("/api/v1/estimate").reply(500, {
      message: "Server error",
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home/user/documents" } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("estimate-now")).not.toBeDisabled();
    });

    const estimateButton = screen.getByTestId("estimate-now");

    await act(async () => {
      fireEvent.click(estimateButton);
    });

    await waitFor(() => {
      expect(mockErrorAlert).toHaveBeenCalled();
    });
  });

  test("handles empty path resolution", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "" } });
    });

    // Should not make any resolve calls for empty path
    expect(axiosMock.history.post).toHaveLength(0);

    const estimateButton = screen.getByTestId("estimate-now");
    const snapshotButton = screen.getByTestId("snapshot-now");

    expect(estimateButton).toBeDisabled();
    expect(snapshotButton).toBeDisabled();
  });

  test("hides estimation when path changes", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/documents",
        host: "testhost",
        userName: "testuser",
      },
    });

    axiosMock.onPost("/api/v1/estimate").reply(200, {
      id: "estimate-task-123",
      description: "Estimating /home/user/documents",
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home/user/documents" } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("estimate-now")).not.toBeDisabled();
    });

    const estimateButton = screen.getByTestId("estimate-now");

    await act(async () => {
      fireEvent.click(estimateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("snapshot-estimation")).toBeInTheDocument();
    });

    // Change path to a new one
    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/photos",
        host: "testhost",
        userName: "testuser",
      },
    });

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home/user/photos" } });
    });

    await waitFor(() => {
      expect(screen.queryByTestId("snapshot-estimation")).not.toBeInTheDocument();
    });
  });

  test("shows CLI equivalent command", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/documents",
        host: "testhost",
        userName: "testuser",
      },
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home/user/documents" } });
    });

    await waitFor(() => {
      const terminalButton = screen.getByTestId("show-cli-button");
      expect(terminalButton).toBeInTheDocument();
    });
  });

  test("prevents snapshot without resolved path", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    // The snapshot button should be disabled when there's no resolved path
    const snapshotButton = screen.getByTestId("snapshot-now");
    expect(snapshotButton).toBeDisabled();

    // Verify no API calls are made when button is disabled
    expect(axiosMock.history.post).toHaveLength(0);
  });

  test("handles sources API failure on mount", async () => {
    const { redirect } = await import("../../src/utils/uiutil");
    const mockRedirect = vi.mocked(redirect);

    axiosMock.onGet("/api/v1/sources").reply(500, {
      message: "Failed to get sources",
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalled();
    });
  });

  test("multiple path resolution calls are handled correctly", async () => {
    axiosMock.onGet("/api/v1/sources").reply(200, {
      localUsername: "testuser",
      localHost: "testhost",
    });

    axiosMock.onPost("/api/v1/paths/resolve").reply(200, {
      source: {
        path: "/home/user/documents",
        host: "testhost",
        userName: "testuser",
      },
    });

    await act(async () => {
      render(<SnapshotCreate />);
    });

    const pathInput = screen.getByTestId("control-path");

    // Type quickly to simulate multiple changes
    await act(async () => {
      fireEvent.change(pathInput, { target: { value: "/home" } });
      fireEvent.change(pathInput, { target: { value: "/home/user" } });
      fireEvent.change(pathInput, { target: { value: "/home/user/documents" } });
    });

    await waitFor(() => {
      // Should have made resolve calls for each path change
      expect(axiosMock.history.post.length).toBeGreaterThan(0);
    });
  });
});
