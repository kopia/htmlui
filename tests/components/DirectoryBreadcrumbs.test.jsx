import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { DirectoryBreadcrumbs } from "../../src/components/DirectoryBreadcrumbs";
import { mockNavigate, resetRouterMocks, updateRouterMocks } from "../testutils/react-router-mock.jsx";

// Mock react-router-dom using unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock()();
});

// Helper function to render component with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("DirectoryBreadcrumbs", () => {
  beforeEach(() => {
    resetRouterMocks();
    updateRouterMocks({ location: { state: null } });
  });

  it("renders empty breadcrumb when no state", () => {
    renderWithRouter(<DirectoryBreadcrumbs />);

    // Should render the Breadcrumb container but no items
    const breadcrumb = document.querySelector(".breadcrumb");
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb.children).toHaveLength(0);
  });

  it("renders single breadcrumb item", () => {
    updateRouterMocks({
      location: {
        state: {
          label: "Home",
          oid: "12345",
        },
      },
    });

    renderWithRouter(<DirectoryBreadcrumbs />);

    expect(screen.getByText("Home")).toBeInTheDocument();

    // Current item should be active (not clickable)
    const breadcrumbItem = screen.getByText("Home").closest(".breadcrumb-item");
    expect(breadcrumbItem).toHaveClass("active");
  });

  it("renders multiple breadcrumb items with navigation chain", () => {
    // Setup a chain of states
    updateRouterMocks({
      location: {
        state: {
          label: "Current Directory",
          oid: "current123",
          prevState: {
            label: "Parent Directory",
            oid: "parent456",
            prevState: {
              label: "Root",
              oid: "root789",
            },
          },
        },
      },
    });

    renderWithRouter(<DirectoryBreadcrumbs />);

    // Should show all breadcrumb items
    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("Parent Directory")).toBeInTheDocument();
    expect(screen.getByText("Current Directory")).toBeInTheDocument();

    // Only the current (last) item should be active
    const currentItem = screen.getByText("Current Directory").closest(".breadcrumb-item");
    expect(currentItem).toHaveClass("active");

    const parentItem = screen.getByText("Parent Directory").closest(".breadcrumb-item");
    expect(parentItem).not.toHaveClass("active");

    const rootItem = screen.getByText("Root").closest(".breadcrumb-item");
    expect(rootItem).not.toHaveClass("active");
  });

  it("handles navigation when clicking on breadcrumb items", () => {
    // Setup a chain of 3 items
    updateRouterMocks({
      location: {
        state: {
          label: "Current",
          prevState: {
            label: "Parent",
            prevState: {
              label: "Root",
            },
          },
        },
      },
    });

    renderWithRouter(<DirectoryBreadcrumbs />);

    // Click on the root item (index 2 from current)
    const rootItem = screen.getByText("Root");
    fireEvent.click(rootItem);

    expect(mockNavigate).toHaveBeenCalledWith(-2);

    // Reset mock and click on parent item (index 1 from current)
    mockNavigate.mockClear();
    const parentItem = screen.getByText("Parent");
    fireEvent.click(parentItem);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("does not navigate when clicking on current (active) item", () => {
    updateRouterMocks({
      location: {
        state: {
          label: "Current",
          prevState: {
            label: "Parent",
          },
        },
      },
    });

    renderWithRouter(<DirectoryBreadcrumbs />);

    // Click on current item (index 0)
    const currentItem = screen.getByText("Current");
    fireEvent.click(currentItem);

    // Should not navigate since index is 0
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays OID tooltip for current item when oid is present", async () => {
    updateRouterMocks({
      location: {
        state: {
          label: "Current Directory",
          oid: "abc123def456",
        },
      },
    });

    renderWithRouter(<DirectoryBreadcrumbs />);

    // FontAwesome renders as SVG with data-icon="circle-info"
    const infoIcon = document.querySelector('svg[data-icon="circle-info"]');
    expect(infoIcon).toBeInTheDocument();

    // Click on the info icon to show tooltip
    await act(async () => {
      fireEvent.click(infoIcon);
    });

    // Check for tooltip content
    expect(screen.getByText("OID: abc123def456")).toBeInTheDocument();
  });

  it("does not display OID tooltip for non-current items", () => {
    updateRouterMocks({
      location: {
        state: {
          label: "Current Directory",
          oid: "current123",
          prevState: {
            label: "Parent Directory",
            oid: "parent456", // This OID should not show tooltip
          },
        },
      },
    });

    renderWithRouter(<DirectoryBreadcrumbs />);

    // Should only show one info icon (for current item)
    const infoIcons = document.querySelectorAll('svg[data-icon="circle-info"]');
    expect(infoIcons).toHaveLength(1);
  });

  it("does not display OID tooltip when oid is not present", () => {
    updateRouterMocks({
      location: {
        state: {
          label: "Current Directory",
          // No oid property
        },
      },
    });

    renderWithRouter(<DirectoryBreadcrumbs />);

    expect(screen.getByText("Current Directory")).toBeInTheDocument();

    // Should not show info icon when no OID
    const infoIcon = document.querySelector('svg[data-icon="circle-info"]');
    expect(infoIcon).not.toBeInTheDocument();
  });

  it("handles complex navigation chain correctly", () => {
    // Setup a longer chain to test index calculation
    updateRouterMocks({
      location: {
        state: {
          label: "Level4",
          prevState: {
            label: "Level3",
            prevState: {
              label: "Level2",
              prevState: {
                label: "Level1",
                prevState: {
                  label: "Root",
                },
              },
            },
          },
        },
      },
    });

    renderWithRouter(<DirectoryBreadcrumbs />);

    // Verify all items are rendered
    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("Level1")).toBeInTheDocument();
    expect(screen.getByText("Level2")).toBeInTheDocument();
    expect(screen.getByText("Level3")).toBeInTheDocument();
    expect(screen.getByText("Level4")).toBeInTheDocument();

    // Test navigation to different levels
    fireEvent.click(screen.getByText("Root"));
    expect(mockNavigate).toHaveBeenCalledWith(-4);

    mockNavigate.mockClear();
    fireEvent.click(screen.getByText("Level2"));
    expect(mockNavigate).toHaveBeenCalledWith(-2);

    mockNavigate.mockClear();
    fireEvent.click(screen.getByText("Level3"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("renders breadcrumb items in correct order", () => {
    updateRouterMocks({
      location: {
        state: {
          label: "Third",
          prevState: {
            label: "Second",
            prevState: {
              label: "First",
            },
          },
        },
      },
    });

    renderWithRouter(<DirectoryBreadcrumbs />);

    const breadcrumbItems = document.querySelectorAll(".breadcrumb-item");
    expect(breadcrumbItems[0]).toHaveTextContent("First");
    expect(breadcrumbItems[1]).toHaveTextContent("Second");
    expect(breadcrumbItems[2]).toHaveTextContent("Third");
  });
});
