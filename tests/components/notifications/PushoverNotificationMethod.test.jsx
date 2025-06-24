import { render, act } from "@testing-library/react";
import React from "react";
import { PushoverNotificationMethod } from "../../../src/components/notifications/PushoverNotificationMethod";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<PushoverNotificationMethod ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-appToken"), { target: { value: "some-appToken" } });
  fireEvent.change(getByTestId("control-userKey"), { target: { value: "some-userKey" } });
  expect(ref.current.validate()).toBe(true);
  // optional
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    appToken: "some-appToken",
    userKey: "some-userKey",
    format: "txt",
  });
});
