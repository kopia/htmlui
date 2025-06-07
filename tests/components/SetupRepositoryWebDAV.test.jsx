import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryWebDAV } from "../../src/components/SetupRepositoryWebDAV";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryWebDAV ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));

  // required
  fireEvent.change(getByTestId("control-url"), { target: { value: "some-url" } });
  expect(ref.current.validate()).toBe(true);

  // optional
  fireEvent.change(getByTestId("control-username"), { target: { value: "some-username" } });
  fireEvent.change(getByTestId("control-password"), { target: { value: "some-password" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    url: "some-url",
    username: "some-username",
    password: "some-password",
  });
});
