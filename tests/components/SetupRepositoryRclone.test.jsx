import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryRclone } from "../../src/components/SetupRepositoryRclone";
import { changeControlValue } from "../testutils";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryRclone ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-remotePath"), "myremote:path/to/repo");
  expect(ref.current.validate()).toBe(true);
  // optional
  changeControlValue(getByTestId("control-rcloneExe"), "/usr/bin/rclone");
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    remotePath: "myremote:path/to/repo",
    rcloneExe: "/usr/bin/rclone",
  });
});
