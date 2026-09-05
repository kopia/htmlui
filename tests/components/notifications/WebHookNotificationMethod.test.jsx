import { render, act } from "@testing-library/react";
import React from "react";
import { WebHookNotificationMethod } from "../../../src/components/notifications/WebHookNotificationMethod";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<WebHookNotificationMethod ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-endpoint"), { target: { value: "http://some-endpoint:12345" } });
  expect(ref.current.validate()).toBe(true);
  // optional
  fireEvent.change(getByTestId("control-headers"), { target: { value: "some:header\nanother:header" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    endpoint: "http://some-endpoint:12345",
    method: "POST",
    format: "txt",
    headers: "some:header\nanother:header",
    discord: false
  });
});

describe("Discord functionality", () => {
  it("toggles Discord correctly and updates related fields", async () => {
    let ref = React.createRef();
    const { getByTestId } = render(<WebHookNotificationMethod ref={ref} />);

    // Fill endpoint first so validation passes
    fireEvent.change(getByTestId("control-endpoint"), {
      target: { value: "http://some-endpoint:12345" },
    });
    expect(ref.current.validate()).toBe(true);

    const discordCheckbox = getByTestId("discord");
    const methodSelect = getByTestId("http-method");
    const headersTextarea = getByTestId("control-headers");
    const formatSelect = getByTestId("notification-format");

    // Initially, Discord unchecked
    expect(discordCheckbox.checked).toBe(false);
    expect(methodSelect.value).toBe("POST");
    expect(methodSelect.disabled).toBe(false);
    expect(headersTextarea.disabled).toBe(false);
    expect(formatSelect.value).toBe("txt");

    // Toggle Discord ON
    fireEvent.click(discordCheckbox);

    expect(discordCheckbox.checked).toBe(true);
    expect(methodSelect.value).toBe("POST");           // HTTP method forced to POST
    expect(methodSelect.disabled).toBe(true);          // method disabled
    expect(headersTextarea.disabled).toBe(true);       // headers disabled
    expect(formatSelect.value).toBe("txt");            // format locked to plain text

    // Toggle Discord OFF
    fireEvent.click(discordCheckbox);

    expect(discordCheckbox.checked).toBe(false);
    expect(methodSelect.disabled).toBe(false);
    expect(headersTextarea.disabled).toBe(false);
  });
});