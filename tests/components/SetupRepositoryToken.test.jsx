import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryToken } from "../../src/components/SetupRepositoryToken";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryToken ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-token"), { target: { value: "some-token" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    token: "some-token",
  });
});
