/* eslint-disable react/prop-types */
import { render, waitFor, act } from "@testing-library/react";
import React, { useContext } from "react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { UIPreferencesContext, UIPreferenceProvider, PAGE_SIZES } from "../../src/contexts/UIPreferencesContext";
import { vi } from "vitest";

// Create axios mock
let axiosMock;

beforeEach(() => {
  axiosMock = new MockAdapter(axios);
  // Clear all classes from html element
  document.documentElement.className = "";
  // Default PUT mock to prevent 404 errors
  axiosMock.onPut("/api/v1/ui-preferences").reply(200);
});

afterEach(() => {
  axiosMock.restore();
});

// Helper component to access context values
const TestComponent = ({ onMount }) => {
  const preferences = useContext(UIPreferencesContext);
  React.useEffect(() => {
    onMount(preferences);
  }, [preferences, onMount]);
  return null;
};

describe("UIPreferencesContext", () => {
  describe("Default values", () => {
    it("should provide default preferences when API fails", async () => {
      // Mock console.error to suppress expected AxiosError output
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Mock API failure
      axiosMock.onGet("/api/v1/ui-preferences").reply(500);

      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences.pageSize).toBe(10);
        expect(capturedPreferences.bytesStringBase2).toBe(false);
        expect(capturedPreferences.defaultSnapshotViewAll).toBe(false);
        expect(capturedPreferences.fontSize).toBe("fs-6");
      });

      consoleSpy.mockRestore();
    });

    it("should detect theme from browser preferences when API returns empty theme", async () => {
      // Mock browser dark mode preference
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      axiosMock.onGet("/api/v1/ui-preferences").reply(200, {
        theme: "",
        fontSize: "fs-6",
        pageSize: 10,
      });
      axiosMock.onPut("/api/v1/ui-preferences").reply(200);

      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences.theme).toBe("dark");
      });
    });
  });

  describe("Loading preferences from API", () => {
    it("should load and apply preferences from API", async () => {
      const mockPreferences = {
        pageSize: 50,
        bytesStringBase2: true,
        defaultSnapshotView: true,
        theme: "ocean",
        fontSize: "fs-5",
      };

      axiosMock.onGet("/api/v1/ui-preferences").reply(200, mockPreferences);
      axiosMock.onPut("/api/v1/ui-preferences").reply(200);

      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences.pageSize).toBe(50);
        expect(capturedPreferences.bytesStringBase2).toBe(true);
        expect(capturedPreferences.theme).toBe("ocean");
        expect(capturedPreferences.fontSize).toBe("fs-5");
      });

      // Check that theme and fontSize are applied to HTML element
      expect(document.documentElement.classList.contains("ocean")).toBe(true);
      expect(document.documentElement.classList.contains("fs-5")).toBe(true);
    });

    it("should handle empty theme and fontSize from API", async () => {
      const mockPreferences = {
        pageSize: 20,
        theme: "",
        fontSize: "",
      };

      axiosMock.onGet("/api/v1/ui-preferences").reply(200, mockPreferences);
      axiosMock.onPut("/api/v1/ui-preferences").reply(200);

      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences.theme).toBe("light"); // Should fall back to default
        expect(capturedPreferences.fontSize).toBe("fs-6"); // Should fall back to default
      });
    });

    it("should normalize invalid page sizes", async () => {
      // Mock console.error to suppress expected network errors
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const testCases = [
        { input: 0, expected: 10 },
        { input: 5, expected: 10 },
        { input: 15, expected: 10 },
        { input: 25, expected: 20 },
        { input: 35, expected: 30 },
        { input: 45, expected: 40 },
        { input: 75, expected: 50 },
        { input: 150, expected: 100 },
      ];

      for (const testCase of testCases) {
        axiosMock.reset();
        axiosMock.onGet("/api/v1/ui-preferences").reply(200, { pageSize: testCase.input });
        axiosMock.onPut("/api/v1/ui-preferences").reply(200);

        let capturedPreferences;
        const { unmount } = render(
          <UIPreferenceProvider>
            <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
          </UIPreferenceProvider>,
        );

        await waitFor(() => {
          expect(capturedPreferences.pageSize).toBe(testCase.expected);
        });

        unmount();
      }

      consoleSpy.mockRestore();
    });
  });

  describe("Updating preferences", () => {
    beforeEach(() => {
      axiosMock.onGet("/api/v1/ui-preferences").reply(200, {
        pageSize: 10,
        theme: "light",
        fontSize: "fs-6",
      });
      axiosMock.onPut("/api/v1/ui-preferences").reply(200);
    });

    it("should update theme and sync with HTML classes", async () => {
      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences.theme).toBe("light");
      });

      act(() => {
        capturedPreferences.setTheme("dark");
      });

      await waitFor(() => {
        expect(capturedPreferences.theme).toBe("dark");
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(document.documentElement.classList.contains("light")).toBe(false);
      });

      // Verify API was called to save
      expect(axiosMock.history.put.length).toBeGreaterThan(0);
      const lastPutRequest = axiosMock.history.put[axiosMock.history.put.length - 1];
      expect(JSON.parse(lastPutRequest.data).theme).toBe("dark");
    });

    it("should update font size and sync with HTML classes", async () => {
      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences.fontSize).toBe("fs-6");
      });

      act(() => {
        capturedPreferences.setFontSize("fs-4");
      });

      await waitFor(() => {
        expect(capturedPreferences.fontSize).toBe("fs-4");
        expect(document.documentElement.classList.contains("fs-4")).toBe(true);
        expect(document.documentElement.classList.contains("fs-6")).toBe(false);
      });
    });

    it("should update page size", async () => {
      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences.pageSize).toBe(10);
      });

      act(() => {
        capturedPreferences.setPageSize(50);
      });

      await waitFor(() => {
        expect(capturedPreferences.pageSize).toBe(50);
      });
    });

    it("should update bytesStringBase2", async () => {
      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences.bytesStringBase2).toBe(false);
      });

      act(() => {
        capturedPreferences.setByteStringBase("true");
      });

      await waitFor(() => {
        expect(capturedPreferences.bytesStringBase2).toBe(true);
      });

      act(() => {
        capturedPreferences.setByteStringBase("false");
      });

      await waitFor(() => {
        expect(capturedPreferences.bytesStringBase2).toBe(false);
      });
    });

    it("should update defaultSnapshotViewAll", async () => {
      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences.defaultSnapshotViewAll).toBe(false);
      });

      act(() => {
        capturedPreferences.setDefaultSnapshotViewAll(true);
      });

      await waitFor(() => {
        expect(capturedPreferences.defaultSnapshotViewAll).toBe(true);
      });

      // Verify API was called with correct data
      const lastPutRequest = axiosMock.history.put[axiosMock.history.put.length - 1];
      const sentData = JSON.parse(lastPutRequest.data);
      expect(sentData.defaultSnapshotViewAll).toBe(true);

      // Test setting it back to false
      act(() => {
        capturedPreferences.setDefaultSnapshotViewAll(false);
      });

      await waitFor(() => {
        expect(capturedPreferences.defaultSnapshotViewAll).toBe(false);
      });
    });
  });

  describe("Theme synchronization", () => {
    it("should properly clean and set HTML classes", async () => {
      // Set some initial classes
      document.documentElement.className = "some-class another-class light fs-6";

      axiosMock.onGet("/api/v1/ui-preferences").reply(200, {
        theme: "dark",
        fontSize: "fs-5",
      });
      axiosMock.onPut("/api/v1/ui-preferences").reply(200);

      render(
        <UIPreferenceProvider>
          <TestComponent onMount={() => {}} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        // All previous classes should be removed
        expect(document.documentElement.classList.contains("some-class")).toBe(false);
        expect(document.documentElement.classList.contains("another-class")).toBe(false);
        expect(document.documentElement.classList.contains("light")).toBe(false);
        expect(document.documentElement.classList.contains("fs-6")).toBe(false);

        // New classes should be added
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(document.documentElement.classList.contains("fs-5")).toBe(true);
        expect(document.documentElement.classList.length).toBe(2);
      });
    });
  });

  describe("Error handling", () => {
    it("should handle API save errors gracefully", async () => {
      // Mock console.error to avoid noise in test output
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      axiosMock.onGet("/api/v1/ui-preferences").reply(200, {
        pageSize: 10,
        theme: "light",
        fontSize: "fs-6",
      });
      axiosMock.onPut("/api/v1/ui-preferences").reply(500);

      let capturedPreferences;
      render(
        <UIPreferenceProvider>
          <TestComponent onMount={(prefs) => (capturedPreferences = prefs)} />
        </UIPreferenceProvider>,
      );

      await waitFor(() => {
        expect(capturedPreferences).toBeDefined();
      });

      act(() => {
        capturedPreferences.setTheme("dark");
      });

      await waitFor(() => {
        // Even if save fails, local state should update
        expect(capturedPreferences.theme).toBe("dark");
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe("PAGE_SIZES constant", () => {
    it("should export expected page sizes", () => {
      expect(PAGE_SIZES).toEqual([10, 20, 30, 40, 50, 100]);
    });
  });
});
