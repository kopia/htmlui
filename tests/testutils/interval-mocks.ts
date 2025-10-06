import { vi } from "vitest";
import "@testing-library/jest-dom";

let intervalSpy;
let clearIntervalSpy;
let intervalCallbacks: { id: number, callback, delay }[] = [];
let intervalId = 0;

/**
 * Sets up interval mocking for tests
 */
export function setupIntervalMocks() {
  // Mock setInterval and clearInterval to control timing
  intervalCallbacks = [];
  intervalId = 0;

  intervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback, delay) => {
    const id = ++intervalId;
    intervalCallbacks.push({ id, callback, delay });
    return id as unknown as ReturnType<typeof setInterval>;
  });

  clearIntervalSpy = vi.spyOn(window, "clearInterval").mockImplementation((id) => {
    intervalCallbacks = intervalCallbacks.filter((item) => item.id !== id);
  });

  return { intervalSpy, clearIntervalSpy };
}

/**
 * Cleans up interval mocks
 */
export function cleanupIntervalMocks() {
  if (intervalSpy) {
    intervalSpy.mockRestore();
  }
  if (clearIntervalSpy) {
    clearIntervalSpy.mockRestore();
  }
  intervalCallbacks = [];
}

/**
 * Gets the current mock spies (useful for verification in tests)
 */
export function getIntervalMockSpies() {
  return { intervalSpy, clearIntervalSpy };
}

/**
 * Triggers all active interval callbacks manually
 */
export async function triggerIntervals() {
  const { act } = await import("@testing-library/react");
  await act(async () => {
    intervalCallbacks.forEach(({ callback }: { callback: () => void }) => {
      callback();
    });
  });
}

/**
 * Helper function to wait for component to load and then trigger intervals
 * @param expectedText - Text to wait for before triggering intervals
 */
export async function waitForLoadAndTriggerIntervals(expectedText: RegExp | string) {
  const { waitFor, screen, act } = await import("@testing-library/react");

  // Wait for the component to load first
  await waitFor(() => {
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  // Give the component a moment to stabilize after initial load
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  // Now trigger intervals to simulate polling
  await triggerIntervals();
}

/**
 * Gets the current interval callbacks (useful for testing)
 */
export function getIntervalCallbacks() {
  return intervalCallbacks;
}
