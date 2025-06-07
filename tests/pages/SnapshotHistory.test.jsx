import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SnapshotHistory } from "../../src/pages/SnapshotHistory";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { UIPreferencesContext } from "../../src/contexts/UIPreferencesContext";
import { mockNavigate, resetRouterMocks } from "../testutils/react-router-mock.jsx";

// Mock axios
vi.mock("axios");

// Mock react-router-dom using the unified helper with custom location
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock({
    location: {
      search: "?host=testhost&userName=testuser&path=/test/path",
    },
  })();
});

// Helper function to render component with required providers
const renderWithProviders = (component) => {
  const mockUIPreferences = {
    theme: "light",
    showIdenticalSnapshots: false,
    setShowIdenticalSnapshots: vi.fn(),
    bytesStringBase2: vi.fn((size) => `${size} bytes`), // Mock function for size formatting
  };

  return render(
    <BrowserRouter>
      <UIPreferencesContext.Provider value={mockUIPreferences}>{component}</UIPreferencesContext.Provider>
    </BrowserRouter>,
  );
};

describe("SnapshotHistory", () => {
  beforeEach(() => {
    resetRouterMocks();
    vi.clearAllMocks();
    axios.get.mockReset();
    axios.post.mockReset();
  });

  it("should render loading spinner initially", () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithProviders(<SnapshotHistory />);

    // Look for Bootstrap spinner div
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
  });

  it("should fetch and display snapshots on mount", async () => {
    const mockResponse = {
      data: {
        snapshots: [
          {
            id: "snap1",
            startTime: "2023-01-01T12:00:00Z",
            rootOid: "root1",
            tags: {
              hostname: "testhost",
              username: "testuser",
              path: "/test/path",
            },
            summary: {
              totalSize: 104857600, // 100 MB
              fileCount: 100,
              dirCount: 10,
            },
            retention: {
              days: 30,
            },
            pins: [],
          },
        ],
      },
    };

    axios.get.mockResolvedValue(mockResponse);
    renderWithProviders(<SnapshotHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Displaying.*1.*snapshots/)).toBeInTheDocument();
    });

    // Check that basic elements are rendered
    expect(screen.getByText("testuser@testhost:/test/path")).toBeInTheDocument();
    expect(screen.getByText("Return")).toBeInTheDocument();
    expect(screen.getByText("Select All")).toBeInTheDocument();
  });

  it("should handle refresh button click", async () => {
    const mockResponse = {
      data: {
        snapshots: [],
      },
    };

    axios.get.mockResolvedValue(mockResponse);
    renderWithProviders(<SnapshotHistory />);

    await waitFor(() => {
      expect(screen.getByTitle("Fetch snapshots")).toBeInTheDocument();
    });

    const refreshButton = screen.getByTitle("Fetch snapshots");

    act(() => {
      fireEvent.click(refreshButton);
    });

    // Wait for the API to be called again
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  it("should display error when fetch fails", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    // Mock console.error to avoid error output in tests
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(<SnapshotHistory />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("should handle empty snapshot list", async () => {
    const mockResponse = {
      data: {
        snapshots: [],
      },
    };

    axios.get.mockResolvedValue(mockResponse);
    renderWithProviders(<SnapshotHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Displaying.*0.*snapshots/)).toBeInTheDocument();
    });
  });

  it("should show return button and navigate on click", async () => {
    const mockResponse = {
      data: {
        snapshots: [],
      },
    };

    axios.get.mockResolvedValue(mockResponse);
    renderWithProviders(<SnapshotHistory />);

    await waitFor(() => {
      expect(screen.getByText("Return")).toBeInTheDocument();
    });

    const returnButton = screen.getByText("Return");
    fireEvent.click(returnButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("should render table with correct headers", async () => {
    const mockResponse = {
      data: {
        snapshots: [],
      },
    };

    axios.get.mockResolvedValue(mockResponse);
    renderWithProviders(<SnapshotHistory />);

    await waitFor(() => {
      expect(screen.getByText("Selected")).toBeInTheDocument();
    });

    // Check all table headers
    expect(screen.getByText("Start time")).toBeInTheDocument();
    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("Retention")).toBeInTheDocument();
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("Files")).toBeInTheDocument();
    expect(screen.getByText("Dirs")).toBeInTheDocument();
  });

  it("should render CLI command button", async () => {
    const mockResponse = {
      data: {
        snapshots: [],
      },
    };

    axios.get.mockResolvedValue(mockResponse);
    renderWithProviders(<SnapshotHistory />);

    await waitFor(() => {
      expect(screen.getByTestId("show-cli-button")).toBeInTheDocument();
    });
  });

  it("should handle network requests with correct parameters", async () => {
    const mockResponse = {
      data: {
        snapshots: [],
      },
    };

    axios.get.mockResolvedValue(mockResponse);
    renderWithProviders(<SnapshotHistory />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/snapshots?userName=testuser&host=testhost&path=%2Ftest%2Fpath"),
      );
    });
  });

  it("should display snapshot count in header", async () => {
    const mockResponse = {
      data: {
        snapshots: [
          {
            id: "snap1",
            startTime: "2023-01-01T12:00:00Z",
            rootOid: "root1",
            tags: {
              hostname: "testhost",
              username: "testuser",
              path: "/test/path",
            },
            summary: {
              totalSize: 104857600,
              size: 104857600, // Add this for table compatibility
              fileCount: 100,
              dirCount: 10,
            },
            retention: {
              days: 30,
            },
            pins: [],
          },
          {
            id: "snap2",
            startTime: "2023-01-02T12:00:00Z",
            rootOid: "root2",
            tags: {
              hostname: "testhost",
              username: "testuser",
              path: "/test/path",
            },
            summary: {
              totalSize: 209715200,
              size: 209715200, // Add this for table compatibility
              fileCount: 200,
              dirCount: 20,
            },
            retention: {
              days: 30,
            },
            pins: [],
          },
        ],
      },
    };

    axios.get.mockResolvedValue(mockResponse);
    renderWithProviders(<SnapshotHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Displaying.*2.*snapshots/)).toBeInTheDocument();
    });
  });

  describe("Snapshot Deletion", () => {
    const mockSnapshotsResponse = {
      data: {
        snapshots: [
          {
            id: "snap1",
            startTime: "2023-01-01T12:00:00Z",
            rootOid: "root1",
            tags: {
              hostname: "testhost",
              username: "testuser",
              path: "/test/path",
            },
            summary: {
              totalSize: 104857600,
              size: 104857600,
              fileCount: 100,
              dirCount: 10,
            },
            retention: {
              days: 30,
            },
            pins: [],
            description: "Test snapshot 1",
          },
          {
            id: "snap2",
            startTime: "2023-01-02T12:00:00Z",
            rootOid: "root2",
            tags: {
              hostname: "testhost",
              username: "testuser",
              path: "/test/path",
            },
            summary: {
              totalSize: 209715200,
              size: 209715200,
              fileCount: 200,
              dirCount: 20,
            },
            retention: {
              days: 30,
            },
            pins: [],
            description: "Test snapshot 2",
          },
        ],
        unfilteredCount: 2,
        uniqueCount: 2,
      },
    };

    it("should show delete source button when no snapshots exist", async () => {
      const emptyResponse = {
        data: {
          snapshots: [],
          unfilteredCount: 0,
          uniqueCount: 0,
        },
      };

      axios.get.mockResolvedValue(emptyResponse);
      renderWithProviders(<SnapshotHistory />);

      await waitFor(() => {
        expect(screen.getByText("Delete Snapshot Source")).toBeInTheDocument();
      });
    });

    it("should delete snapshot source when no snapshots exist", async () => {
      const emptyResponse = {
        data: {
          snapshots: [],
          unfilteredCount: 0,
          uniqueCount: 0,
        },
      };

      axios.get.mockResolvedValue(emptyResponse);
      axios.post.mockResolvedValue({ data: { success: true } });
      renderWithProviders(<SnapshotHistory />);

      await waitFor(() => {
        expect(screen.getByText("Delete Snapshot Source")).toBeInTheDocument();
      });

      const deleteSourceButton = screen.getByText("Delete Snapshot Source");
      fireEvent.click(deleteSourceButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/v1/snapshots/delete", {
          source: {
            host: "testhost",
            userName: "testuser",
            path: "/test/path",
          },
          deleteSourceAndPolicy: true,
        });
      });
    });

    it("should display select all button when snapshots exist", async () => {
      axios.get.mockResolvedValue(mockSnapshotsResponse);
      renderWithProviders(<SnapshotHistory />);

      await waitFor(() => {
        expect(screen.getByText("Select All")).toBeInTheDocument();
      });

      // Should not show delete source button when snapshots exist
      expect(screen.queryByText("Delete Snapshot Source")).not.toBeInTheDocument();
    });

    it("should show correct snapshot count", async () => {
      axios.get.mockResolvedValue(mockSnapshotsResponse);
      renderWithProviders(<SnapshotHistory />);

      await waitFor(() => {
        expect(screen.getByText(/Displaying.*2.*snapshots/)).toBeInTheDocument();
      });
    });

    it("should show table headers for snapshot data", async () => {
      axios.get.mockResolvedValue(mockSnapshotsResponse);
      renderWithProviders(<SnapshotHistory />);

      await waitFor(() => {
        expect(screen.getByText("Selected")).toBeInTheDocument();
        expect(screen.getByText("Start time")).toBeInTheDocument();
        expect(screen.getByText("Root")).toBeInTheDocument();
        expect(screen.getByText("Retention")).toBeInTheDocument();
        expect(screen.getByText("Size")).toBeInTheDocument();
        expect(screen.getByText("Files")).toBeInTheDocument();
        expect(screen.getByText("Dirs")).toBeInTheDocument();
      });
    });

    it("should handle delete API errors gracefully", async () => {
      const emptyResponse = {
        data: {
          snapshots: [],
          unfilteredCount: 0,
          uniqueCount: 0,
        },
      };

      axios.get.mockResolvedValue(emptyResponse);
      axios.post.mockRejectedValue(new Error("Delete failed"));

      // Mock console.error to avoid test output noise
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      renderWithProviders(<SnapshotHistory />);

      await waitFor(() => {
        expect(screen.getByText("Delete Snapshot Source")).toBeInTheDocument();
      });

      const deleteSourceButton = screen.getByText("Delete Snapshot Source");
      fireEvent.click(deleteSourceButton);

      // API should be called
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/v1/snapshots/delete", expect.any(Object));
      });

      consoleErrorSpy.mockRestore();
    });

    it("should call correct API when deleting source with no snapshots", async () => {
      const emptyResponse = {
        data: {
          snapshots: [],
          unfilteredCount: 0,
          uniqueCount: 0,
        },
      };

      axios.get.mockResolvedValue(emptyResponse);
      axios.post.mockResolvedValue({ data: { success: true } });
      renderWithProviders(<SnapshotHistory />);

      await waitFor(() => {
        expect(screen.getByText("Delete Snapshot Source")).toBeInTheDocument();
      });

      const deleteSourceButton = screen.getByText("Delete Snapshot Source");
      fireEvent.click(deleteSourceButton);

      // Should use snapshots/delete endpoint with deleteSourceAndPolicy flag
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/v1/snapshots/delete", {
          source: {
            host: "testhost",
            userName: "testuser",
            path: "/test/path",
          },
          deleteSourceAndPolicy: true,
        });
      });

      // Should NOT call the sources/delete endpoint
      expect(axios.post).not.toHaveBeenCalledWith("/api/v1/sources/delete", expect.any(Object));
    });
  });
});
