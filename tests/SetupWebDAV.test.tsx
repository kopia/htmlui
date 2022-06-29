import { render, act } from '@testing-library/react';
import { createRef } from 'react';
import { SetupWebDAV } from '../src/components/Setup/SetupWebDAV';
import { changeControlValue } from './testutils';
import { it, expect } from 'vitest';

it('can set fields', async () => {
  let ref = createRef<SetupWebDAV>();
  const { getByTestId } = render(<SetupWebDAV ref={ref} />)

  act(() => {
    expect(ref.current).not.toBeNull();
    expect(ref.current!.validate()).toBe(false);
  });

  expect(ref.current).not.toBeNull();
  // required
  changeControlValue(getByTestId("control-url"), "some-url");
  expect(ref.current!.validate()).toBe(true);

  // optional
  changeControlValue(getByTestId("control-username"), "some-username");
  changeControlValue(getByTestId("control-password"), "some-password");
  expect(ref.current!.validate()).toBe(true);

  expect(ref.current!.state).toStrictEqual({
    "url": "some-url",
    "username": "some-username",
    "password": "some-password",
  });
});
