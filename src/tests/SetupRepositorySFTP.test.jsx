import { render, act } from '@testing-library/react';
import React from 'react';
import { SetupRepositorySFTP } from '../components/SetupRepositorySFTP';
import { changeControlValue } from './testutils';

it('can set fields', async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositorySFTP ref={ref} />)

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-host"), "some-host");
  changeControlValue(getByTestId("control-port"), "22");
  changeControlValue(getByTestId("control-path"), "some-path");
  changeControlValue(getByTestId("control-username"), "some-username");
  changeControlValue(getByTestId("control-keyfile"), "some-keyfile");
  changeControlValue(getByTestId("control-knownHostsFile"), "some-knownHostsFile");
  act(() => expect(ref.current.validate()).toBe(true));

  // key file + known hosts file
  expect(ref.current.state).toStrictEqual({
    "host": "some-host",
    "username": "some-username",
    "keyfile": "some-keyfile",
    "knownHostsFile": "some-knownHostsFile",
    "path": "some-path",
    "port": 22,
    "validated": true,
  });

  // now enter key data instead of key file, make sure validation triggers along the way
  changeControlValue(getByTestId("control-keyData"), "some-keyData");
  act(() => expect(ref.current.validate()).toBe(false));
  changeControlValue(getByTestId("control-keyfile"), "");
  act(() => expect(ref.current.validate()).toBe(true));

  // key data + known hosts file
  expect(ref.current.state).toStrictEqual({
    "host": "some-host",
    "username": "some-username",
    "keyfile": "",
    "keyData": "some-keyData",
    "knownHostsFile": "some-knownHostsFile",
    "path": "some-path",
    "port": 22,
    "validated": true,
  });

  changeControlValue(getByTestId("control-password"), "some-password");
  act(() => expect(ref.current.validate()).toBe(false));
  changeControlValue(getByTestId("control-keyData"), "");
  act(() => expect(ref.current.validate()).toBe(true));

  changeControlValue(getByTestId("control-knownHostsData"), "some-knownHostsData");
  act(() => expect(ref.current.validate()).toBe(false));
  changeControlValue(getByTestId("control-knownHostsFile"), "");
  act(() => expect(ref.current.validate()).toBe(true));

  // known hosts data + password
  expect(ref.current.state).toStrictEqual({
    "host": "some-host",
    "username": "some-username",
    "password": "some-password",
    "keyfile": "",
    "keyData": "",
    "knownHostsFile": "",
    "knownHostsData": "some-knownHostsData",
    "path": "some-path",
    "port": 22,
    "validated": true,
  });
});
