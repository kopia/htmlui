import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryS3 } from "../../src/components/SetupRepositoryS3";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryS3 ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-bucket"), { target: { value: "some-bucket" } });
  fireEvent.change(getByTestId("control-accessKeyID"), { target: { value: "some-accessKeyID" } });
  fireEvent.change(getByTestId("control-secretAccessKey"), { target: { value: "some-secretAccessKey" } });
  fireEvent.change(getByTestId("control-endpoint"), { target: { value: "some-endpoint" } });
  act(() => expect(ref.current.validate()).toBe(true));
  // optional
  fireEvent.click(getByTestId("control-doNotUseTLS"));
  fireEvent.click(getByTestId("control-doNotVerifyTLS"));
  fireEvent.change(getByTestId("control-prefix"), { target: { value: "some-prefix" } });
  fireEvent.change(getByTestId("control-sessionToken"), { target: { value: "some-sessionToken" } });
  fireEvent.change(getByTestId("control-region"), { target: { value: "some-region" } });
  act(() => expect(ref.current.validate()).toBe(true));

  expect(ref.current.state).toStrictEqual({
    accessKeyID: "some-accessKeyID",
    bucket: "some-bucket",
    endpoint: "some-endpoint",
    prefix: "some-prefix",
    region: "some-region",
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
