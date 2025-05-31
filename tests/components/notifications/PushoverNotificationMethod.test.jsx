import { render, act } from "@testing-library/react";
import React from "react";
import { PushoverNotificationMethod } from "../../../src/components/notifications/PushoverNotificationMethod";
import { changeControlValue } from "../../testutils";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<PushoverNotificationMethod ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-appToken"), "some-appToken");
  changeControlValue(getByTestId("control-userKey"), "some-userKey");
  expect(ref.current.validate()).toBe(true);
  // optional
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    appToken: "some-appToken",
    userKey: "some-userKey",
    format: "txt",
  });
});
