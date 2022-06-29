import { render, act } from '@testing-library/react';
import { createRef } from 'react';
import { SetupS3 } from '../src/components/Setup/SetupS3';
import { changeControlValue, toggleCheckbox } from './testutils';
import { it, expect } from 'vitest';

it('can set fields', async () => {
  let ref = createRef<SetupS3>();
  const { getByTestId } = render(<SetupS3 ref={ref} />)

  act(() => {
    expect(ref.current).not.toBeNull();
    expect(ref.current!.validate()).toBe(false);
  });

  expect(ref.current).not.toBeNull();
  // required
  changeControlValue(getByTestId("control-bucket"), "some-bucket");
  changeControlValue(getByTestId("control-accessKeyID"), "some-accessKeyID");
  changeControlValue(getByTestId("control-secretAccessKey"), "some-secretAccessKey");
  changeControlValue(getByTestId("control-endpoint"), "some-endpoint");
  act(() => expect(ref.current!.validate()).toBe(true));
  // optional
  toggleCheckbox(getByTestId("control-doNotUseTLS"));
  toggleCheckbox(getByTestId("control-doNotVerifyTLS"));
  changeControlValue(getByTestId("control-prefix"), "some-prefix");
  changeControlValue(getByTestId("control-sessionToken"), "some-sessionToken");
  changeControlValue(getByTestId("control-region"), "some-region");
  act(() => expect(ref.current!.validate()).toBe(true));

  expect(ref.current!.state).toStrictEqual({
    "accessKeyID": "some-accessKeyID",
    "bucket": "some-bucket",
    "endpoint": "some-endpoint",
    "prefix": "some-prefix",
    "region": "some-region",
    "doNotUseTLS": true,
    "doNotVerifyTLS": true,
    "secretAccessKey": "some-secretAccessKey",
    "sessionToken": "some-sessionToken",
  });

  toggleCheckbox(getByTestId("control-doNotUseTLS"));
  toggleCheckbox(getByTestId("control-doNotVerifyTLS"));
  expect(ref.current!.state.doNotUseTLS).toBe(false);
  expect(ref.current!.state.doNotVerifyTLS).toBe(false);
});
