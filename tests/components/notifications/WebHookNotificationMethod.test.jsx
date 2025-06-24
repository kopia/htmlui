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
  });
});
