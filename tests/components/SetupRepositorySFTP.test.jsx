import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositorySFTP } from "../../src/components/SetupRepositorySFTP";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositorySFTP ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-host"), { target: { value: "some-host" } });
  fireEvent.change(getByTestId("control-port"), { target: { value: "22" } });
  fireEvent.change(getByTestId("control-path"), { target: { value: "some-path" } });
  fireEvent.change(getByTestId("control-username"), { target: { value: "some-username" } });
  fireEvent.change(getByTestId("control-keyfile"), { target: { value: "some-keyfile" } });
  fireEvent.change(getByTestId("control-knownHostsFile"), { target: { value: "some-knownHostsFile" } });
  act(() => expect(ref.current.validate()).toBe(true));

  // key file + known hosts file
  expect(ref.current.state).toStrictEqual({
    host: "some-host",
    username: "some-username",
    keyfile: "some-keyfile",
    knownHostsFile: "some-knownHostsFile",
    path: "some-path",
    port: 22,
    validated: true,
  });

  // now enter key data instead of key file, make sure validation triggers along the way
  fireEvent.change(getByTestId("control-keyData"), { target: { value: "some-keyData" } });
  act(() => expect(ref.current.validate()).toBe(false));
  fireEvent.change(getByTestId("control-keyfile"), { target: { value: "" } });
  act(() => expect(ref.current.validate()).toBe(true));

  // key data + known hosts file
  expect(ref.current.state).toStrictEqual({
    host: "some-host",
    username: "some-username",
    keyfile: "",
    keyData: "some-keyData",
    knownHostsFile: "some-knownHostsFile",
    path: "some-path",
    port: 22,
    validated: true,
  });

  fireEvent.change(getByTestId("control-password"), { target: { value: "some-password" } });
  act(() => expect(ref.current.validate()).toBe(false));
  fireEvent.change(getByTestId("control-keyData"), { target: { value: "" } });
  act(() => expect(ref.current.validate()).toBe(true));

  fireEvent.change(getByTestId("control-knownHostsData"), { target: { value: "some-knownHostsData" } });
  act(() => expect(ref.current.validate()).toBe(false));
  fireEvent.change(getByTestId("control-knownHostsFile"), { target: { value: "" } });
  act(() => expect(ref.current.validate()).toBe(true));

  // known hosts data + password
  expect(ref.current.state).toStrictEqual({
    host: "some-host",
    username: "some-username",
    password: "some-password",
    keyfile: "",
    keyData: "",
    knownHostsFile: "",
    knownHostsData: "some-knownHostsData",
    path: "some-path",
    port: 22,
    validated: true,
  });
});
