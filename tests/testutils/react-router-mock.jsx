import React from "react";
import { vi } from "vitest";

/**
 * Unified react-router-dom mocking utilities for consistent testing across the codebase.
 *
 * This module provides a single, flexible mock system that can handle all testing scenarios
 * from simple component mocks to full router state management.
 *
 * @example
 * // Basic usage - full mock with actual implementation
 * vi.mock("react-router-dom", async () => {
 *   const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
 *   return createRouterMock()();
 * });
 *
 * @example
 * // Simple object mock (no actual implementation)
 * vi.mock("react-router-dom", async () => {
 *   const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
 *   return createRouterMock({ simple: true })();
 * });
 *
 * @example
 * // Custom state with components only
 * vi.mock("react-router-dom", async () => {
 *   const { createRouterMock } = await import("../testutils/react-router-mock.jsx");
 *   return createRouterMock({
 *     location: { pathname: "/users", search: "?id=123" },
 *     params: { id: "123" },
 *     components: { link: true, navLink: false }
 *   })();
 * });
 */

// Centralized mock functions
export const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();
const mockUseParams = vi.fn();
const mockUseSearchParams = vi.fn();

// Default mock state
const DEFAULT_STATE = {
  location: {
    pathname: "/",
    search: "",
    hash: "",
    state: null,
    key: "default",
  },
  params: {},
  searchParams: new URLSearchParams(),
  navigate: mockNavigate,
};

// Centralized mock components
// eslint-disable-next-line react/prop-types
const MockLink = ({ children, to, className, ...props }) => (
  <a href={to || "#"} className={className} data-testid="link" {...props}>
    {children}
  </a>
);
MockLink.displayName = "MockLink";

// eslint-disable-next-line react/prop-types
const MockNavLink = ({ children, to, className, ...props }) => (
  <a href={to || "#"} className={className} data-testid="nav-link" {...props}>
    {children}
  </a>
);
MockNavLink.displayName = "MockNavLink";

/**
 * Unified react-router-dom mock creator that handles all testing scenarios.
 *
 * @param {Object} options - Configuration options
 * @param {Object} [options.location] - Mock location object
 * @param {Object} [options.params] - Mock params object
 * @param {Function} [options.navigate] - Custom navigate function
 * @param {URLSearchParams|Object} [options.searchParams] - Mock search params
 * @param {boolean} [options.simple=false] - Use simple object mock (no actual implementation)
 * @param {Object} [options.components] - Component mocking options
 * @param {boolean} [options.components.link=true] - Whether to mock Link component
 * @param {boolean} [options.components.navLink=true] - Whether to mock NavLink component
 * @param {boolean} [options.components.only=false] - Only mock components (minimal mock)
 * @returns {Function} Mock factory function for vi.mock()
 */
export function createRouterMock(options = {}) {
  const {
    location = DEFAULT_STATE.location,
    params = DEFAULT_STATE.params,
    navigate = DEFAULT_STATE.navigate,
    searchParams = DEFAULT_STATE.searchParams,
    simple = false,
    components = {},
  } = options;

  const { link: mockLink = true, navLink: mockNavLink = true, only: componentsOnly = false } = components;

  // Convert searchParams to URLSearchParams if needed
  const urlSearchParams =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(
          typeof searchParams === "object"
            ? Object.entries(searchParams).map(([k, v]) => [k, String(v)])
            : searchParams || "",
        );

  // Configure mock hooks
  mockUseLocation.mockReturnValue(location);
  mockUseParams.mockReturnValue(params);
  mockUseSearchParams.mockReturnValue([urlSearchParams, vi.fn()]);

  return componentsOnly
    ? createComponentOnlyMock({ mockLink, mockNavLink })
    : simple
      ? createSimpleMock({ navigate, mockLink, mockNavLink })
      : createFullMock({ navigate, mockLink, mockNavLink });
}

// Component-only mock (minimal footprint)
function createComponentOnlyMock({ mockLink, mockNavLink }) {
  return () => {
    const mocks = {};
    if (mockLink) mocks.Link = MockLink;
    if (mockNavLink) mocks.NavLink = MockNavLink;
    return mocks;
  };
}

// Simple mock (no actual implementation)
function createSimpleMock({ navigate, mockLink, mockNavLink }) {
  return () => {
    const mocks = {
      useNavigate: () => navigate,
      useLocation: () => mockUseLocation(),
      useParams: () => mockUseParams(),
      useSearchParams: () => mockUseSearchParams(),
    };

    if (mockLink) mocks.Link = MockLink;
    if (mockNavLink) mocks.NavLink = MockNavLink;

    return mocks;
  };
}

// Full mock (preserves actual implementation)
function createFullMock({ navigate, mockLink, mockNavLink }) {
  return async () => {
    const actual = await vi.importActual("react-router-dom");
    const mocks = {
      ...actual,
      useNavigate: () => navigate,
      useLocation: () => mockUseLocation(),
      useParams: () => mockUseParams(),
      useSearchParams: () => mockUseSearchParams(),
    };

    if (mockLink) mocks.Link = MockLink;
    if (mockNavLink) mocks.NavLink = MockNavLink;

    return mocks;
  };
}

/**
 * Reset all mock functions to their initial state.
 * Call this in beforeEach or afterEach hooks.
 */
export function resetRouterMocks() {
  mockNavigate.mockClear();
  mockUseLocation.mockClear();
  mockUseParams.mockClear();
  mockUseSearchParams.mockClear();
}

/**
 * Update mock state for specific test scenarios.
 * This is a unified way to configure all router mocks at once.
 *
 * @param {Object} state - New mock state
 * @param {Object} [state.location] - Location object to mock
 * @param {Object} [state.params] - Params object to mock
 * @param {URLSearchParams|Object} [state.searchParams] - Search params to mock
 */
export function updateRouterMocks(state = {}) {
  if (state.location) {
    mockUseLocation.mockReturnValue({ ...DEFAULT_STATE.location, ...state.location });
  }

  if (state.params) {
    mockUseParams.mockReturnValue(state.params);
  }

  if (state.searchParams) {
    const urlSearchParams =
      state.searchParams instanceof URLSearchParams
        ? state.searchParams
        : new URLSearchParams(
            typeof state.searchParams === "object"
              ? Object.entries(state.searchParams).map(([k, v]) => [k, String(v)])
              : state.searchParams || "",
          );
    mockUseSearchParams.mockReturnValue([urlSearchParams, vi.fn()]);
  }
}
