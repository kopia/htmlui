import { render, act } from '@testing-library/react';
import { createRef } from 'react';
import { SetupAzure } from '../src/components/Setup/SetupAzure';
import { changeControlValue } from './testutils';
import { it, expect } from 'vitest';

it('can set fields', async () => {
  let ref = createRef<SetupAzure>();
  const { getByTestId } = render(<SetupAzure ref={ref} />)

  act(() => {
    expect(ref.current).not.toBeNull();
    expect(ref.current!.validate()).toBe(false);
  });

  expect(ref.current).not.toBeNull();
  // required
  changeControlValue(getByTestId("control-container"), "some-container");
  changeControlValue(getByTestId("control-storageAccount"), "some-storageAccount");
  expect(ref.current!.validate()).toBe(true);
  // optional
  changeControlValue(getByTestId("control-storageKey"), "some-storageKey");
  changeControlValue(getByTestId("control-sasToken"), "some-sas-token");
  changeControlValue(getByTestId("control-storageDomain"), "some-storage-domain");
  changeControlValue(getByTestId("control-prefix"), "some-prefix");
  expect(ref.current!.validate()).toBe(true);

  expect(ref.current!.state).toStrictEqual({
    "storageAccount": "some-storageAccount",
    "container": "some-container",
    "prefix": "some-prefix",
    "storageKey": "some-storageKey",
    "sasToken": "some-sas-token",
    "storageDomain": "some-storage-domain",
  });
});
