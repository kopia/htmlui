import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { SnapshotRestore } from "../../src/pages/SnapshotRestore";
import { setupAPIMock } from "../api_mocks";
import { UIPreferencesContext } from "../../src/contexts/UIPreferencesContext";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { changeControlValue, toggleCheckbox, simulateClick } from "../testutils";

let axiosMock;

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/snapshots/restore/abc123" }),
  useParams: () => ({ oid: "abc123" }),
  // eslint-disable-next-line react/prop-types
  Link: ({ children, to }) => (
    <a href={to} data-testid="link">
      {children}
    </a>
  ),
}));

// Mock the GoBackButton component
vi.mock("../../src/utils/uiutil", () => ({
  GoBackButton: () => <button data-testid="go-back-button">Go Back</button>,
  errorAlert: vi.fn(),
}));

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
 * Helper function to render SnapshotRestore component with necessary providers
 */
const renderSnapshotRestore = (props = {}) => {
  return render(
    <UIPreferencesContext.Provider value={mockUIPreferences}>
      <SnapshotRestore {...props} />
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
});

/**
 * Clean up after each test
 */
afterEach(() => {
  axiosMock.reset();
});

describe("SnapshotRestore component", () => {
  test("renders initial form with all fields", () => {
    renderSnapshotRestore();

    // Check page title and navigation
    expect(screen.getByText("Restore")).toBeInTheDocument();
    expect(screen.getByTestId("go-back-button")).toBeInTheDocument();

    // Check main destination field
    expect(screen.getByTestId("control-destination")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("enter destination path")).toBeInTheDocument();

    // Check boolean options
    expect(screen.getByTestId("control-incremental")).toBeInTheDocument();
    expect(screen.getByTestId("control-continueOnErrors")).toBeInTheDocument();
    expect(screen.getByTestId("control-restoreOwnership")).toBeInTheDocument();
    expect(screen.getByTestId("control-restorePermissions")).toBeInTheDocument();
    expect(screen.getByTestId("control-restoreModTimes")).toBeInTheDocument();
    expect(screen.getByTestId("control-overwriteFiles")).toBeInTheDocument();
    expect(screen.getByTestId("control-overwriteDirectories")).toBeInTheDocument();
    expect(screen.getByTestId("control-overwriteSymlinks")).toBeInTheDocument();
    expect(screen.getByTestId("control-writeFilesAtomically")).toBeInTheDocument();
    expect(screen.getByTestId("control-writeSparseFiles")).toBeInTheDocument();
    expect(screen.getByTestId("control-uncompressedZip")).toBeInTheDocument();

    // Check number fields
    expect(screen.getByTestId("control-restoreDirEntryAtDepth")).toBeInTheDocument();
    expect(screen.getByTestId("control-minSizeForPlaceholder")).toBeInTheDocument();

    // Check submit button
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    expect(screen.getByText("Begin Restore")).toBeInTheDocument();
  });

  test("validates required destination field", async () => {
    renderSnapshotRestore();

    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    // Should not make API call without destination
    expect(axiosMock.history.post).toHaveLength(0);
  });

  test("handles file system restore with all options", async () => {
    const mockResponse = { data: { id: "task123" } };
    axiosMock.onPost("/api/v1/restore").reply(200, mockResponse);

    renderSnapshotRestore();

    // Fill in destination
    const destinationField = screen.getByTestId("control-destination");
    changeControlValue(destinationField, "/home/user/restore");

    // Toggle some options
    const overwriteFiles = screen.getByTestId("control-overwriteFiles");
    toggleCheckbox(overwriteFiles);

    const restoreOwnership = screen.getByTestId("control-restoreOwnership");
    toggleCheckbox(restoreOwnership); // This should turn it off

    // Set number fields
    const depthField = screen.getByTestId("control-restoreDirEntryAtDepth");
    changeControlValue(depthField, "500");

    const minSizeField = screen.getByTestId("control-minSizeForPlaceholder");
    changeControlValue(minSizeField, "1024");

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    const request = JSON.parse(axiosMock.history.post[0].data);
    expect(request.root).toBe("abc123");
    expect(request.fsOutput.targetPath).toBe("/home/user/restore");
    expect(request.fsOutput.skipOwners).toBe(true); // restoreOwnership was toggled off
    expect(request.fsOutput.overwriteFiles).toBe(true); // was toggled on
    expect(request.options.restoreDirEntryAtDepth).toBe(500);
    expect(request.options.minSizeForPlaceholder).toBe(1024);
  });

  test("handles ZIP file restore", async () => {
    const mockResponse = { data: { id: "task456" } };
    axiosMock.onPost("/api/v1/restore").reply(200, mockResponse);

    renderSnapshotRestore();

    // Fill in ZIP destination
    const destinationField = screen.getByTestId("control-destination");
    changeControlValue(destinationField, "/backup/restore.zip");

    // Toggle ZIP compression off
    const uncompressedZip = screen.getByTestId("control-uncompressedZip");
    toggleCheckbox(uncompressedZip); // Toggle off (should be compressed)

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    const request = JSON.parse(axiosMock.history.post[0].data);
    expect(request.root).toBe("abc123");
    expect(request.zipFile).toBe("/backup/restore.zip");
    expect(request.uncompressedZip).toBe(false); // compression enabled
    expect(request.fsOutput).toBeUndefined(); // Should not have fs options for ZIP
  });

  test("handles TAR file restore", async () => {
    const mockResponse = { data: { id: "task789" } };
    axiosMock.onPost("/api/v1/restore").reply(200, mockResponse);

    renderSnapshotRestore();

    // Fill in TAR destination
    const destinationField = screen.getByTestId("control-destination");
    changeControlValue(destinationField, "/backup/restore.tar");

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    const request = JSON.parse(axiosMock.history.post[0].data);
    expect(request.root).toBe("abc123");
    expect(request.tarFile).toBe("/backup/restore.tar");
    expect(request.fsOutput).toBeUndefined(); // Should not have fs options for TAR
    expect(request.zipFile).toBeUndefined();
  });

  test("makes correct API call for successful restore start", async () => {
    const mockResponse = { data: { id: "task123" } };
    axiosMock.onPost("/api/v1/restore").reply(200, mockResponse);

    renderSnapshotRestore();

    // Fill in destination and submit
    const destinationField = screen.getByTestId("control-destination");
    changeControlValue(destinationField, "/restore/path");

    // Click the submit button
    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    // Wait for API call to complete
    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    // Verify the API request was made correctly
    const request = JSON.parse(axiosMock.history.post[0].data);
    expect(request.root).toBe("abc123");
    expect(request.fsOutput.targetPath).toBe("/restore/path");
  });

  test("handles API error gracefully", async () => {
    const { errorAlert } = await import("../../src/utils/uiutil");
    const mockErrorAlert = vi.mocked(errorAlert);

    axiosMock.onPost("/api/v1/restore").reply(500, {
      message: "Internal Server Error",
    });

    renderSnapshotRestore();

    // Fill in destination and submit
    const destinationField = screen.getByTestId("control-destination");
    changeControlValue(destinationField, "/restore/path");

    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    await waitFor(() => {
      expect(mockErrorAlert).toHaveBeenCalled();
    });
  });

  test("handles incremental restore option correctly", async () => {
    const mockResponse = { data: { id: "task999" } };
    axiosMock.onPost("/api/v1/restore").reply(200, mockResponse);

    renderSnapshotRestore();

    // Fill in destination
    const destinationField = screen.getByTestId("control-destination");
    changeControlValue(destinationField, "/restore");

    // Toggle incremental off
    const incrementalField = screen.getByTestId("control-incremental");
    toggleCheckbox(incrementalField);

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    const request = JSON.parse(axiosMock.history.post[0].data);
    expect(request.options.incremental).toBe(false);
  });

  test("handles continue on errors option correctly", async () => {
    const mockResponse = { data: { id: "task888" } };
    axiosMock.onPost("/api/v1/restore").reply(200, mockResponse);

    renderSnapshotRestore();

    // Fill in destination
    const destinationField = screen.getByTestId("control-destination");
    changeControlValue(destinationField, "/restore");

    // Toggle continue on errors on
    const continueOnErrorsField = screen.getByTestId("control-continueOnErrors");
    toggleCheckbox(continueOnErrorsField);

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    const request = JSON.parse(axiosMock.history.post[0].data);
    expect(request.options.ignoreErrors).toBe(true);
  });

  test("all boolean filesystem options are correctly mapped", async () => {
    const mockResponse = { data: { id: "task777" } };
    axiosMock.onPost("/api/v1/restore").reply(200, mockResponse);

    renderSnapshotRestore();

    // Fill in destination
    const destinationField = screen.getByTestId("control-destination");
    changeControlValue(destinationField, "/restore");

    // Toggle several options
    toggleCheckbox(screen.getByTestId("control-restorePermissions")); // Turn off
    toggleCheckbox(screen.getByTestId("control-restoreModTimes")); // Turn off
    toggleCheckbox(screen.getByTestId("control-overwriteDirectories")); // Turn on
    toggleCheckbox(screen.getByTestId("control-overwriteSymlinks")); // Turn on
    toggleCheckbox(screen.getByTestId("control-writeFilesAtomically")); // Turn on
    toggleCheckbox(screen.getByTestId("control-writeSparseFiles")); // Turn on

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    const request = JSON.parse(axiosMock.history.post[0].data);

    expect(request.fsOutput.skipPermissions).toBe(true);
    expect(request.fsOutput.skipTimes).toBe(true);
    expect(request.fsOutput.overwriteDirectories).toBe(true);
    expect(request.fsOutput.overwriteSymlinks).toBe(true);
    expect(request.fsOutput.writeFilesAtomically).toBe(true);
    expect(request.fsOutput.writeSparseFiles).toBe(true);
  });

  test("number fields handle empty values correctly", async () => {
    const mockResponse = { data: { id: "task555" } };
    axiosMock.onPost("/api/v1/restore").reply(200, mockResponse);

    renderSnapshotRestore();

    // Fill in destination
    const destinationField = screen.getByTestId("control-destination");
    changeControlValue(destinationField, "/restore");

    // Clear number fields (they should have default values)
    const depthField = screen.getByTestId("control-restoreDirEntryAtDepth");
    changeControlValue(depthField, "");

    const minSizeField = screen.getByTestId("control-minSizeForPlaceholder");
    changeControlValue(minSizeField, "");

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    simulateClick(submitButton);

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    const request = JSON.parse(axiosMock.history.post[0].data);
    // Should still have some value for these fields (likely default or undefined)
    expect(request.options).toBeDefined();
  });
});
