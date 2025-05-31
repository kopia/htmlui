import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryB2 } from "../../src/components/SetupRepositoryB2";
import { changeControlValue } from "../testutils";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryB2 ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-bucket"), "some-bucket");
  changeControlValue(getByTestId("control-keyId"), "some-key-id");
  changeControlValue(getByTestId("control-key"), "some-key");
  expect(ref.current.validate()).toBe(true);
  // optional
  changeControlValue(getByTestId("control-prefix"), "some-prefix");
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    bucket: "some-bucket",
    keyId: "some-key-id",
    key: "some-key",
    prefix: "some-prefix",
  });
});
