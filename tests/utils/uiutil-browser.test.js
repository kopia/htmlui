import { vi } from "vitest";
import { redirect, errorAlert } from "../../src/utils/uiutil";

describe("redirect", () => {
  const originalLocation = window.location;

  beforeAll(() => {
    // Mock window.location.replace
    delete window.location;
    window.location = { replace: vi.fn() };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    window.location.replace.mockClear();
  });

  it("redirects to /repo when error code is NOT_CONNECTED", () => {
    const error = {
      response: {
        data: {
          code: "NOT_CONNECTED",
        },
      },
    };

    redirect(error);

    expect(window.location.replace).toHaveBeenCalledWith("/repo");
  });

  it("does not redirect for other error codes", () => {
    const error = {
      response: {
        data: {
          code: "OTHER_ERROR",
        },
      },
    };

    redirect(error);

    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it("does not redirect when no error response", () => {
    redirect(null);
    redirect(undefined);
    redirect({});
    redirect({ response: {} });
    redirect({ response: { data: {} } });

    expect(window.location.replace).not.toHaveBeenCalled();
  });
});

describe("errorAlert", () => {
  const originalAlert = window.alert;

  beforeAll(() => {
    window.alert = vi.fn();
  });

  afterAll(() => {
    window.alert = originalAlert;
  });

  beforeEach(() => {
    window.alert.mockClear();
  });

  it("shows error message from response data", () => {
    const error = {
      response: {
        data: {
          error: "Network connection failed",
        },
      },
    };

    errorAlert(error, "Connection");

    expect(window.alert).toHaveBeenCalledWith("Connection: Network connection failed");
  });

  it("shows error message from Error object", () => {
    const error = new Error("Something went wrong");

    errorAlert(error);

    expect(window.alert).toHaveBeenCalledWith(error);
  });

  it("shows JSON stringified error for other types", () => {
    const error = { customError: "Custom error message" };

    errorAlert(error);

    expect(window.alert).toHaveBeenCalledWith('Error: {"customError":"Custom error message"}');
  });

  it("uses custom prefix when provided", () => {
    const error = {
      response: {
        data: {
          error: "Validation failed",
        },
      },
    };

    errorAlert(error, "Validation Error");

    expect(window.alert).toHaveBeenCalledWith("Validation Error: Validation failed");
  });

  it("uses default prefix when not provided", () => {
    const error = {
      response: {
        data: {
          error: "Unknown error",
        },
      },
    };

    errorAlert(error);

    expect(window.alert).toHaveBeenCalledWith("Error: Unknown error");
  });
});
