import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryFilesystem } from "../../src/components/SetupRepositoryFilesystem";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryFilesystem ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-path"), { target: { value: "some-path" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    path: "some-path",
  });
});
