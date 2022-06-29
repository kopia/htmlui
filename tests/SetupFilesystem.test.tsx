import { render, act } from '@testing-library/react';
import { createRef } from 'react';
import { SetupFilesystem } from '../src/components/Setup/SetupFilesystem';
import { changeControlValue } from './testutils';
import { it, expect } from 'vitest';

it('can set fields', async () => {
  let ref = createRef<SetupFilesystem>();
  const { getByTestId } = render(<SetupFilesystem ref={ref} />)

  act(() => {
    expect(ref.current).not.toBeNull();
    expect(ref.current!.validate()).toBe(false);
  });

  // required
  changeControlValue(getByTestId("control-path"), "some-path");
  expect(ref.current).not.toBeNull();
  expect(ref.current!.validate()).toBe(true);

  expect(ref.current!.state).toStrictEqual({
    path: 'some-path',
  });
});
