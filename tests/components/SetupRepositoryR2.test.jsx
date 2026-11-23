import { fireEvent, render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryR2 } from "../../src/components/SetupRepositoryR2";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryR2 ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-accountID"), { target: { value: "some-accountID" } });
  fireEvent.change(getByTestId("control-bucket"), { target: { value: "some-bucket" } });
  fireEvent.change(getByTestId("control-accessKeyID"), { target: { value: "some-accessKeyID" } });
  fireEvent.change(getByTestId("control-secretAccessKey"), { target: { value: "some-secretAccessKey" } });
  act(() => expect(ref.current.validate()).toBe(true));
  // optional
  fireEvent.change(getByTestId("control-jurisdiction"), { target: { value: "eu" } });
  fireEvent.change(getByTestId("control-endpoint"), { target: { value: "some-endpoint" } });
  fireEvent.click(getByTestId("control-doNotUseTLS"));
  fireEvent.click(getByTestId("control-doNotVerifyTLS"));
  fireEvent.change(getByTestId("control-prefix"), { target: { value: "some-prefix" } });
  fireEvent.change(getByTestId("control-sessionToken"), { target: { value: "some-sessionToken" } });
  act(() => expect(ref.current.validate()).toBe(true));

  expect(ref.current.state).toStrictEqual({
    accountID: "some-accountID",
    accessKeyID: "some-accessKeyID",
    bucket: "some-bucket",
    endpoint: "some-endpoint",
    prefix: "some-prefix",
    jurisdiction: "eu",
    doNotUseTLS: true,
    doNotVerifyTLS: true,
    secretAccessKey: "some-secretAccessKey",
    sessionToken: "some-sessionToken",
  });

  fireEvent.click(getByTestId("control-doNotUseTLS"));
  fireEvent.click(getByTestId("control-doNotVerifyTLS"));
  expect(ref.current.state.doNotUseTLS).toBe(false);
  expect(ref.current.state.doNotVerifyTLS).toBe(false);
});
