import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Preferences } from "../../src/pages/Preferences";
import React from "react";

/**
 *
 */
beforeEach(() => {
  render(<Preferences />);
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
