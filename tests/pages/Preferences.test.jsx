import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Preferences } from "../../src/pages/Preferences";
import React from "react";
import { setupAPIMock } from "../testutils/api-mocks";

let axiosMock;

/**
 * Setup API mocks before each test
 */
beforeEach(() => {
  axiosMock = setupAPIMock();
  // Add mock for notification profiles endpoint that NotificationEditor uses
  axiosMock.onGet("/api/v1/notificationProfiles").reply(200, []);

  render(<Preferences />);
});

/**
 * Clean up after each test
 */
afterEach(() => {
  axiosMock.reset();
});

/**
 *
 */
describe("Select the light theme", () => {
  test("Should select light theme", () => {
    userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Select theme" }),
      screen.getByRole("option", { name: "light" }),
    );

    expect(screen.getByRole("option", { name: "light" }).selected).toBe(true);
  });
});

/**
 *
 */
describe("Test number of themes", () => {
  test("Should have four themes", () => {
    let theme = screen.getByRole("combobox", { name: "Select theme" });
    expect(theme).toHaveLength(4);
  });
});

/**
 *
 */
describe("Test byte representation", () => {
  test("Should have two options", () => {
    let theme = screen.getByRole("combobox", {
      name: "Select byte representation",
    });
    expect(theme).toHaveLength(2);
  });
});

/**
 * The mount backend selector is only shown when the server runs on macOS.
 */
describe("Mount backend", () => {
  test("Should be hidden when the server is not macOS", async () => {
    // default mock for /api/v1/cli has no "os"
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole("tab", { name: "Mounting" })).toBeNull();
  });

  test("Should offer fuse and webdav on macOS", async () => {
    axiosMock.onGet("/api/v1/cli").reply(200, { executable: "kopia", os: "darwin" });
    render(<Preferences />);

    const tab = await screen.findByRole("tab", { name: "Mounting" });
    await userEvent.click(tab);

    const select = screen.getByRole("combobox", { name: "Select mount backend" });
    expect(select).toHaveLength(2);
    expect(select.value).toBe("fuse");
  });
});
