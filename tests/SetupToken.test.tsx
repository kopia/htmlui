import { render, act } from '@testing-library/react';
import { createRef } from 'react';
import { SetupToken } from '../src/components/Setup/SetupToken';
import { changeControlValue } from './testutils';
import { it, expect } from 'vitest';

it('can set fields', async () => {
  let ref = createRef<SetupToken>();
  const { getByTestId } = render(<SetupToken ref={ref} />)

  act(() => {
    expect(ref.current).not.toBeNull();
    expect(ref.current!.validate()).toBe(false);
  });

  expect(ref.current).not.toBeNull();
  // required
  changeControlValue(getByTestId("control-token"), "some-token");
  expect(ref.current!.validate()).toBe(true);

  expect(ref.current!.state).toStrictEqual({
    "token": "some-token",
  });
});
