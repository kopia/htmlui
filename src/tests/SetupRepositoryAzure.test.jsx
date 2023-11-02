import { render, act } from '@testing-library/react';
import React from 'react';
import { SetupRepositoryAzure } from '../components/SetupRepositoryAzure';
import { changeControlValue } from './testutils';

it('can set fields', async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryAzure ref={ref} />)

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-container"), "some-container");
  changeControlValue(getByTestId("control-storageAccount"), "some-storageAccount");
  expect(ref.current.validate()).toBe(true);
  // optional
  changeControlValue(getByTestId("control-storageKey"), "some-storageKey");
  changeControlValue(getByTestId("control-sasToken"), "some-sas-token");
  changeControlValue(getByTestId("control-storageDomain"), "some-storage-domain");
  changeControlValue(getByTestId("control-prefix"), "some-prefix");
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    "storageAccount": "some-storageAccount",
    "container": "some-container",
    "prefix": "some-prefix",
    "storageKey": "some-storageKey",
    "sasToken": "some-sas-token",
    "storageDomain": "some-storage-domain",
  });
});
