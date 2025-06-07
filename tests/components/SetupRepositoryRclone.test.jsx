import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryRclone } from "../../src/components/SetupRepositoryRclone";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryRclone ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-remotePath"), { target: { value: "myremote:path/to/repo" } });
  expect(ref.current.validate()).toBe(true);
  // optional
  fireEvent.change(getByTestId("control-rcloneExe"), { target: { value: "/usr/bin/rclone" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    remotePath: "myremote:path/to/repo",
    rcloneExe: "/usr/bin/rclone",
  });
});
