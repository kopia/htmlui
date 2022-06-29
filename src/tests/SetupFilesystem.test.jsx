import { render, act } from '@testing-library/react';
import React from 'react';
import { SetupFilesystem } from '../components/Setup/SetupFilesystem';
import { changeControlValue } from './testutils';

it('can set fields', async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupFilesystem ref={ref} />)

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-path"), "some-path");
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    path: 'some-path',
  });
});
