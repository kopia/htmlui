import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryGCS } from "../../src/components/SetupRepositoryGCS";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryGCS ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-bucket"), { target: { value: "some-bucket" } });
  expect(ref.current.validate()).toBe(true);
  // optional
  fireEvent.change(getByTestId("control-prefix"), { target: { value: "some-prefix" } });
  fireEvent.change(getByTestId("control-credentialsFile"), { target: { value: "some-credentials-file" } });
  fireEvent.change(getByTestId("control-credentials"), { target: { value: "some-credentials" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    bucket: "some-bucket",
    credentials: "some-credentials",
    credentialsFile: "some-credentials-file",
    prefix: "some-prefix",
  });
});
