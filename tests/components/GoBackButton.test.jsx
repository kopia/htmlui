import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { GoBackButton } from "../../src/components/GoBackButton";
import { mockNavigate, resetRouterMocks } from "../testutils/react-router-mock.jsx";

// Mock react-router-dom using the unified helper
vi.mock("react-router-dom", async () => {
  const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
  return createRouterMock()();
});

// Helper to render components with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("GoBackButton", () => {
  beforeEach(() => {
    resetRouterMocks();
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
