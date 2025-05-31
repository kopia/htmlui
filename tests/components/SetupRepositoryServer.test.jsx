import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryServer } from "../../src/components/SetupRepositoryServer";
import { changeControlValue } from "../testutils";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryServer ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-url"), "https://kopia.example.com:51515");
  expect(ref.current.validate()).toBe(true);
  // optional
  changeControlValue(getByTestId("control-serverCertFingerprint"), "sha256:abcd1234567890");
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    url: "https://kopia.example.com:51515",
    serverCertFingerprint: "sha256:abcd1234567890",
  });
});
