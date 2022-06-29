import { render, act } from '@testing-library/react';
import { createRef } from 'react';
import { SetupGCS } from '../src/components/Setup/SetupGCS';
import { changeControlValue } from './testutils';
import { it, expect } from 'vitest';

it('can set fields', async () => {
  let ref = createRef<SetupGCS>();
  const { getByTestId } = render(<SetupGCS ref={ref} />)

  act(() => {
    expect(ref.current).not.toBeNull();
    expect(ref.current!.validate()).toBe(false);
  });

  expect(ref.current).not.toBeNull();
  // required
  changeControlValue(getByTestId("control-bucket"), "some-bucket");
  expect(ref.current!.validate()).toBe(true);
  // optional
  changeControlValue(getByTestId("control-prefix"), "some-prefix");
  changeControlValue(getByTestId("control-credentialsFile"), "some-credentials-file");
  changeControlValue(getByTestId("control-credentials"), "some-credentials");
  expect(ref.current!.validate()).toBe(true);

  expect(ref.current!.state).toStrictEqual({
    "bucket": "some-bucket",
    "credentials": "some-credentials",
    "credentialsFile": "some-credentials-file",
    "prefix": "some-prefix",
  });
});
