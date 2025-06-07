import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryB2 } from "../../src/components/SetupRepositoryB2";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryB2 ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-bucket"), { target: { value: "some-bucket" } });
  fireEvent.change(getByTestId("control-keyId"), { target: { value: "some-key-id" } });
  fireEvent.change(getByTestId("control-key"), { target: { value: "some-key" } });
  expect(ref.current.validate()).toBe(true);
  // optional
  fireEvent.change(getByTestId("control-prefix"), { target: { value: "some-prefix" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    bucket: "some-bucket",
    keyId: "some-key-id",
    key: "some-key",
    prefix: "some-prefix",
  });
});
