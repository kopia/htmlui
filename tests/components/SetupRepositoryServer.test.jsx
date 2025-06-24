import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryServer } from "../../src/components/SetupRepositoryServer";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryServer ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-url"), { target: { value: "https://kopia.example.com:51515" } });
  expect(ref.current.validate()).toBe(true);
  // optional
  fireEvent.change(getByTestId("control-serverCertFingerprint"), { target: { value: "sha256:abcd1234567890" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    url: "https://kopia.example.com:51515",
    serverCertFingerprint: "sha256:abcd1234567890",
  });
});
