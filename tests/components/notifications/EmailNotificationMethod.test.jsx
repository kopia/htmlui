import { render, act } from "@testing-library/react";
import React from "react";
import { EmailNotificationMethod } from "../../../src/components/notifications/EmailNotificationMethod";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<EmailNotificationMethod ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-smtpServer"), { target: { value: "some-smtpServer" } });
  fireEvent.change(getByTestId("control-smtpPort"), { target: { value: 25 } });
  fireEvent.change(getByTestId("control-from"), { target: { value: "some-from@example.com" } });
  fireEvent.change(getByTestId("control-to"), { target: { value: "some-to@example.com" } });
  expect(ref.current.validate()).toBe(true);
  // optional
  fireEvent.change(getByTestId("control-smtpUsername"), { target: { value: "some-username" } });
  fireEvent.change(getByTestId("control-smtpPassword"), { target: { value: "some-password" } });
  fireEvent.change(getByTestId("control-smtpIdentity"), { target: { value: "some-identity" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    smtpServer: "some-smtpServer",
    smtpPort: 25,
    smtpUsername: "some-username",
    smtpPassword: "some-password",
    smtpIdentity: "some-identity",
    from: "some-from@example.com",
    to: "some-to@example.com",
    format: "txt",
  });
});
