import { vi } from "vitest";
import React from "react";

// Mock the App component
vi.mock("../src/App", () => ({
  default: () => <div data-testid="mocked-app">Mocked App Component</div>,
}));

// Mock CSS import
vi.mock("../src/css/index.css", () => ({}));

// Create a mock for createRoot and root.render
const mockRender = vi.fn();
const mockRoot = {
  render: mockRender,
};
const mockCreateRoot = vi.fn(() => mockRoot);

// Mock react-dom/client
vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

describe("index.jsx", () => {
  let rootElement;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    // Reset modules to ensure fresh imports
    vi.resetModules();

    // Create a mock root element
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);

    // Mock getElementById to return our root element
    vi.spyOn(document, "getElementById").mockReturnValue(rootElement);
  });

  afterEach(() => {
    // Clean up DOM
    if (document.body.contains(rootElement)) {
      document.body.removeChild(rootElement);
    }
    vi.restoreAllMocks();
  });

  test("creates root element and renders App component", async () => {
    // Dynamically import index.jsx to trigger its execution
    await import("../src/index.jsx");

    // Verify getElementById was called with "root"
    expect(document.getElementById).toHaveBeenCalledWith("root");

    // Verify createRoot was called with the root element
    expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);

    // Verify render was called with the App component
    expect(mockRender).toHaveBeenCalledTimes(1);

    // Check that App component was passed to render
    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBeDefined();
    expect(renderCall.props).toBeDefined();
  });

  test("handles missing root element by throwing error", async () => {
    // Mock getElementById to return null
    document.getElementById.mockReturnValue(null);

    // Mock createRoot to throw an error when called with null
    mockCreateRoot.mockImplementation((element) => {
      if (!element) {
        throw new Error("Target container is not a DOM element.");
      }
      return mockRoot;
    });

    // Import the module - this will execute the code
    try {
      await import("../src/index.jsx");
    } catch {
      // Expected error from createRoot
    }

    // Verify that createRoot was called with null
    expect(mockCreateRoot).toHaveBeenCalledWith(null);
    expect(document.getElementById).toHaveBeenCalledWith("root");
  });

  test("imports required modules and executes rendering", async () => {
    // Import the module
    await import("../src/index.jsx");

    // Verify that all required modules were imported (through mocks being called)
    expect(mockCreateRoot).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
  });

  test("renders App component correctly", async () => {
    // Import to test fresh
    await import("../src/index.jsx");

    // Verify the render was called
    expect(mockRender).toHaveBeenCalledTimes(1);

    // Get the rendered element
    const renderedElement = mockRender.mock.calls[0][0];

    // Verify it's a React element
    expect(renderedElement).toBeTruthy();
    expect(typeof renderedElement).toBe("object");
    expect(typeof renderedElement.type).toBe("function"); // The mocked App component is a function
  });

  test("successfully loads CSS styles", async () => {
    // The CSS import is mocked, so we just verify the module loads without error
    await expect(import("../src/index.jsx")).resolves.not.toThrow();
  });

  test("calls createRoot and render in correct order", async () => {
    const callOrder = [];

    // Track call order
    mockCreateRoot.mockImplementation((_element) => {
      callOrder.push("createRoot");
      return mockRoot;
    });

    mockRender.mockImplementation(() => {
      callOrder.push("render");
    });

    await import("../src/index.jsx");

    // Verify correct order of operations
    expect(callOrder).toEqual(["createRoot", "render"]);
  });
});
